'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  createShareLink,
  getShareLinksForPlay,
  deleteShareLink,
  getShareUrl,
} from '@/lib/api/share';
import { Tables } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

type SharedLinkRow = Tables<'shared_links'>;

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  playId: string;
  playName: string;
  userId: string;
}

export function ShareModal({
  isOpen,
  onClose,
  playId,
  playName,
  userId,
}: ShareModalProps) {
  const [links, setLinks] = useState<SharedLinkRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Options for new link
  const [allowFork, setAllowFork] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && playId) {
      fetchLinks();
    }
  }, [isOpen, playId]);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const data = await getShareLinksForPlay(playId);
      setLinks(data);
    } catch (err) {
      console.error('Failed to fetch share links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = async () => {
    try {
      setIsCreating(true);
      const link = await createShareLink(playId, userId, {
        allowFork,
        expiresInDays: expiresInDays ?? undefined,
      });
      setLinks((prev) => [link, ...prev]);
    } catch (err) {
      console.error('Failed to create share link:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteShareLink(linkId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (err) {
      console.error('Failed to delete share link:', err);
    }
  };

  const handleCopy = async (token: string) => {
    const url = getShareUrl(token);
    await navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-2">Share Play</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Share "{playName}" with others via link
        </p>

        {/* Create new link */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Create Share Link</h3>

          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowFork}
                onChange={(e) => setAllowFork(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-600"
              />
              <span className="text-zinc-300 text-sm">Allow viewers to fork (copy) this play</span>
            </label>

            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Expires in</Label>
              <select
                value={expiresInDays ?? 'never'}
                onChange={(e) =>
                  setExpiresInDays(e.target.value === 'never' ? null : parseInt(e.target.value))
                }
                className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-sm text-white"
              >
                <option value="never">Never</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleCreateLink}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-500"
          >
            {isCreating ? 'Creating...' : 'Create Link'}
          </Button>
        </div>

        {/* Existing links */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Active Links</h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : links.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-4">
              No share links yet. Create one above.
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => {
                const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
                const url = getShareUrl(link.share_token);

                return (
                  <div
                    key={link.id}
                    className={`bg-zinc-800 border rounded-lg p-3 ${
                      isExpired ? 'border-red-800 opacity-60' : 'border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 text-xs bg-zinc-900 px-2 py-1 rounded truncate text-zinc-300">
                        {url}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(link.share_token)}
                        className="shrink-0 text-xs"
                      >
                        {copied === link.share_token ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-3">
                        <span>
                          {link.allow_fork ? 'Fork enabled' : 'View only'}
                        </span>
                        {link.expires_at && (
                          <span className={isExpired ? 'text-red-400' : ''}>
                            {isExpired
                              ? 'Expired'
                              : `Expires ${formatDistanceToNow(new Date(link.expires_at), { addSuffix: true })}`}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
