"use client";

import { useSimulatorStore } from '../../store/useSimulatorStore';
import {
  MousePointer2,
  CircleDot,
  MoveRight,
  Trash2,
  RotateCcw,
} from 'lucide-react';

export function Toolbar() {
  const {
    currentTool,
    setTool,
    deleteSelected,
    automatonType,
    setAutomatonType,
    nodes,
    edges,
  } = useSimulatorStore();

  const clearAll = () => {
    if (nodes.length === 0 && edges.length === 0) return;
    useSimulatorStore.setState({ nodes: [], edges: [] });
  };

  return (
    <div className="absolute top-4 left-4 z-10 glass-card p-2.5 flex flex-col gap-1.5 shadow-xl min-w-[48px]">
      {/* DFA / NFA selector */}
      <div className="pb-2 mb-1 border-b border-[var(--color-border)]">
        <div className="flex gap-1">
          <button
            onClick={() => setAutomatonType('DFA')}
            className={`flex-1 text-[10px] font-bold py-1 px-2 rounded-md transition-colors ${
              automatonType === 'DFA'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            DFA
          </button>
          <button
            onClick={() => setAutomatonType('NFA')}
            className={`flex-1 text-[10px] font-bold py-1 px-2 rounded-md transition-colors ${
              automatonType === 'NFA'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            NFA
          </button>
        </div>
      </div>

      {/* Tool Buttons */}
      <ToolButton
        icon={<MousePointer2 size={18} />}
        label="Select"
        shortcut="V"
        active={currentTool === 'select'}
        onClick={() => setTool('select')}
      />
      <ToolButton
        icon={<CircleDot size={18} />}
        label="Add State"
        shortcut="S"
        active={currentTool === 'add-state'}
        onClick={() => setTool('add-state')}
      />
      <ToolButton
        icon={<MoveRight size={18} />}
        label="Connect"
        shortcut="T"
        active={currentTool === 'add-transition'}
        onClick={() => setTool('add-transition')}
      />

      <div className="h-px bg-[var(--color-border)] my-1" />

      <ToolButton
        icon={<Trash2 size={18} />}
        label="Delete Selected"
        shortcut="⌫"
        active={false}
        onClick={deleteSelected}
        danger
      />
      <ToolButton
        icon={<RotateCcw size={18} />}
        label="Clear All"
        shortcut=""
        active={false}
        onClick={clearAll}
        danger
      />

      {/* Quick Help */}
      <div className="mt-2 pt-2 border-t border-[var(--color-border)] space-y-0.5">
        <p className="text-[9px] text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-text-secondary)]">Right-click</span> node → Set start/accept
        </p>
        <p className="text-[9px] text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-text-secondary)]">Click label</span> on edge → Edit symbol
        </p>
        <p className="text-[9px] text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-text-secondary)]">Drag</span> handle → Create transition
        </p>
      </div>
    </div>
  );
}

function ToolButton({
  icon,
  label,
  shortcut,
  active,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 text-left ${
        active
          ? 'bg-[rgba(99,102,241,0.15)] text-[var(--color-primary-light)]'
          : danger
          ? 'text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium hidden sm:inline">{label}</span>
      {shortcut && (
        <kbd className="ml-auto text-[9px] font-mono px-1 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] hidden sm:inline">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
