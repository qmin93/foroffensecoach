'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreatePlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, tags: string[]) => Promise<void>;
}

export function CreatePlaybookModal({ isOpen, onClose, onCreate }: CreatePlaybookModalProps) {
  const [name, setName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a playbook name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onCreate(name.trim(), tags);

      // Reset form and close
      setName('');
      setTagsInput('');
      onClose();
    } catch (err) {
      setError('Failed to create playbook');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName('');
    setTagsInput('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Create New Playbook</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-zinc-300">
              Playbook Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 2024 Season Playbook"
              className="mt-1 bg-zinc-800 border-zinc-700 text-white"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="tags" className="text-zinc-300">
              Tags (comma separated)
            </Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., offense, varsity, 2024"
              className="mt-1 bg-zinc-800 border-zinc-700 text-white"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Optional. Use tags to organize your playbooks.
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-blue-600 hover:bg-blue-500"
            >
              {isCreating ? 'Creating...' : 'Create Playbook'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
