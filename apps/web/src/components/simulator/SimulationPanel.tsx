"use client";

import { useSimulatorStore } from '../../store/useSimulatorStore';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Hand,
} from 'lucide-react';

export function SimulationPanel() {
  const store = useSimulatorStore();

  const isIdle = store.simulationStatus === 'idle';
  const isError = store.simulationStatus === 'error';
  const isRunning = !isIdle && !isError;
  const isFinished =
    store.simulationStatus === 'accepted' || store.simulationStatus === 'rejected';
  const currentStep = store.simulationSteps[store.currentStepIndex];
  const hasStates = store.nodes.length > 0;
  const isAutoPlaying = store._autoPlayTimer !== null;

  // Speed labels
  const speedOptions = [
    { label: '0.5×', value: 1200 },
    { label: '1×', value: 600 },
    { label: '2×', value: 300 },
    { label: '4×', value: 150 },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
      <div
        className="glass-card shadow-2xl overflow-hidden"
        style={{ background: 'rgba(17,24,39,0.92)', backdropFilter: 'blur(16px)' }}
      >
        {/* ── Error messages ── */}
        {isError && store.simulationWarnings.length > 0 && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 flex gap-2 items-start">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
            <div className="text-sm text-red-300">
              <p className="font-semibold mb-1">Validation failed</p>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                {store.simulationWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Warnings (non-blocking) ── */}
        {isRunning && store.simulationWarnings.length > 0 && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex gap-2 items-center text-xs text-yellow-300">
            <AlertTriangle size={14} className="shrink-0" />
            {store.simulationWarnings[0]}
          </div>
        )}

        {/* ── Active step visualization ── */}
        {isRunning && currentStep && (
          <div className="px-4 pt-3 pb-1 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Step {store.currentStepIndex} of {store.simulationSteps.length - 1}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {currentStep.note}
              </span>
              {isFinished && (
                <span
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    store.simulationStatus === 'accepted'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {store.simulationStatus === 'accepted' ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                  {store.simulationStatus.toUpperCase()}
                </span>
              )}
            </div>

            {/* String tape visualization */}
            <div className="flex items-center gap-0.5 font-mono text-sm pb-2 overflow-x-auto">
              {store.simulationInput.split('').map((char, i) => {
                const consumed = i < currentStep.consumedInput.length;
                const isCurrentChar =
                  i === currentStep.consumedInput.length - 1 && currentStep.symbol;
                return (
                  <span
                    key={i}
                    className={`w-7 h-7 flex items-center justify-center rounded transition-all duration-200 ${
                      isCurrentChar
                        ? 'bg-[var(--color-accent)]/30 text-[var(--color-accent-light)] font-bold scale-110 ring-1 ring-[var(--color-accent)]'
                        : consumed
                        ? 'text-[var(--color-text-muted)] bg-[rgba(255,255,255,0.03)]'
                        : 'text-[var(--color-text-primary)] bg-[rgba(255,255,255,0.06)]'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
              {store.simulationInput.length === 0 && (
                <span className="text-xs text-[var(--color-text-muted)] italic">ε (empty string)</span>
              )}
            </div>

            {/* Active states */}
            <div className="flex items-center gap-1 pb-2">
              <span className="text-[10px] text-[var(--color-text-muted)] mr-1">Active:</span>
              {currentStep.activeStates.map((s) => (
                <span
                  key={s}
                  className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--color-accent)]/15 text-[var(--color-accent-light)]"
                >
                  {s}
                </span>
              ))}
              {currentStep.activeStates.length === 0 && (
                <span className="text-xs text-red-400 italic">No active states (stuck)</span>
              )}
            </div>
          </div>
        )}

        {/* ── Main Controls ── */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Input field */}
          <div className="flex-1">
            <input
              type="text"
              value={store.simulationInput}
              onChange={(e) => store.setSimulationInput(e.target.value)}
              placeholder={hasStates ? 'Type input string (e.g. 010)' : 'Add states first...'}
              disabled={isRunning || !hasStates}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-40"
              style={{
                background: 'var(--color-bg-workspace)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isRunning && hasStates) {
                  store.runSimulation();
                }
              }}
            />
          </div>

          {/* Mode Toggle (only visible when idle) */}
          {!isRunning && (
            <div className="flex bg-[rgba(255,255,255,0.05)] rounded-lg p-0.5">
              <button
                onClick={() => store.setPlayMode('auto')}
                title="Auto-play: runs through all steps automatically"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                  store.playMode === 'auto'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                <Zap size={12} />
                Auto
              </button>
              <button
                onClick={() => store.setPlayMode('manual')}
                title="Manual: step through one at a time"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                  store.playMode === 'manual'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                <Hand size={12} />
                Manual
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {!isRunning ? (
              <button
                onClick={store.runSimulation}
                disabled={!hasStates}
                className="flex items-center gap-2 px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play size={14} /> Simulate
              </button>
            ) : (
              <>
                {/* Auto-play controls: Pause / Resume */}
                {store.playMode === 'auto' && !isFinished && (
                  <button
                    onClick={() => isAutoPlaying ? store.pauseAutoPlay() : store.resumeAutoPlay()}
                    className="p-2 rounded-lg transition-colors bg-[rgba(99,102,241,0.15)] text-[var(--color-primary-light)] hover:bg-[rgba(99,102,241,0.25)]"
                    title={isAutoPlaying ? 'Pause' : 'Resume'}
                  >
                    {isAutoPlaying ? <Pause size={15} /> : <Play size={15} />}
                  </button>
                )}

                {/* Speed selector (only in auto mode while running) */}
                {store.playMode === 'auto' && !isFinished && (
                  <div className="flex bg-[rgba(255,255,255,0.05)] rounded-md">
                    {speedOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => store.setAutoPlaySpeed(opt.value)}
                        className={`px-1.5 py-1 text-[10px] font-mono font-semibold transition-colors rounded-md ${
                          store.autoPlaySpeed === opt.value
                            ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent-light)]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="w-px h-6 bg-[var(--color-border)] mx-0.5" />

                {/* Manual step controls (always available so user can step even in auto mode) */}
                <button
                  onClick={store.resetStep}
                  disabled={store.currentStepIndex === 0}
                  className="p-2 rounded-lg transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-white disabled:opacity-30"
                  title="Restart"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => {
                    // Pause auto-play when manually stepping back
                    if (store.playMode === 'auto') store.pauseAutoPlay();
                    store.prevStep();
                  }}
                  disabled={store.currentStepIndex === 0}
                  className="p-2 rounded-lg transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-white disabled:opacity-30"
                  title="Previous Step"
                >
                  <SkipBack size={15} />
                </button>
                <button
                  onClick={() => {
                    // Pause auto-play when manually stepping forward
                    if (store.playMode === 'auto') store.pauseAutoPlay();
                    store.nextStep();
                  }}
                  disabled={isFinished}
                  className="p-2 rounded-lg transition-colors bg-[rgba(99,102,241,0.15)] text-[var(--color-primary-light)] hover:bg-[rgba(99,102,241,0.25)] disabled:opacity-30"
                  title="Next Step"
                >
                  <SkipForward size={15} />
                </button>

                <div className="w-px h-6 bg-[var(--color-border)] mx-0.5" />

                <button
                  onClick={store.stopSimulation}
                  className="p-2 rounded-lg transition-colors text-[var(--color-text-secondary)] hover:bg-red-500/10 hover:text-red-400"
                  title="Stop Simulation"
                >
                  <Square size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
