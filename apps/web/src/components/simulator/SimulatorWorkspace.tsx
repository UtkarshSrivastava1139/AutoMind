"use client";

import { AutomataCanvas } from './AutomataCanvas';
import { Toolbar } from './Toolbar';
import { SimulationPanel } from './SimulationPanel';

export function SimulatorWorkspace() {
  return (
    <div className="relative w-full flex-1 min-h-[500px] rounded-xl overflow-hidden border border-[var(--color-border)]">
      <AutomataCanvas />
      <Toolbar />
      <SimulationPanel />
    </div>
  );
}
