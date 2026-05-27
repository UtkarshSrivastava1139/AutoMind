import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type { Automaton, SimulationStep } from '@automind/schemas';
import { simulateDFA, simulateNFA, validateAutomaton } from '@automind/engine';

export type ToolType = 'select' | 'add-state' | 'add-transition' | 'delete';

export type AutomatonType = 'DFA' | 'NFA';

export type PlayMode = 'auto' | 'manual';

export interface SimulatorState {
  // Canvas State
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // Tools & UI State
  currentTool: ToolType;
  setTool: (tool: ToolType) => void;
  automatonType: AutomatonType;
  setAutomatonType: (type: AutomatonType) => void;

  // Automaton Editing
  addNode: (position: { x: number; y: number }) => void;
  deleteSelected: () => void;
  toggleStartState: (nodeId: string) => void;
  toggleAcceptState: (nodeId: string) => void;
  updateEdgeSymbol: (edgeId: string, symbol: string) => void;

  // Engine Integration
  compileToAutomaton: () => Automaton;
  importAutomaton: (automaton: Automaton) => void;

  // Simulation State
  simulationStatus: 'idle' | 'running' | 'accepted' | 'rejected' | 'error';
  simulationSteps: SimulationStep[];
  currentStepIndex: number;
  simulationInput: string;
  simulationWarnings: string[];

  // Playback mode
  playMode: PlayMode;
  setPlayMode: (mode: PlayMode) => void;
  autoPlaySpeed: number; // ms per step
  setAutoPlaySpeed: (speed: number) => void;
  _autoPlayTimer: ReturnType<typeof setInterval> | null;

  setSimulationInput: (input: string) => void;
  runSimulation: () => void;
  stopSimulation: () => void;
  nextStep: () => void;
  prevStep: () => void;
  resetStep: () => void;
  pauseAutoPlay: () => void;
  resumeAutoPlay: () => void;
}

// Derive next available ID from existing nodes to survive HMR and reloads
function getNextId(nodes: Node[]): string {
  const existingIds = nodes
    .map((n) => n.id)
    .filter((id) => /^q\d+$/.test(id))
    .map((id) => parseInt(id.slice(1), 10));
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : -1;
  return `q${maxId + 1}`;
}

