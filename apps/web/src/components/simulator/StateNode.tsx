"use client";

import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { Play, Flag, Trash2 } from 'lucide-react';

function StateNodeComponent({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const {
    currentStepIndex,
    simulationSteps,
    simulationStatus,
    toggleStartState,
    toggleAcceptState,
  } = useSimulatorStore();
  const { deleteElements } = useReactFlow();
  const [showMenu, setShowMenu] = useState(false);
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSimulating = simulationStatus !== 'idle' && simulationStatus !== 'error';
  const isActive =
    isSimulating && simulationSteps[currentStepIndex]?.activeStates.includes(id);

  // ── Visual state ──
  let ringColor = 'rgba(255,255,255,0.15)';
  let glowStyle: React.CSSProperties = {};

  if (isActive) {
    if (simulationStatus === 'accepted') {
      ringColor = '#22C55E';
      glowStyle = { boxShadow: '0 0 24px rgba(34,197,94,0.6)' };
    } else if (simulationStatus === 'rejected') {
      ringColor = '#EF4444';
      glowStyle = { boxShadow: '0 0 24px rgba(239,68,68,0.6)' };
    } else {
      ringColor = 'var(--color-accent)';
      glowStyle = { animation: 'pulse-glow 1.5s ease-in-out infinite' };
    }
  } else if (selected) {
    ringColor = 'var(--color-primary)';
    glowStyle = { boxShadow: '0 0 12px rgba(99,102,241,0.3)' };
  }

  // ── Menu open/close with delayed hide ──
  const cancelClose = useCallback(() => {
    if (menuTimeout.current) {
      clearTimeout(menuTimeout.current);
      menuTimeout.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    menuTimeout.current = setTimeout(() => setShowMenu(false), 300);
  }, [cancelClose]);

  useEffect(() => {
    return () => cancelClose(); // cleanup on unmount
  }, [cancelClose]);

  // Close menu on click anywhere outside
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      // small delay so menu button clicks register first
      setTimeout(() => setShowMenu(false), 50);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cancelClose();
    setShowMenu((v) => !v);
  };

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
    setShowMenu(false);
  };

  return (
    <div
      className="relative group"
      onContextMenu={handleContextMenu}
    >
      {/* ── Central Invisible Target Handle ── */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-center"
        className="!w-full !h-full !rounded-full !border-0 !opacity-0 !bg-transparent"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }}
      />

      {/* ── Main Circle ── */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
        style={{
          background: 'var(--color-bg-workspace)',
          border: `2.5px solid ${ringColor}`,
          ...glowStyle,
        }}
      >
        {/* Accept state double ring */}
        {data.isAccept && (
          <div
            className="absolute inset-[5px] rounded-full pointer-events-none"
            style={{ border: `2px solid ${ringColor}` }}
          />
        )}

        {/* Label */}
        <span
          className="font-mono text-sm font-semibold select-none"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {data.label}
        </span>
      </div>

      {/* ── Start State Arrow (outside the node) ── */}
      {data.isStart && (
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <svg width="32" height="16" viewBox="0 0 32 16" className="overflow-visible">
            <line x1="0" y1="8" x2="24" y2="8" stroke="var(--color-accent)" strokeWidth="2" />
            <polygon points="24,4 32,8 24,12" fill="var(--color-accent)" />
          </svg>
        </div>
      )}

      {/* ── Central Invisible Source Handle ── */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-center"
        className="!w-full !h-full !rounded-full !border-0 !opacity-0 !bg-transparent"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }}
      />

      {/* ── Context Menu (right-click) ── */}
      {showMenu && (
        <div
          className="absolute z-50 p-1 shadow-2xl min-w-[150px] rounded-xl nodrag nopan"
          style={{
            background: 'var(--color-bg-workspace)',
            border: '1px solid var(--color-border)',
            // Position right next to the node, overlapping slightly so no gap
            left: '100%',
            top: '0',
            marginLeft: '4px',
          }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { toggleStartState(id); setShowMenu(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-[var(--color-bg-card-hover)] transition-colors"
            style={{ color: data.isStart ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          >
            <Play size={14} />
            {data.isStart ? '✓ Start State' : 'Set as Start'}
          </button>
          <button
            onClick={() => { toggleAcceptState(id); setShowMenu(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-[var(--color-bg-card-hover)] transition-colors"
            style={{ color: data.isAccept ? 'var(--color-success)' : 'var(--color-text-secondary)' }}
          >
            <Flag size={14} />
            {data.isAccept ? '✓ Accept State' : 'Set as Accept'}
          </button>
          <div className="h-px bg-[var(--color-border)] my-1" />
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {/* ── Status Badges (visual feedback below node) ── */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-1">
        {data.isStart && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
            START
          </span>
        )}
        {data.isAccept && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">
            ACCEPT
          </span>
        )}
      </div>
    </div>
  );
}

export const StateNode = memo(StateNodeComponent);
