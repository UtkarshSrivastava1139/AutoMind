"use client";

import { memo, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

function TransitionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  data,
  markerEnd,
  selected,
}: any) {
  const { nodes, edges, updateEdgeSymbol, simulationStatus, simulationSteps, currentStepIndex } =
    useSimulatorStore();
  const [editing, setEditing] = useState(false);

  // Find actual nodes to get their center positions dynamically
  const sourceNode = nodes.find(n => n.id === source);
  const targetNode = nodes.find(n => n.id === target);

  // Default to provided handles if nodes aren't found for some reason
  const cx1 = sourceNode ? sourceNode.position.x + 32 : sourceX;
  const cy1 = sourceNode ? sourceNode.position.y + 32 : sourceY;
  const cx2 = targetNode ? targetNode.position.x + 32 : targetX;
  const cy2 = targetNode ? targetNode.position.y + 32 : targetY;
  const nodeRadius = 32;

  // Self-loop detection
  const isSelfLoop = source === target;

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (isSelfLoop) {
    // ── Proper circular self-loop ──
    // Always use the top of the node for self-loops, ignoring left/right handles
    const loopRadius = 22; 
    const loopOffset = 6; 

    // Start point: top-left of the node circle
    const startX = cx1 - 12;
    const startY = cy1 - nodeRadius + 4;

    // End point: top-right of the node circle
    const endX = cx1 + 12;
    const endY = cy1 - nodeRadius + 4;

    edgePath = `M ${startX},${startY} A ${loopRadius},${loopRadius} 0 1,1 ${endX},${endY}`;

    // Label sits at the top of the loop
    labelX = cx1;
    labelY = cy1 - nodeRadius - loopRadius * 2 + loopOffset;
  } else {
    // ── Dynamic Edge Routing ──
    // Calculate direction vector between node centers
    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const d = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate exact boundary intersection points
    const startX = d > 0 ? cx1 + (dx / d) * nodeRadius : cx1;
    const startY = d > 0 ? cy1 + (dy / d) * nodeRadius : cy1;
    const endX = d > 0 ? cx2 - (dx / d) * nodeRadius : cx2;
    const endY = d > 0 ? cy2 - (dy / d) * nodeRadius : cy2;

    const hasReverse = edges.some((e: any) => e.source === target && e.target === source);
    if (hasReverse && d > 0) {
      // ── Bidirectional Curved Edge ──
      const r = d * 0.75; 
      edgePath = `M ${startX},${startY} A ${r},${r} 0 0,1 ${endX},${endY}`;

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      const nx = -dy / d;
      const ny = dx / d;

      const chordDist = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      const h = r - Math.sqrt(r * r - (chordDist * chordDist) / 4);
      
      labelX = midX - nx * (h + 12);
      labelY = midY - ny * (h + 12);
    } else {
      // ── Straight Edge (Shortest path between boundaries) ──
      edgePath = `M ${startX},${startY} L ${endX},${endY}`;
      
      // Label exactly in the middle of the straight line
      labelX = (startX + endX) / 2;
      labelY = (startY + endY) / 2;
    }
  }


  // Check if this edge is part of the active simulation step
  const isSimulating = simulationStatus !== 'idle' && simulationStatus !== 'error';
  const currentStep = isSimulating ? simulationSteps[currentStepIndex] : null;
  const symbol = data?.symbol || '';

  // An edge is "active" if the current step consumed this edge's symbol and
  // went from the source to the target state
  let isActiveEdge = false;
  if (currentStep && currentStep.symbol) {
    const prevStep = currentStepIndex > 0 ? simulationSteps[currentStepIndex - 1] : null;
    if (prevStep) {
      const prevStates = prevStep.activeStates;
      const currStates = currentStep.activeStates;
      const symbols = symbol.split(',').map((s: string) => s.trim());
      isActiveEdge =
        prevStates.includes(source) &&
        currStates.includes(target) &&
        symbols.includes(currentStep.symbol);
    }
  }

  let strokeColor = 'var(--color-text-muted)';
  let strokeWidth = 2;
  if (isActiveEdge) {
    strokeColor = 'var(--color-accent)';
    strokeWidth = 3;
  } else if (selected) {
    strokeColor = 'var(--color-primary)';
    strokeWidth = 2.5;
  }

  return (
    <>
      {isSelfLoop ? (
        // Render the self-loop as a raw SVG path (not BaseEdge, which may not handle arcs)
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          markerEnd={markerEnd}
          style={{
            transition: 'stroke 0.3s ease, stroke-width 0.2s ease',
            filter: isActiveEdge ? 'drop-shadow(0 0 6px rgba(6,182,212,0.4))' : 'none',
          }}
        />
      ) : (
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            strokeWidth,
            stroke: strokeColor,
            transition: 'stroke 0.3s ease, stroke-width 0.2s ease',
            filter: isActiveEdge ? 'drop-shadow(0 0 6px rgba(6,182,212,0.4))' : 'none',
          }}
        />
      )}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {editing ? (
            <input
              autoFocus
              value={symbol}
              onChange={(e) => updateEdgeSymbol(id, e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditing(false);
              }}
              className="w-16 h-7 text-center text-sm font-mono rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={{
                background: 'var(--color-bg-workspace)',
                color: 'var(--color-text-primary)',
                border: '1.5px solid var(--color-primary)',
              }}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="min-w-[28px] px-2 py-0.5 text-sm font-mono font-semibold rounded-md cursor-pointer transition-all duration-150 hover:scale-110"
              style={{
                background: isActiveEdge
                  ? 'rgba(6,182,212,0.2)'
                  : selected
                  ? 'rgba(99,102,241,0.2)'
                  : 'var(--color-bg-workspace)',
                color: isActiveEdge
                  ? 'var(--color-accent-light)'
                  : selected
                  ? 'var(--color-primary-light)'
                  : 'var(--color-text-primary)',
                border: `1px solid ${isActiveEdge ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
              title="Click to edit symbol"
            >
              {symbol || '?'}
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const TransitionEdge = memo(TransitionEdgeComponent);
