import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Zap } from 'lucide-react';

export default function Controls({
  onRun,
  onStepPrev,
  onStepNext,
  onTogglePlay,
  onReset,
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  setSpeed,
  algorithms,
  selectedAlgo,
  setSelectedAlgo,
  isLoading
}) {
  return (
    <div className="controls-bar">
      <div className="button-group">
        <select
          value={selectedAlgo}
          onChange={(e) => setSelectedAlgo(e.target.value)}
          disabled={isLoading || isPlaying}
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            color: '#fff',
            border: '1px solid var(--border-glass-light)',
            padding: '0.55rem 0.9rem',
            borderRadius: '8px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {algorithms.map((algo) => (
            <option key={algo} value={algo}>
              {algo}
            </option>
          ))}
        </select>

        <button
          onClick={onRun}
          disabled={isLoading}
          className="btn-primary"
        >
          <Zap size={16} />
          {isLoading ? 'Computing...' : 'Run Search'}
        </button>

        <button
          onClick={onTogglePlay}
          disabled={totalSteps === 0}
          className="btn-secondary"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={onStepPrev}
          disabled={currentStep <= 0 || isPlaying}
          className="btn-secondary"
        >
          <SkipBack size={16} />
          Step Prev
        </button>

        <button
          onClick={onStepNext}
          disabled={currentStep >= totalSteps - 1 || isPlaying}
          className="btn-secondary"
        >
          Step Next
          <SkipForward size={16} />
        </button>

        <button
          onClick={onReset}
          className="btn-secondary"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      <div className="speed-control">
        <span>Step {currentStep} / {totalSteps > 0 ? totalSteps - 1 : 0}</span>
        <span style={{ marginLeft: '1rem' }}>Speed: {speed}x</span>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
