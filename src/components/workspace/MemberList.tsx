'use client';

import { useState } from 'react';
import { TeamMember, TeamRole, ROLE_PERMISSIONS } from '@/lib/subscription';

interface MemberListProps {
  members: TeamMember[];
  currentUserId: string;
  canManageRoles: boolean;
  onRoleChange: (memberId: string, newRole: TeamRole) => void;
  onRemoveMember: (memberId: string) => void;
}

export function MemberList({
  members,
  currentUserId,
  canManageRoles,
  onRoleChange,
  onRemoveMember,
}: MemberListProps) {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const getRoleBadgeColor = (role: TeamRole): string => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'editor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'viewer':
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getRoleDescription = (role: TeamRole): string => {
    switch (role) {
      case 'owner':
        return 'Full access including billing and member management';
      case 'editor':
        return 'Can create, edit, and delete plays and playbooks';
      case 'viewer':
        return 'Can view plays and playbooks only';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId;
        const isOwner = member.role === 'owner';
        const isPending = !member.acceptedAt;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
          >
            {/* Member Info */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.displayName || member.email}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-zinc-400">
                    {(member.displayName || member.email)[0].toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name & Email */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {member.displayName || member.email}
                  </span>
                  {isCurrentUser && (
                    <span className="text-xs px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-400">
                      You
                    </span>
                  )}
                  {isPending && (
                    <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 rounded text-yellow-400 border border-yellow-500/30">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400">{member.email}</p>
              </div>
            </div>

            {/* Role & Actions */}
            <div className="flex items-center gap-3">
              {/* Role Badge/Selector */}
              {editingMemberId === member.id && canManageRoles && !isOwner ? (
                <select
                  value={member.role}
                  onChange={(e) => {
                    onRoleChange(member.id, e.target.value as TeamRole);
                    setEditingMemberId(null);
                  }}
                  onBlur={() => setEditingMemberId(null)}
                  autoFocus
                  className="px-3 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              ) : (
                <button
                  onClick={() =>
                    canManageRoles && !isOwner && setEditingMemberId(member.id)
                  }
                  disabled={!canManageRoles || isOwner}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${getRoleBadgeColor(
                    member.role
                  )} ${
                    canManageRoles && !isOwner
                      ? 'cursor-pointer hover:opacity-80'
                      : ''
                  }`}
                  title={getRoleDescription(member.role)}
                >
                  {member.role}
                </button>
              )}

              {/* Remove Button */}
              {canManageRoles && !isOwner && !isCurrentUser && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Remove member"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {members.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <p>No team members yet</p>
          <p className="text-sm mt-1">Invite members to collaborate</p>
        </div>
      )}
    </div>
  );
}

export default MemberList;
