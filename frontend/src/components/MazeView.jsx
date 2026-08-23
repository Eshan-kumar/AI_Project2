import React, { useState, useEffect } from 'react';
import Controls from './Controls';
import { solveMaze } from '../services/api';

const DEFAULT_MAZE = [
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 0, 1, 1],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0, 1, 1, 0, 0]
];

export default function MazeView({ onLogResult }) {
  const [grid, setGrid] = useState(DEFAULT_MAZE);
  const [algorithm, setAlgorithm] = useState('A* (Manhattan)');
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const algorithms = ['BFS', 'DFS', 'A* (Manhattan)'];

  const toggleWall = (r, c) => {
    if ((r === 0 && c === 0) || (r === 9 && c === 9)) return;
    const newGrid = grid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? (val === 1 ? 0 : 1) : val))
    );
    setGrid(newGrid);
    setResult(null);
    setCurrentStep(0);
  };

  const handleRun = async () => {
    setIsLoading(true);
    setIsPlaying(false);
    try {
      const data = await solveMaze(grid, [0, 0], [9, 9], algorithm);
      setResult(data);
      setCurrentStep(0);
      if (onLogResult) onLogResult(data);
    } catch (err) {
      alert('Failed to solve maze: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const history = result?.history || [];
  const totalSteps = history.length;
  const path = result?.path || [];

  // Playback timer
  useEffect(() => {
    let timer;
    if (isPlaying && totalSteps > 0) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 300 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, speed]);

  // Determine current cell status
  const currentFrame = history[currentStep] || null;
  const visitedSet = new Set(
    (currentFrame?.visited || []).map(([r, c]) => `${r},${c}`)
  );
  const frontierSet = new Set(
    (currentFrame?.frontier || []).map(([r, c]) => `${r},${c}`)
  );
  const pathSet = new Set(
    (currentStep === totalSteps - 1 && result?.solved ? path : []).map(
      ([r, c]) => `${r},${c}`
    )
  );

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>Module 1 — 10×10 Grid Pathfinding</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-secondary"
            onClick={() => {
              setGrid(DEFAULT_MAZE);
              setResult(null);
              setCurrentStep(0);
            }}
          >
            Load Preset Maze
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              const randGrid = Array.from({ length: 10 }, (_, r) =>
                Array.from({ length: 10 }, (_, c) =>
                  (r === 0 && c === 0) || (r === 9 && c === 9)
                    ? 0
                    : Math.random() < 0.25
                    ? 1
                    : 0
                )
              );
              setGrid(randGrid);
              setResult(null);
              setCurrentStep(0);
            }}
          >
            Randomize Grid
          </button>
        </div>
      </div>

      <Controls
        onRun={handleRun}
        onStepPrev={() => setCurrentStep((p) => Math.max(0, p - 1))}
        onStepNext={() => setCurrentStep((p) => Math.min(totalSteps - 1, p + 1))}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={() => {
          setIsPlaying(false);
          setCurrentStep(0);
        }}
        isPlaying={isPlaying}
        currentStep={currentStep}
        totalSteps={totalSteps}
        speed={speed}
        setSpeed={setSpeed}
        algorithms={algorithms}
        selectedAlgo={algorithm}
        setSelectedAlgo={setAlgorithm}
        isLoading={isLoading}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="maze-grid-container">
          <div className="maze-grid">
            {grid.map((row, r) =>
              row.map((val, c) => {
                const key = `${r},${c}`;
                let cellClass = 'maze-cell';
                let cellText = '';

                if (r === 0 && c === 0) {
                  cellClass += ' start';
                  cellText = 'S';
                } else if (r === 9 && c === 9) {
                  cellClass += ' goal';
                  cellText = 'G';
                } else if (val === 1) {
                  cellClass += ' wall';
                } else if (pathSet.has(key)) {
                  cellClass += ' path';
                } else if (currentFrame?.curr && currentFrame.curr[0] === r && currentFrame.curr[1] === c) {
                  cellClass += ' curr';
                } else if (frontierSet.has(key)) {
                  cellClass += ' frontier';
                } else if (visitedSet.has(key)) {
                  cellClass += ' visited';
                }

                return (
                  <div
                    key={key}
                    className={cellClass}
                    onClick={() => toggleWall(r, c)}
                    title={`Cell (${r}, ${c})`}
                  >
                    {cellText}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Tip: Click any cell to toggle walls/obstacles.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="metric-card">
            <span className="metric-label">Status</span>
            <span className="metric-value" style={{ color: result ? (result.solved ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--text-muted)' }}>
              {result ? (result.solved ? 'Goal Reached!' : 'No Path Found') : 'Ready'}
            </span>
          </div>

          <div className="metrics-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="metric-card">
              <span className="metric-label">Nodes Expanded</span>
              <span className="metric-value">{result?.nodes_expanded ?? 0}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Path Length</span>
              <span className="metric-value">{result?.solution_quality ?? 0}</span>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-label">Execution Time</span>
            <span className="metric-value">{result ? `${result.time_taken_ms} ms` : '0 ms'}</span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.8rem', borderRadius: '10px', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.4rem', color: 'var(--accent-cyan)' }}>Visual Legend:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--text-muted)' }}>
              <div><span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>S</span> = Start (0,0), <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>G</span> = Goal (9,9)</div>
              <div><span style={{ color: 'var(--accent-cyan)' }}>Cyan</span> = Active Frontier Queue</div>
              <div><span style={{ color: 'var(--accent-purple)' }}>Purple</span> = Visited Cells</div>
              <div><span style={{ color: 'var(--accent-green)' }}>Emerald Green</span> = Shortest Path</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
