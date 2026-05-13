import { SimulatorWorkspace } from '../../../components/simulator/SimulatorWorkspace';

export default function SimulatorPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="mb-4 shrink-0">
        <h1
          className="text-2xl font-semibold tracking-tight mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Automata Lab
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Visually build and simulate your DFA or NFA
        </p>
      </div>

      <SimulatorWorkspace />
    </div>
  );
}
