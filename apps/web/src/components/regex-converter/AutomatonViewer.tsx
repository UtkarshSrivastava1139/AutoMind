"use client";

import { Automaton } from '@automind/schemas';
import { getLayoutedElements } from '@/lib/elk-layout';
import { automatonToNodesEdges } from '@/lib/automaton-converter';
import { useEffect, useState } from 'react';
import { GitGraph, Table2, Layers, ExternalLink } from 'lucide-react';

interface AutomatonViewerProps {
  automaton: Automaton;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  showOpenInSimulator?: boolean;
}

export function AutomatonViewer({ automaton, title, description, icon, showOpenInSimulator }: AutomatonViewerProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'diagram' | 'table'>('diagram');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { nodes, edges } = automatonToNodesEdges(automaton);
        const { nodes: layoutNodes, edges: layoutEdges } = await getLayoutedElements(nodes, edges);
        
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

        let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background: transparent; width: 100%; height: auto; max-height: 24rem;">`;

        // Defs for arrowhead
        svg += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="var(--color-text-muted, #94a3b8)" /></marker></defs>`;

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
              svg += `<path d="M ${x1} ${y1} Q ${x1 + 60} ${y1 - 60} ${x1} ${y1}" stroke="var(--color-border, #475569)" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />`;
            } else {
              svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--color-border, #475569)" stroke-width="2" marker-end="url(#arrowhead)" />`;
            }
            
            // Label
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            svg += `<text x="${midX}" y="${midY - 8}" text-anchor="middle" font-size="13" font-weight="600" fill="var(--color-text-secondary, #cbd5e1)">${edge.data?.label || ''}</text>`;
          }
        });

        // Draw nodes
        layoutNodes.forEach((node: any) => {
          const x = node.position.x - minX + padding + 40;
          const y = node.position.y - minY + padding + 40;
          const isAccept = automaton.acceptStates.includes(node.id);
          const isStart = node.id === automaton.startState;

          if (isAccept) {
            svg += `<circle cx="${x}" cy="${y}" r="26" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="4" opacity="0.6" />`;
          }
          svg += `<circle cx="${x}" cy="${y}" r="20" fill="${isStart ? '#3b82f6' : 'var(--color-bg-card, #1e293b)'}" stroke="${isAccept ? '#10b981' : 'var(--color-text-muted, #64748b)'}" stroke-width="2" />`;
          svg += `<text x="${x}" y="${y}" text-anchor="middle" dy="0.3em" font-size="12" font-weight="bold" fill="white">${node.id}</text>`;
        });

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
    <div className="glass-card p-4 sm:p-5 border border-border bg-bg-card/40 shadow-md rounded-xl transition-all duration-300 hover:shadow-xl hover:border-border/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-bg-app border border-border">
            {icon || <GitGraph className="text-secondary" size={18} />}
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 text-text-primary">
              {title}
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {automaton.type}
              </span>
            </h3>
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {showOpenInSimulator && (
            <button 
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
              onClick={() => {
                localStorage.setItem('automind_pending_import', JSON.stringify(automaton));
                window.open('/simulator', '_blank');
              }}
              title="Open in Simulator"
            >
              <span className="hidden sm:inline">Open in Simulator</span>
              <ExternalLink size={14} />
            </button>
          )}
          <div className="flex w-fit bg-bg-app/80 border border-border rounded-lg p-1">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'diagram' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
              }`}
            >
              <Layers size={14} />
              Diagram
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'table' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
              }`}
            >
              <Table2 size={14} />
              Table
            </button>
          </div>
        </div>
      </div>

      <div className="bg-bg-app border border-border/60 rounded-xl overflow-hidden shadow-inner min-h-[16rem] flex flex-col">
        {activeTab === 'diagram' ? (
          <div className="p-4 flex-1 flex items-center justify-center relative bg-gradient-to-b from-transparent to-bg-app/50">
            <div dangerouslySetInnerHTML={{ __html: svgContent }} className="w-full flex justify-center" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-card/30">
                  {headers.map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    {row.map((cell, ci) => {
                      const isAccept = automaton.acceptStates.includes(cell);
                      const isStart = cell === automaton.startState;
                      return (
                        <td
                          key={ci}
                          className={`px-4 py-3 text-text-secondary font-mono text-sm ${
                            ci === 0
                              ? isAccept
                                ? 'font-bold text-emerald-400'
                                : isStart
                                ? 'font-bold text-blue-400'
                                : 'font-semibold text-text-primary'
                              : ''
                          }`}
                        >
                          {ci === 0 ? (
                            <span className="flex items-center gap-2">
                              {cell}
                              {isStart && <span className="text-[10px] uppercase font-sans tracking-wide text-blue-400/80">(Start)</span>}
                              {isAccept && <span className="text-[10px] uppercase font-sans tracking-wide text-emerald-400/80">(Accept)</span>}
                            </span>
                          ) : (
                            cell
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}