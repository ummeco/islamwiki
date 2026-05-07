'use client'

import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

interface ChainNode {
  id: string
  name_ar: string
  name_en: string
  era?: string
  reliability: 'thiqah' | 'da\'if' | 'unknown'
  order: number
}

interface IsnadGraphFlowProps {
  chain: ChainNode[]
}

const RELIABILITY_COLORS: Record<string, string> = {
  thiqah: '#10b981', // green
  da: '#f97316', // orange
  unknown: '#6b7280', // gray
}

export function IsnadGraphFlow({ chain }: IsnadGraphFlowProps) {
  // Build nodes from chain (sort by order)
  const sorted = [...chain].sort((a, b) => a.order - b.order)

  const nodes: Node[] = sorted.map((node, idx) => ({
    id: node.id,
    data: {
      label: (
        <div className="text-xs text-center">
          <div className="font-medium text-gray-900">{node.name_en}</div>
          <div className="text-gray-600 font-arabic text-xs">{node.name_ar}</div>
          {node.era && <div className="text-gray-400 text-xs mt-0.5">{node.era}</div>}
        </div>
      ),
    },
    position: { x: 0, y: idx * 100 },
    style: {
      background: RELIABILITY_COLORS[node.reliability] || '#6b7280',
      color: 'white',
      border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: '6px',
      padding: '8px',
      width: '120px',
      fontSize: '11px',
    },
  }))

  // Build edges connecting narrators in sequence
  const edges: Edge[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    edges.push({
      id: `edge-${sorted[i].id}-${sorted[i + 1].id}`,
      source: sorted[i].id,
      target: sorted[i + 1].id,
      animated: true,
      style: { stroke: '#cbd5e1', strokeWidth: 2 },
    })
  }

  const [nodesState] = useNodesState(nodes)
  const [edgesState] = useEdgesState(edges)

  return (
    <ReactFlow nodes={nodesState} edges={edgesState}>
      <Background color="#aaa" gap={16} />
      <Controls />
    </ReactFlow>
  )
}
