'use client'

import { dynamic } from "@/lib/compat/next-shims";
import { Suspense } from 'react'

interface IsnadNode {
  id: string
  name_ar: string
  name_en: string
  era?: string
  reliability: 'thiqah' | 'da\'if' | 'unknown'
  order: number
}

interface IsnadGraphProps {
  hadith_id: string
  chain: IsnadNode[]
  isLoading?: boolean
}

// Dynamically import React Flow (it has DOM requirements and cannot be SSR)
const ReactFlowGraph = dynamic(
  () => import('./IsnadGraphFlow').then((mod) => mod.IsnadGraphFlow),
  { ssr: false, loading: () => <p className="text-gray-500 text-sm">Loading graph...</p> }
)

export function IsnadGraph({ hadith_id, chain, isLoading }: IsnadGraphProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-4 h-96 flex items-center justify-center">
        <p className="text-gray-400">Loading chain of transmission...</p>
      </div>
    )
  }

  if (!chain || chain.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <p className="text-gray-500 text-sm">Isnad chain not available for this hadith.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Chain of Transmission</h3>
        <p className="text-xs text-gray-500 mb-3">
          Showing the narrators from the Prophet ﷺ to the hadith compiler
        </p>
      </div>

      {/* Interactive React Flow Graph */}
      <div className="border border-gray-200 rounded overflow-hidden bg-white" style={{ height: '300px' }}>
        <Suspense fallback={<div className="h-full flex items-center justify-center text-gray-400">Loading...</div>}>
          <ReactFlowGraph chain={chain} />
        </Suspense>
      </div>

      {/* Fallback: Narrator List for No-JS / Mobile */}
      <noscript>
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase">Narrators (no JavaScript)</h4>
          {chain.map((node) => (
            <div key={node.id} className="flex items-start gap-2 py-1">
              <span className="text-gray-400 text-xs">→</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{node.name_en}</p>
                <p className="text-xs text-gray-600 font-arabic">{node.name_ar}</p>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{node.reliability}</span>
            </div>
          ))}
        </div>
      </noscript>
    </div>
  )
}
