/**
 * FILE: components/review/ModerationPanel.tsx
 * PURPOSE: Moderation sidebar — shows theology check result, approve/reject controls.
 *   HARD RULE: Approve button is DISABLED when theologyFailed = true.
 * INPUTS: revisionId, theologyCheck, theologyFailed, onApprove, onReject, isActioning
 * REF: P2-E3-W02-S02-T01 · spec §7.3 §8
 */

import { useState } from 'react';

interface TheologyCheck {
  id: string;
  status: string;
  flags?: string[];
  completed_at?: string | null;
}

interface ModerationPanelProps {
  revisionId: string;
  theologyCheck: TheologyCheck | null;
  theologyFailed: boolean;
  onApprove: () => Promise<void>;
  onReject: (reviewNote: string) => Promise<void>;
  isActioning: boolean;
}

export default function ModerationPanel({
  revisionId,
  theologyCheck,
  theologyFailed,
  onApprove,
  onReject,
  isActioning,
}: ModerationPanelProps) {
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-700 text-sm">Moderation</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Theology check status */}
        <section aria-label="Theology check">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Theology Gate
          </h3>
          {!theologyCheck ? (
            <div className="text-sm text-gray-500 italic">No theology check yet</div>
          ) : (
            <div className="space-y-2">
              <div
                className={`px-3 py-2 rounded text-sm font-medium ${
                  theologyCheck.status === 'passed'
                    ? 'bg-green-50 text-green-700'
                    : theologyCheck.status === 'failed'
                    ? 'bg-red-50 text-red-700'
                    : theologyCheck.status === 'needs_review'
                    ? 'bg-orange-50 text-orange-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}
                role="status"
              >
                {theologyCheck.status === 'passed' && '✓ Theology check passed'}
                {theologyCheck.status === 'failed' && '✗ Theology check FAILED — cannot approve'}
                {theologyCheck.status === 'needs_review' && '⚠ Needs scholar review'}
                {theologyCheck.status === 'pending' && '⏳ Theology check in progress…'}
              </div>

              {theologyCheck.status === 'failed' && theologyCheck.flags && theologyCheck.flags.length > 0 && (
                <div className="text-xs text-red-600">
                  <p className="font-medium mb-1">Issues flagged:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {theologyCheck.flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Approve/reject actions */}
        <section aria-label="Moderation actions">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Actions
          </h3>

          {theologyFailed && (
            <p className="text-xs text-red-600 bg-red-50 rounded p-2 mb-3">
              <strong>Approve is blocked.</strong> The theology check failed.
              The contributor must revise and resubmit.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onApprove}
              disabled={isActioning || theologyFailed}
              aria-disabled={theologyFailed}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isActioning ? 'Approving…' : 'Approve & Publish'}
            </button>

            {!showRejectForm ? (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={isActioning}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
            ) : (
              <div className="space-y-2">
                <label htmlFor="reject-note" className="text-xs font-medium text-gray-600">
                  Rejection reason <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="reject-note"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={3}
                  placeholder="Explain why this revision is being rejected…"
                  className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-brand-mid focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (rejectNote.trim()) {
                        void onReject(rejectNote.trim());
                      }
                    }}
                    disabled={isActioning || !rejectNote.trim()}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isActioning ? 'Rejecting…' : 'Confirm Reject'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
