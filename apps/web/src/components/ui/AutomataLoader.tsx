import './AutomataLoader.css';

export function AutomataLoader() {
  return (
    <div className="automata-loader-container">
      <div className="automata-loader">
        <svg viewBox="0 0 200 100" className="automata-svg">
          <defs>
            <marker id="arrow-default" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" className="arrow-head-default" />
            </marker>
            <marker id="arrow-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" className="arrow-head-active" />
            </marker>
          </defs>
          
          <circle cx="40" cy="50" r="20" className="state q0" />
          <text x="40" y="55" textAnchor="middle" className="state-text">q0</text>
          
          <circle cx="100" cy="50" r="20" className="state q1" />
          <text x="100" y="55" textAnchor="middle" className="state-text">q1</text>
          
          <circle cx="160" cy="50" r="20" className="state q2" />
          <circle cx="160" cy="50" r="15" className="state q2-inner" />
          <text x="160" y="55" textAnchor="middle" className="state-text">q2</text>
          
          <path d="M 60 50 L 80 50" className="transition t1" markerEnd="url(#arrow-default)" />
          <path d="M 120 50 L 140 50" className="transition t2" markerEnd="url(#arrow-default)" />
        </svg>
        <div className="scanning-line"></div>
      </div>
    </div>
  );
}
