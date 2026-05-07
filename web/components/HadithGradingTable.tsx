'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Grading {
  scholar_id: string
  scholar_name: string
  grade: string
  arabic_grade: string
  source?: string
}

interface HadithGradingTableProps {
  hadith_id: string
  gradings: Grading[]
  isLoading?: boolean
}

const GRADE_COLORS: Record<string, string> = {
  sahih: 'bg-green-100 text-green-800',
  hasan: 'bg-yellow-100 text-yellow-800',
  daif: 'bg-orange-100 text-orange-800',
  mawdu: 'bg-red-100 text-red-800',
}

export function HadithGradingTable({ hadith_id, gradings, isLoading }: HadithGradingTableProps) {
  const [isExpanded, setIsExpanded] = useState(gradings.length < 5)

  if (!gradings || gradings.length === 0) {
    return <p className="text-gray-500 text-sm">No scholar gradings available yet.</p>
  }

  const showCollapseButton = gradings.length >= 5

  return (
    <div className="space-y-3">
      {showCollapseButton && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-700">
            Scholar Gradings ({gradings.length})
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 p-1"
          >
            {isExpanded ? (
              <>
                <ChevronDown size={14} /> Collapse
              </>
            ) : (
              <>
                <ChevronRight size={14} /> Expand
              </>
            )}
          </button>
        </div>
      )}

      {isLoading && <p className="text-gray-400 text-xs">Loading gradings...</p>}

      {isExpanded && !isLoading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Scholar</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Grade</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Arabic Grade</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Source</th>
              </tr>
            </thead>
            <tbody>
              {gradings.map((g) => (
                <tr key={g.scholar_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-800">{g.scholar_name}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        GRADE_COLORS[g.grade.toLowerCase()] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {g.grade}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-arabic text-gray-700">{g.arabic_grade}</td>
                  <td className="py-2 px-3 text-xs text-gray-600">{g.source || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
