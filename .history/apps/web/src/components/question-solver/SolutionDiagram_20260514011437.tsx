"use client";

import { useEffect, useState } from 'react';
import { useQuestionStore } from '@web/store/useQuestionStore';
import { getLayoutedElements } from '@web/lib/elk-layout';

export function SolutionDiagram() {
  const { solveResult } = useQuestionStore();
  const [layoutedNodes, setLayoutedNodes] = useState<any[]>([]);
  const [layoutedEdges, setLayoutedEdges] = useState<any[]>([]);

  useEffect(() => {
    if (solveResult?.diagramData) {
      getLayoutedElements(solveResult.diagramData.nodes, solveResult.diagramData.edges).then(({ nodes, edges }) => {
        setLayoutedNodes(nodes);
        setLayoutedEdges(edges);
      });
    }
  }, [solveResult?.diagramData]);

  if (!solveResult?.diagramData || !solveResult?.automaton || layoutedNodes.length === 0) return null;

  const { automaton } = solveResult;

  // Calculate bounding box for SVG view to center it
  const xs = layoutedNodes.map((n) => n.position.x);
  const ys = layoutedNodes.map((n) => n.position.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 0);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);
  
  // Add padding and create a square/centered bounding box
  const padding = 80;
  const rawWidth = (maxX - minX);
  const rawHeight = (maxY - minY);
  const width = Math.max(800, rawWidth + padding * 2);
  const height = Math.max(400, rawHeight + padding * 2);
  
  // Adjust minX and minY to perfectly center the graph in the calculated width/height
  const centeredMinX = minX - (width - rawWidth) / 2;
  const centeredMinY = minY - (height - rawHeight) / 2;
  
  const viewBox = `${centeredMinX} ${centeredMinY} ${width} ${height}`;

  return (
    <div className="solution-diagram glass-card" style={props?.style}>
      <div className="diagram-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 className="panel-title" style={{ margin: 0 }}>
            📐 State Diagram
            <span className={`status-badge ${solveResult.status === 'verified' ? 'verified' : 'partial'}`}>
              {solveResult.status === 'verified' ? '✓ Verified' : '⚠ Partial'}
            </span>
          </h3>
          <span className="automaton-type-badge">{automaton.type}</span>
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => {
            localStorage.setItem('automind_pending_import', JSON.stringify(automaton));
            window.open('/simulator', '_blank');
          }}
          style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
          data-html2canvas-ignore
        >
          Open in Simulator ↗
        </button>
      </div>

      <div className="diagram-canvas" style={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
        <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="automaton-svg" style={{ width: '100%', height: 'auto', maxHeight: '450px' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-text-secondary)" />
            </marker>
            <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-primary)" />
            </marker>
          </defs>

          {/* Start arrow */}
          {layoutedNodes.map((node: any) => {
            if (!node.isStart) return null;
            const x = node.position.x;
            const y = node.position.y;
            return (
              <line
                key={`start-${node.id}`}
                x1={x - 45}
                y1={y}
                x2={x - 22}
                y2={y}
                stroke="var(--color-primary)"
                strokeWidth="2"
                markerEnd="url(#arrowhead-active)"
              />
            );
          })}

          {/* Edges */}
          {layoutedEdges.map((edge: any) => {
            const source = layoutedNodes.find((n: any) => n.id === edge.source);
            const target = layoutedNodes.find((n: any) => n.id === edge.target);
            if (!source || !target) return null;

            const sx = source.position.x;
            const sy = source.position.y;
            const tx = target.position.x;
            const ty = target.position.y;

            // Self-loop
            if (edge.source === edge.target) {
              const r = 18;
              return (
                <g key={edge.id}>
                  <path
                    d={`M ${sx - 8} ${sy - 20} A ${r} ${r} 0 1 1 ${sx + 8} ${sy - 20}`}
                    fill="none"
                    stroke="var(--color-text-muted)"
                    strokeWidth="1.5"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={sx}
                    y={sy - 42}
                    textAnchor="middle"
                    className="edge-label"
                    fill="var(--color-primary-light)"
                    fontSize="11"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            }

            // Calculate angle for the arrow to stop at circle edge
            const dx = tx - sx;
            const dy = ty - sy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist;
            const ny = dy / dist;
            const R = 20; // node radius

            const startX = sx + nx * R;
            const startY = sy + ny * R;
            const endX = tx - nx * (R + 2);
            const endY = ty - ny * (R + 2);

            // Curve for parallel edges
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const perpX = -ny * 20;
            const perpY = nx * 20;

            return (
              <g key={edge.id}>
                <path
                  d={`M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`}
                  fill="none"
                  stroke="var(--color-text-muted)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={midX + perpX * 0.6}
                  y={midY + perpY * 0.6 - 4}
                  textAnchor="middle"
                  className="edge-label"
                  fill="var(--color-primary-light)"
                  fontSize="11"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {layoutedNodes.map((node: any) => (
            <g key={node.id}>
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={20}
                fill={node.isAccept ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.8)'}
                stroke={node.isAccept ? 'var(--color-primary)' : 'var(--color-border)'}
                strokeWidth={node.isStart ? 2.5 : 1.5}
              />
              {/* Double circle for accept states */}
              {node.isAccept && (
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={16}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                />
              )}
              <text
                x={node.position.x}
                y={node.position.y + 4}
                textAnchor="middle"
                fill="var(--color-text-primary)"
                fontSize="12"
                fontWeight="600"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="diagram-legend">
        <span className="legend-item"><span className="legend-dot start" /> Start</span>
        <span className="legend-item"><span className="legend-dot accept" /> Accept</span>
        <span className="legend-item">{automaton.states.length} states</span>
        <span className="legend-item">{automaton.transitions.length} transitions</span>
      </div>
    </div>
  );
}
