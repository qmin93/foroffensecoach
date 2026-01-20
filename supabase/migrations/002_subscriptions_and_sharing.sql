-- ForOffenseCoach Database Schema Extension
-- Version: 1.1
-- Purpose: Add subscriptions, team_profiles, and shared_links tables
-- Based on: business plan.md, Formation recommendation.md, user flow spec.md

-- ============================================
-- 1. ADD stripe_customer_id TO PROFILES
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Index for faster Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- ============================================
-- 2. SUBSCRIPTIONS TABLE (Stripe Integration)
-- ============================================
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'team');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can modify subscriptions (via webhook)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. TEAM_PROFILES TABLE (Formation Recommendation)
-- ============================================
-- Based on Formation recommendation.md Section 3

CREATE TYPE run_pass_balance AS ENUM ('run_heavy', 'balanced', 'pass_heavy');
CREATE TYPE usage_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE risk_tolerance AS ENUM ('conservative', 'normal', 'aggressive');

CREATE TABLE IF NOT EXISTS team_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE,
  team_name TEXT NOT NULL,

  -- Roster Availability (JSONB for flexibility)
  -- Format: { "QB": { "count": 1, "starterQuality": 4 }, ... }
  roster_availability JSONB NOT NULL DEFAULT '{
    "QB": { "count": 1, "starterQuality": 3 },
    "RB": { "count": 2, "starterQuality": 3 },
    "FB": { "count": 0, "starterQuality": 0 },
    "WR": { "count": 4, "starterQuality": 3 },
    "TE": { "count": 1, "starterQuality": 3 },
    "OL": { "count": 7, "starterQuality": 3 }
  }',

  -- Unit Strength (JSONB for flexibility)
  -- Format: { "olRunBlock": 3, "olPassPro": 3, ... }
  unit_strength JSONB NOT NULL DEFAULT '{
    "olRunBlock": 3,
    "olPassPro": 3,
    "rbVision": 3,
    "wrSeparation": 3,
    "qbArm": 3,
    "qbDecision": 3,
    "teBlock": 3,
    "teRoute": 3
  }',

  -- Style Preferences (JSONB for flexibility)
  -- Format: { "runPassBalance": "balanced", ... }
  style_preferences JSONB NOT NULL DEFAULT '{
    "runPassBalance": "balanced",
    "underCenterUsage": "medium",
    "motionUsage": "medium",
    "tempo": "medium",
    "riskTolerance": "normal"
  }',

  notes TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_team_profiles_workspace ON team_profiles(workspace_id);

-- RLS for team_profiles
ALTER TABLE team_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view team profile"
  ON team_profiles FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can manage team profile"
  ON team_profiles FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_team_profiles_updated_at
  BEFORE UPDATE ON team_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 4. SHARED_LINKS TABLE (Share/Fork Flow)
-- ============================================
-- Based on user flow spec.md Flow E

CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Can share either a play or a playbook
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,

  -- Share token for URL
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),

  -- Permissions
  allow_fork BOOLEAN DEFAULT TRUE,
  allow_download BOOLEAN DEFAULT FALSE,

  -- Optional expiration
  expires_at TIMESTAMPTZ,

  -- View tracking
  view_count INTEGER DEFAULT 0,

  -- Creator info
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure at least one target is set
  CONSTRAINT shared_links_target_check CHECK (
    (play_id IS NOT NULL AND playbook_id IS NULL) OR
    (play_id IS NULL AND playbook_id IS NOT NULL)
  )
);