// Helper: start an interval that auto-advances steps
function startAutoPlay(set: any, get: () => SimulatorState) {
  // Clear any existing timer
  const existing = get()._autoPlayTimer;
  if (existing) clearInterval(existing);

  const speed = get().autoPlaySpeed;

  const timer = setInterval(() => {
    const state = get();
    const { currentStepIndex, simulationSteps, simulationStatus } = state;

    // Stop if already finished or stopped
    if (simulationStatus === 'accepted' || simulationStatus === 'rejected' || simulationStatus === 'idle') {
      clearInterval(timer);
      set({ _autoPlayTimer: null });
      return;
    }

    if (currentStepIndex < simulationSteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      set({ currentStepIndex: newIndex });

      // Check if this is the last step
      if (newIndex === simulationSteps.length - 1) {
        const automaton = state.compileToAutomaton();
        const isAccepted = simulationSteps[newIndex].activeStates.some((s) =>
          automaton.acceptStates.includes(s)
        );
        set({ simulationStatus: isAccepted ? 'accepted' : 'rejected' });
        clearInterval(timer);
        set({ _autoPlayTimer: null });
      }
    }
  }, speed);

  set({ _autoPlayTimer: timer });
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  currentTool: 'select',
  automatonType: 'DFA',

  simulationStatus: 'idle',
  simulationSteps: [],
  currentStepIndex: 0,
  simulationInput: '',
  simulationWarnings: [],

  playMode: 'auto',
  autoPlaySpeed: 600,
  _autoPlayTimer: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    const edges = get().edges;
    // Check if there is already an existing edge in the same direction
    const existingEdge = edges.find(
      (e) => e.source === connection.source && e.target === connection.target
    );

    if (existingEdge) {
      // Merge with existing edge by appending the next available symbol
      const currentSymbol = (existingEdge.data?.symbol as string) || '';
      const symbols = currentSymbol.split(',').map((s) => s.trim()).filter(Boolean);
      
      const symbolList = ['a', 'b', 'c', 'd', '0', '1', '2'];
      let nextSymbol = 'b';
      for (const sym of symbolList) {
        if (!symbols.includes(sym)) {
          nextSymbol = sym;
          break;
        }
      }

      const mergedSymbol = currentSymbol ? `${currentSymbol}, ${nextSymbol}` : nextSymbol;
      
      set({
        edges: edges.map((e) =>
          e.id === existingEdge.id
            ? { ...e, data: { ...e.data, symbol: mergedSymbol } }
            : e
        ),
      });
      return;
    }

    // Otherwise, create a new transition edge
    const edge: Edge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      type: 'transition',
      data: { symbol: 'a' },
    };
    set({
      edges: addEdge(edge, edges),
    });
  },

  setTool: (tool: ToolType) => set({ currentTool: tool }),
  setAutomatonType: (type: AutomatonType) => set({ automatonType: type }),

  addNode: (position) => {
    const id = getNextId(get().nodes);
    const isFirst = get().nodes.length === 0;
    const newNode: Node = {
      id,
      type: 'state',
      position,
      data: {
        label: id,
        isStart: isFirst,
        isAccept: false,
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  deleteSelected: () => {
    const selectedNodeIds = new Set(
      get()
        .nodes.filter((n) => n.selected)
        .map((n) => n.id)
    );
    const nodes = get().nodes.filter((node) => !node.selected);
    const edges = get().edges.filter(
      (edge) =>
        !edge.selected &&
        !selectedNodeIds.has(edge.source) &&
        !selectedNodeIds.has(edge.target)
    );
    set({ nodes, edges });
  },

  toggleStartState: (nodeId: string) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, isStart: true } }
          : { ...n, data: { ...n.data, isStart: false } }
      ),
    });
  },

  toggleAcceptState: (nodeId: string) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, isAccept: !n.data.isAccept } }
          : n
      ),
    });
  },

  updateEdgeSymbol: (edgeId: string, symbol: string) => {
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data, symbol } } : e
      ),
    });
  },

  compileToAutomaton: (): Automaton => {
    const { nodes, edges, automatonType } = get();

    const states = nodes.map((n) => n.id);
    const startNode = nodes.find((n) => n.data.isStart) || nodes[0];
    const startState = startNode ? startNode.id : '';
    const acceptStates = nodes.filter((n) => n.data.isAccept).map((n) => n.id);

    const alphabetSet = new Set<string>();
    const transitions = edges
      .map((e) => {
        const rawSymbol = (e.data?.symbol as string) || '';
        const symbols = rawSymbol
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        symbols.forEach((s) => {
          if (s !== 'ε') alphabetSet.add(s);
        });

        return symbols.map((symbol) => ({
          from: e.source,
          to: e.target,
          symbol: symbol || 'ε',
        }));
      })
      .flat();

    return {
      type: automatonType,
      states,
      alphabet: Array.from(alphabetSet),
      startState,
      acceptStates,
      transitions,
    };
  },

  importAutomaton: (automaton: Automaton) => {
    // Basic mapping from Automaton to React Flow nodes/edges
    // We space them out in a basic grid, but ELK.js will usually be called immediately after import
    const newNodes: Node[] = automaton.states.map((stateId, i) => {
      const isStart = stateId === automaton.startState;
      const isAccept = automaton.acceptStates.includes(stateId);
      
      return {
        id: stateId,
        type: 'state',
        position: { x: 100 + (i % 4) * 150, y: 100 + Math.floor(i / 4) * 150 },
        data: {
          label: stateId,
          isStart,
          isAccept,
        },
      };
    });

    const newEdges: Edge[] = automaton.transitions.map((t, i) => ({
      id: `e-${t.from}-${t.to}-${i}`,
      source: t.from,
      target: t.to,
      type: 'transition',
      data: { symbol: t.symbol },
    }));

    set({
      automatonType: automaton.type as AutomatonType,
      nodes: newNodes,
      edges: newEdges,
      simulationStatus: 'idle',
      simulationSteps: [],
      currentStepIndex: 0,
      simulationWarnings: [],
    });
  },

  setSimulationInput: (input: string) => set({ simulationInput: input }),

  setPlayMode: (mode: PlayMode) => {
    const timer = get()._autoPlayTimer;
    if (timer) {
      clearInterval(timer);
      set({ _autoPlayTimer: null });
    }
    set({ playMode: mode });

    // If switching to auto while running, start auto-play
    if (mode === 'auto' && get().simulationStatus === 'running') {
      startAutoPlay(set, get);
    }
  },

  setAutoPlaySpeed: (speed: number) => {
    set({ autoPlaySpeed: speed });
    // Restart auto-play with new speed if currently playing
    const timer = get()._autoPlayTimer;
    if (timer && get().simulationStatus === 'running') {
      clearInterval(timer);
      startAutoPlay(set, get);
    }
  },

  runSimulation: () => {
    const { nodes } = get();
    if (nodes.length === 0) return;

    // Clear any existing auto-play
    const existingTimer = get()._autoPlayTimer;
    if (existingTimer) clearInterval(existingTimer);

    const automaton = get().compileToAutomaton();
    const input = get().simulationInput;

    const validation = validateAutomaton(automaton);

    if (!validation.valid && automaton.type === 'DFA') {
      set({
        simulationStatus: 'error',
        simulationWarnings: validation.errors,
        simulationSteps: [],
        currentStepIndex: 0,
        _autoPlayTimer: null,
      });
      return;
    }

    const result =
      automaton.type === 'DFA'
        ? simulateDFA(automaton, input)
        : simulateNFA(automaton, input);

    if (result.warnings && result.warnings.length > 0 && result.steps.length === 0) {
      set({
        simulationStatus: 'error',
        simulationWarnings: result.warnings,
        simulationSteps: [],
        currentStepIndex: 0,
        _autoPlayTimer: null,
      });
      return;
    }

    // For empty input or single-step, immediately determine result
    if (result.steps.length <= 1) {
      const finalStates = result.steps[0]?.activeStates || [];
      const isAccepted = finalStates.some((state) =>
        automaton.acceptStates.includes(state)
      );
      set({
        simulationStatus: isAccepted ? 'accepted' : 'rejected',
        simulationSteps: result.steps,
        currentStepIndex: 0,
        simulationWarnings: validation.warnings || [],
        _autoPlayTimer: null,
      });
      return;
    }

    set({
      simulationStatus: 'running',
      simulationSteps: result.steps,
      currentStepIndex: 0,
      simulationWarnings: validation.warnings || [],
      _autoPlayTimer: null,
    });

    // If auto mode, kick off the interval
    if (get().playMode === 'auto') {
      startAutoPlay(set, get);
    }
  },

  stopSimulation: () => {
    const timer = get()._autoPlayTimer;
    if (timer) clearInterval(timer);
    set({
      simulationStatus: 'idle',
      simulationSteps: [],
      currentStepIndex: 0,
      simulationWarnings: [],
      _autoPlayTimer: null,
    });
  },

  pauseAutoPlay: () => {
    const timer = get()._autoPlayTimer;
    if (timer) {
      clearInterval(timer);
      set({ _autoPlayTimer: null });
    }
  },

  resumeAutoPlay: () => {
    if (get().simulationStatus === 'running' && !get()._autoPlayTimer) {
      startAutoPlay(set, get);
    }
  },

  nextStep: () => {
    const { currentStepIndex, simulationSteps, compileToAutomaton } = get();
    if (currentStepIndex < simulationSteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      set({ currentStepIndex: newIndex });

      if (newIndex === simulationSteps.length - 1) {
        const automaton = compileToAutomaton();
        const isAccepted = simulationSteps[newIndex].activeStates.some((state) =>
          automaton.acceptStates.includes(state)
        );
        set({ simulationStatus: isAccepted ? 'accepted' : 'rejected' });
      }
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({
        currentStepIndex: currentStepIndex - 1,
        simulationStatus: 'running',
      });
    }
  },

  resetStep: () => {
    // Pause auto-play, reset to start, then resume if in auto mode
    const timer = get()._autoPlayTimer;
    if (timer) clearInterval(timer);
    set({
      currentStepIndex: 0,
      simulationStatus: 'running',
      _autoPlayTimer: null,
    });

    if (get().playMode === 'auto') {
      startAutoPlay(set, get);
    }
  },
}));
