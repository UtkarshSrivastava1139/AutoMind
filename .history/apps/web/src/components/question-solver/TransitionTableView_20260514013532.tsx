"use client";

import { useQuestionStore } from '@web/store/useQuestionStore';
import { TableProperties } from 'lucide-react';

export function TransitionTableView() {
  const { solveResult } = useQuestionStore();

  if (!solveResult?.transitionTable) return null;

  const { headers, rows } = solveResult.transitionTable;

  return (
    <div className="transition-table-container glass-card">
      <h3 className="panel-title">📊 Transition Table</h3>
      <div className="table-scroll">
        <table className="transition-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={
                      ci === 0
                        ? cell.includes('*')
                          ? 'state-cell accept-state'
                          : cell.includes('→')
                          ? 'state-cell start-state'
                          : 'state-cell'
                        : 'transition-cell'
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
