'use client';

import { useState, useEffect } from 'react';
import { PlaybookCard } from './PlaybookCard';
import { usePlaybookStore } from '@/store/playbookStore';

interface PlaybooksGridProps {
  workspaceId: string;
  userId: string;
  onOpenPlaybook: (playbookId: string) => void;
  onCreatePlaybook: () => void;
}

export function PlaybooksGrid({ workspaceId, userId, onOpenPlaybook, onCreatePlaybook }: PlaybooksGridProps) {
  const {
    playbooks,
    isLoading,
    error,
    fetchPlaybooks,
    deletePlaybook,
    duplicatePlaybook,
  } = usePlaybookStore();

  useEffect(() => {
    if (workspaceId) {
      fetchPlaybooks(workspaceId);
    }
  }, [workspaceId, fetchPlaybooks]);

  const handleDuplicate = async (playbookId: string) => {
    try {
      await duplicatePlaybook(playbookId, workspaceId, userId);
    } catch (err) {
      console.error('Failed to duplicate playbook:', err);
    }
  };

  const handleDelete = async (playbookId: string) => {
    try {
      await deletePlaybook(playbookId);
    } catch (err) {
      console.error('Failed to delete playbook:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => fetchPlaybooks(workspaceId)}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (playbooks.length === 0) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-lg font-medium mb-2">No Playbooks Yet</h3>
        <p className="text-zinc-400 mb-4">
          Create a playbook to organize your plays
        </p>
        <button
          onClick={onCreatePlaybook}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
        >
          Create Playbook
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">My Playbooks ({playbooks.length})</h3>
        <button
          onClick={onCreatePlaybook}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + New Playbook
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {playbooks.map((playbook) => (
          <PlaybookCard
            key={playbook.id}
            playbook={playbook}
            onOpen={onOpenPlaybook}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
