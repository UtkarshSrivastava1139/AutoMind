"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { TableProperties } from 'lucide-react';

export function TransitionTableView() {
  const { solveResult } = useQuestionStore();

  if (!solveResult?.transitionTable) return null;

  const { headers, rows } = solveResult.transitionTable;

  return (
    <div className="glass-card rounded-2xl border border-border shadow-md bg-bg-app overflow-hidden">
      <div className="bg-bg-card/50 px-5 py-4 border-b border-border flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
          <TableProperties size={16} />
        </div>
        <h3 className="font-display font-semibold text-text-primary text-base">Transition Table</h3>
      </div>
      <div className="overflow-x-auto custom-scrollbar p-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border bg-bg-card/40">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-semibold text-text-secondary w-[120px] first:tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-bg-card/40 transition-colors">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={
                      ci === 0
                        ? cell.includes('*')
                          ? 'px-4 py-3 font-mono font-bold text-success flex items-center gap-1.5'
                          : cell.includes('→')
                          ? 'px-4 py-3 font-mono font-bold text-primary flex items-center gap-1.5'
                          : 'px-4 py-3 font-mono font-medium text-text-primary'
                        : 'px-4 py-3 font-mono text-text-muted hover:text-text-primary transition-colors'
                    }
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