-- Index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_shared_links_token ON shared_links(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_links_play ON shared_links(play_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_playbook ON shared_links(playbook_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_expires ON shared_links(expires_at);

-- RLS for shared_links
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Anyone can view shared links (for public access)
CREATE POLICY "Anyone can view shared links by token"
  ON shared_links FOR SELECT
  USING (
    -- Link is not expired
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Creators can manage their shared links
CREATE POLICY "Creators can manage shared links"
  ON shared_links FOR ALL
  USING (created_by = auth.uid());

-- ============================================
-- 5. FORK_HISTORY TABLE (Attribution Tracking)
-- ============================================
-- Based on user flow spec.md Flow E - "원본 출처 메타 저장"

CREATE TABLE IF NOT EXISTS fork_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- The forked (new) play
  forked_play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,

  -- Original source
  source_play_id UUID REFERENCES plays(id) ON DELETE SET NULL,
  source_share_token TEXT,

  -- Who forked
  forked_by UUID NOT NULL REFERENCES profiles(id),
  forked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_fork_history_forked_play ON fork_history(forked_play_id);
CREATE INDEX IF NOT EXISTS idx_fork_history_source_play ON fork_history(source_play_id);

-- RLS for fork_history
ALTER TABLE fork_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fork history of their plays"
  ON fork_history FOR SELECT
  USING (
    forked_play_id IN (
      SELECT id FROM plays WHERE created_by = auth.uid()
    ) OR
    source_play_id IN (
      SELECT id FROM plays WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- 6. AUTO-CREATE SUBSCRIPTION ON USER SIGNUP
-- ============================================
-- Extend handle_new_user function to also create free subscription

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  -- Create personal workspace
  INSERT INTO workspaces (name, owner_id, type)
  VALUES ('My Playbooks', NEW.id, 'personal')
  RETURNING id INTO new_workspace_id;

  -- Create free subscription
  INSERT INTO subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to check if a share link is valid
CREATE OR REPLACE FUNCTION is_share_link_valid(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shared_links
    WHERE share_token = token
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_share_view(token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE shared_links
  SET view_count = view_count + 1
  WHERE share_token = token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscription tier
CREATE OR REPLACE FUNCTION get_user_tier(uid UUID)
RETURNS subscription_tier AS $$
DECLARE
  user_tier subscription_tier;
BEGIN
  SELECT tier INTO user_tier
  FROM subscriptions
  WHERE user_id = uid AND status = 'active';

  RETURN COALESCE(user_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. FEATURE LIMITS BY TIER
-- ============================================
-- Reference table for feature gating

CREATE TABLE IF NOT EXISTS tier_limits (
  tier subscription_tier PRIMARY KEY,
  max_plays INTEGER NOT NULL,
  max_playbooks INTEGER NOT NULL,
  pdf_watermark BOOLEAN NOT NULL,
  install_focus_full BOOLEAN NOT NULL,
  team_collaboration BOOLEAN NOT NULL,
  share_links_enabled BOOLEAN NOT NULL,
  fork_enabled BOOLEAN NOT NULL
);

-- Insert tier limits based on business plan.md
INSERT INTO tier_limits (tier, max_plays, max_playbooks, pdf_watermark, install_focus_full, team_collaboration, share_links_enabled, fork_enabled)
VALUES
  ('free', 10, 2, TRUE, FALSE, FALSE, TRUE, TRUE),
  ('pro', -1, -1, FALSE, TRUE, FALSE, TRUE, TRUE),  -- -1 means unlimited
  ('team', -1, -1, FALSE, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (tier) DO UPDATE SET
  max_plays = EXCLUDED.max_plays,
  max_playbooks = EXCLUDED.max_playbooks,
  pdf_watermark = EXCLUDED.pdf_watermark,
  install_focus_full = EXCLUDED.install_focus_full,
  team_collaboration = EXCLUDED.team_collaboration,
  share_links_enabled = EXCLUDED.share_links_enabled,
  fork_enabled = EXCLUDED.fork_enabled;

-- ============================================
-- 9. ANALYTICS/TELEMETRY TABLE (Optional)
-- ============================================
-- Based on prd.md Section 11 - Telemetry events

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);

-- RLS - only service role can write analytics
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage analytics"
  ON analytics_events FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables added:
-- 1. subscriptions (Stripe subscription tracking)
-- 2. team_profiles (Formation recommendation input)
-- 3. shared_links (Share/Fork functionality)
-- 4. fork_history (Attribution tracking)
-- 5. tier_limits (Feature gating reference)
-- 6. analytics_events (Telemetry tracking)
--
-- Columns added:
-- 1. profiles.stripe_customer_id
--
-- Functions added:
-- 1. is_share_link_valid()
-- 2. increment_share_view()
-- 3. get_user_tier()
--
-- Updated:
-- 1. handle_new_user() - now also creates free subscription
