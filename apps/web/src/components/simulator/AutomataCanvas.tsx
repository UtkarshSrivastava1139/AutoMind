"use client";

import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  MarkerType,
  useReactFlow,
  ConnectionMode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useSimulatorStore } from '../../store/useSimulatorStore';
import { getLayoutedElements } from '../../lib/elk-layout';
import { StateNode } from './StateNode';
import { TransitionEdge } from './TransitionEdge';
import { useState } from 'react';

const nodeTypes = {
  state: StateNode,
};

const edgeTypes = {
  transition: TransitionEdge,
};

const defaultEdgeOptions = {
  type: 'transition',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: '#94A3B8',
  },
};

function Flow() {
  const store = useSimulatorStore();
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [isBeautifying, setIsBeautifying] = useState(false);

  const handleImproveLayout = useCallback(async () => {
    const { nodes, edges } = await getLayoutedElements(store.nodes, store.edges);
    store.setNodes(nodes);
    store.setEdges(edges);
    
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 50);
  }, [store, fitView]);

  const handleAIBeautify = useCallback(async () => {
    if (store.nodes.length === 0) return;
    setIsBeautifying(true);
    try {
      const automaton = store.compileToAutomaton();
      const res = await fetch('/api/question/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automaton }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate layout');

      const layout = data.layout;
      
      // Update nodes with new coordinates
      const newNodes = store.nodes.map((node) => {
        const coords = layout[node.id];
        if (coords) {
          return { ...node, position: { x: coords.x, y: coords.y } };
        }
        return node;
      });

      store.setNodes(newNodes);
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 50);
    } catch (err) {
      console.error('AI Beautify failed:', err);
      // Fallback to ELK if AI fails
      handleImproveLayout();
    } finally {
      setIsBeautifying(false);
    }
  }, [store, fitView, handleImproveLayout]);

  useEffect(() => {
    const pendingImport = localStorage.getItem('automind_pending_import');
    if (pendingImport) {
      try {
        const automaton = JSON.parse(pendingImport);
        store.importAutomaton(automaton);
        localStorage.removeItem('automind_pending_import');

        setTimeout(() => {
          const currentStore = useSimulatorStore.getState();
          getLayoutedElements(currentStore.nodes, currentStore.edges).then(({ nodes, edges }) => {
            currentStore.setNodes(nodes);
            currentStore.setEdges(edges);
            setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
          });
        }, 100);
      } catch (e) {
        console.error("Failed to import automaton:", e);
      }
    }
  }, [store, fitView]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key.toLowerCase()) {
        case 'v':
          store.setTool('select');
          break;
        case 's':
          store.setTool('add-state');
          break;
        case 't':
          store.setTool('add-transition');
          break;
        case 'delete':
        case 'backspace':
          store.deleteSelected();
          break;
        case 'escape':
          store.setTool('select');
          store.stopSimulation();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  // ── Canvas click handler ──
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (store.currentTool === 'add-state') {
        // Use React Flow's screenToFlowPosition for zoom/pan aware placement
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        store.addNode(position);
        // Stay in add-state mode for rapid placement
      }
    },
    [store, screenToFlowPosition]
  );

  // ── Cursor style based on tool ──
  let cursorClass = '';
  if (store.currentTool === 'add-state') cursorClass = 'cursor-crosshair';
  else if (store.currentTool === 'add-transition') cursorClass = 'cursor-cell';
  else cursorClass = 'cursor-default';

  return (
    <div className={`w-full h-full ${cursorClass}`}>
      <ReactFlow
        nodes={store.nodes}
        edges={store.edges}
        onNodesChange={store.onNodesChange}
        onEdgesChange={store.onEdgesChange}
        onConnect={store.onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-[var(--color-bg-app)]"
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        snapToGrid
        snapGrid={[16, 16]}
      >
        <Panel position="top-right" className="bg-[var(--color-bg-workspace)] p-2 rounded-lg border border-[var(--color-border)] shadow-md flex gap-2">
          <button
            onClick={handleAIBeautify}
            disabled={isBeautifying || store.nodes.length === 0}
            className="btn btn-primary text-xs px-3 py-1 flex items-center gap-1 disabled:opacity-50"
          >
            {isBeautifying ? <span className="spinner spinner-sm" /> : '🎨'} AI Beautify
          </button>
          <button
            onClick={handleImproveLayout}
            className="btn btn-secondary text-xs px-3 py-1"
          >
            ✨ Auto Layout
          </button>
        </Panel>
        <Background color="rgba(255,255,255,0.04)" gap={32} size={1.5} />
        <Controls
          className="!bg-[var(--color-bg-workspace)] !border-[var(--color-border)] !shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={() => '#6366F1'}
          maskColor="rgba(15,23,42,0.85)"
          className="!bg-[var(--color-bg-workspace)] !border-[var(--color-border)]"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}

export function AutomataCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
