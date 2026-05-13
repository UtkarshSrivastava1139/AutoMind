"use client";

import { Automaton } from '@automind/schemas';
import { getLayoutedElements } from '@web/lib/elk-layout';
import { automatonToNodesEdges } from '@web/lib/automaton-converter';
import { useEffect, useState } from 'react';
import { GitGraph } from 'lucide-react';

interface AutomatonViewerProps {
  automaton: Automaton;
  title: string;
  description?: string;
}

export function AutomatonViewer({ automaton, title, description }: AutomatonViewerProps) {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { nodes, edges } = automatonToNodesEdges(automaton);
        const { nodes: layoutNodes, edges: layoutEdges } = await getLayoutedElements(nodes, edges);
        
        // Generate SVG from nodes and edges
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        layoutNodes.forEach((node: any) => {
          minX = Math.min(minX, node.position.x);
          minY = Math.min(minY, node.position.y);
          maxX = Math.max(maxX, node.position.x + 80);
          maxY = Math.max(maxY, node.position.y + 80);
        });

        const padding = 40;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;

        let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background: rgba(15, 23, 42, 0.5);">`;

        // Draw edges
        layoutEdges.forEach((edge: any) => {
          const fromNode = layoutNodes.find((n: any) => n.id === edge.source);
          const toNode = layoutNodes.find((n: any) => n.id === edge.target);
          
          if (fromNode && toNode) {
            const x1 = fromNode.position.x - minX + padding + 40;
            const y1 = fromNode.position.y - minY + padding + 40;
            const x2 = toNode.position.x - minX + padding + 40;
            const y2 = toNode.position.y - minY + padding + 40;

            if (edge.source === edge.target) {
              // Self-loop
              svg += `<path d="M ${x1} ${y1} Q ${x1 + 60} ${y1 - 60} ${x1} ${y1}" stroke="#94a3b8" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />`;
            } else {
              svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="2" marker-end="url(#arrowhead)" />`;
            }
            
            // Label
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            svg += `<text x="${midX}" y="${midY - 5}" text-anchor="middle" font-size="12" fill="#cbd5e1">${edge.data?.label || ''}</text>`;
          }
        });

        // Draw nodes
        layoutNodes.forEach((node: any) => {
          const x = node.position.x - minX + padding + 40;
          const y = node.position.y - minY + padding + 40;
          const isAccept = automaton.acceptStates.includes(node.id);
          const isStart = node.id === automaton.startState;

          if (isAccept) {
            svg += `<circle cx="${x}" cy="${y}" r="50" fill="none" stroke="#10b981" stroke-width="3" />`;
          }
          svg += `<circle cx="${x}" cy="${y}" r="40" fill="${isStart ? '#3b82f6' : '#1e293b'}" stroke="${isAccept ? '#10b981' : '#64748b'}" stroke-width="2" />`;
          svg += `<text x="${x}" y="${y}" text-anchor="middle" dy="0.3em" font-size="14" font-weight="bold" fill="white">${node.id}</text>`;
        });

        svg += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#64748b" /></marker></defs>`;
        svg += `</svg>`;

        setSvgContent(svg);
      } catch (err) {
        console.error('Failed to render diagram:', err);
      }
    };

    renderDiagram();
  }, [automaton]);

  // Build transition table
  const rows = automaton.states.map((state) => {
    const row = [state];
    automaton.alphabet.forEach((symbol) => {
      const targets = automaton.transitions
        .filter((t) => t.from === state && t.symbol === symbol)
        .map((t) => t.to);
      row.push(targets.length > 0 ? targets.join(', ') : '-');
    });
    return row;
  });

  const headers = ['State', ...automaton.alphabet];

  return (
    <div className="glass-card p-6 mb-6">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
        <GitGraph className="text-secondary" size={20} />
        {title}
        <span className="text-xs font-normal text-slate-400 ml-2">({automaton.type})</span>
      </h3>
      {description && <p className="text-sm text-slate-400 mb-4">{description}</p>}

      {/* Diagram */}
      <div className="bg-slate-900/30 rounded-lg p-4 mb-4 border border-slate-700/50 overflow-auto max-h-64">
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      </div>

      {/* Transition Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              {headers.map((h, i) => (
                <th key={i} className="text-left px-3 py-2 font-semibold text-slate-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2 text-slate-300 ${
                      ci === 0
                        ? automaton.acceptStates.includes(cell)
                          ? 'font-semibold text-green-400'
                          : cell === automaton.startState
                          ? 'font-semibold text-blue-400'
                          : 'font-semibold'
                        : ''
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}