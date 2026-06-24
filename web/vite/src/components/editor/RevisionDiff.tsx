/**
 * FILE: components/editor/RevisionDiff.tsx
 * PURPOSE: Side-by-side diff of two revision content_md fields.
 *   Uses react-diff-viewer-continued for visual diff display.
 * INPUTS: revisionA (newer), revisionB (older)
 * REF: P2-E3-W02-S02-T01 · spec §7.2 §11.2
 */

import ReactDiffViewer from 'react-diff-viewer-continued';

interface Revision {
  id: string;
  content_md: string;
  created_at: string;
  author?: { display_name: string } | null;
}

interface RevisionDiffProps {
  revisionA: Revision;
  revisionB: Revision;
}

export default function RevisionDiff({ revisionA, revisionB }: RevisionDiffProps) {
  return (
    <div className="text-xs overflow-x-auto border border-gray-200 rounded">
      <ReactDiffViewer
        oldValue={revisionB.content_md}
        newValue={revisionA.content_md}
        splitView={false}
        useDarkTheme={false}
        showDiffOnly={true}
        leftTitle={`Previous (${new Date(revisionB.created_at).toLocaleDateString()})`}
        rightTitle={`Current (${new Date(revisionA.created_at).toLocaleDateString()})`}
      />
    </div>
  );
}
