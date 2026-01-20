-- ForOffenseCoach Database Schema
-- Version: 1.0
-- Matches TypeScript types in src/types/database.ts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 2. WORKSPACES
-- ============================================
CREATE TYPE workspace_type AS ENUM ('personal', 'team');

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type workspace_type DEFAULT 'personal',
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view workspace"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owner can update workspace"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- ============================================
-- 3. WORKSPACE MEMBERS
-- ============================================
CREATE TYPE workspace_role AS ENUM ('owner', 'editor', 'viewer');

CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'viewer',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(workspace_id, user_id)
);

-- RLS for workspace_members
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view membership"
  ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner can manage members"
  ON workspace_members FOR ALL
  USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- ============================================
-- 4. PLAYS
-- ============================================
CREATE TABLE IF NOT EXISTS plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL, -- Full DSL Play object
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_plays_workspace ON plays(workspace_id);
CREATE INDEX idx_plays_tags ON plays USING GIN(tags);
CREATE INDEX idx_plays_created_by ON plays(created_by);

-- RLS for plays
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view plays"
  ON plays FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create plays"
  ON plays FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update plays"
  ON plays FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can delete plays"
  ON plays FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- ============================================
-- 5. PLAYBOOKS
-- ============================================
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  sections JSONB DEFAULT '[]', -- Array of {id, name, order}
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_playbooks_workspace ON playbooks(workspace_id);
CREATE INDEX idx_playbooks_share_token ON playbooks(share_token);

-- RLS for playbooks
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view playbooks"
  ON playbooks FOR SELECT
  USING (
    is_public = TRUE OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can manage playbooks"
  ON playbooks FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- ============================================
-- 6. PLAYBOOK_PLAYS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS playbook_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
  section_id TEXT, -- References sections JSONB in playbooks
  order_index INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playbook_id, play_id)
);

-- Index for faster queries
CREATE INDEX idx_playbook_plays_playbook ON playbook_plays(playbook_id);
CREATE INDEX idx_playbook_plays_play ON playbook_plays(play_id);

-- RLS for playbook_plays
ALTER TABLE playbook_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view playbook_plays"
  ON playbook_plays FOR SELECT
  USING (
    playbook_id IN (SELECT id FROM playbooks WHERE is_public = TRUE) OR
    playbook_id IN (
      SELECT p.id FROM playbooks p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
      UNION
      SELECT p.id FROM playbooks p
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can manage playbook_plays"
  ON playbook_plays FOR ALL
  USING (
    playbook_id IN (
      SELECT p.id FROM playbooks p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
      UNION
      SELECT p.id FROM playbooks p
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.role IN ('owner', 'editor')
    )
  );

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_plays_updated_at
  BEFORE UPDATE ON plays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_playbooks_updated_at
  BEFORE UPDATE ON playbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile and personal workspace on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  -- Create personal workspace
  INSERT INTO workspaces (name, owner_id, is_personal)
  VALUES ('My Playbooks', NEW.id, TRUE)
  RETURNING id INTO new_workspace_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
