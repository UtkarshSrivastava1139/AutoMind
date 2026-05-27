import { SimulatorWorkspace } from '../../../components/simulator/SimulatorWorkspace';

export default function SimulatorPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-bg-app relative">
      <SimulatorWorkspace />
    </div>
  );
}
