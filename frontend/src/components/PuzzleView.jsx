import React, { useState, useEffect } from 'react';
import Controls from './Controls';
import { solvePuzzle } from '../services/api';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const PRESET_PUZZLES = {
  easy: [1, 2, 3, 4, 0, 5, 7, 8, 6],
  medium: [1, 8, 2, 0, 4, 3, 7, 6, 5],
  hard: [8, 6, 7, 2, 5, 4, 3, 0, 1],
  unsolvable: [1, 2, 3, 4, 5, 6, 8, 7, 0]
};

function checkSolvability(state) {
  const tiles = state.filter((t) => t !== 0);
  let inversions = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

export default function PuzzleView({ onLogResult }) {
  const [puzzleState, setPuzzleState] = useState(PRESET_PUZZLES.easy);
  const [algorithm, setAlgorithm] = useState('A* (Manhattan)');
  const [result, setResult] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const algorithms = ['UCS', 'Greedy', 'A* (Misplaced)', 'A* (Manhattan)'];
  const isSolvable = checkSolvability(puzzleState);

  const handleRun = async () => {
    setIsLoading(true);
    setIsPlaying(false);
    try {
      const data = await solvePuzzle(puzzleState, algorithm);
      setResult(data);
      setCurrentStep(0);
      if (onLogResult) onLogResult(data);
    } catch (err) {
      alert('Error solving puzzle: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompareHeuristics = async () => {
    setIsLoading(true);
    try {
      const [resMisplaced, resManhattan] = await Promise.all([
        solvePuzzle(puzzleState, 'A* (Misplaced)'),
        solvePuzzle(puzzleState, 'A* (Manhattan)')
      ]);
      setComparisonResults({ misplaced: resMisplaced, manhattan: resManhattan });
    } catch (err) {
      alert('Error running comparison: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const history = result?.history || [];
  const totalSteps = history.length;
  const activeBoard = history[currentStep]?.state || puzzleState;

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
      }, 400 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, speed]);

  const handleRandomizePuzzle = () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
    if (!checkSolvability(arr)) {
      let idx1 = arr.findIndex((x) => x !== 0);
      let idx2 = arr.findIndex((x, i) => x !== 0 && i !== idx1);
      [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
    }
    setPuzzleState(arr);
    setResult(null);
    setComparisonResults(null);
    setCurrentStep(0);
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>Module 2 — 8-Puzzle (Sliding Tile Puzzle)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => { setPuzzleState(PRESET_PUZZLES.easy); setResult(null); }}>
            Easy Preset
          </button>
          <button className="btn-secondary" onClick={() => { setPuzzleState(PRESET_PUZZLES.medium); setResult(null); }}>
            Medium Preset
          </button>
          <button className="btn-secondary" onClick={() => { setPuzzleState(PRESET_PUZZLES.unsolvable); setResult(null); }}>
            Unsolvable Preset
          </button>
          <button className="btn-secondary" onClick={handleRandomizePuzzle} style={{ borderColor: 'var(--accent-cyan)' }}>
            🎲 Random Solvable Puzzle
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="puzzle-board">
            {activeBoard.map((val, idx) => (
              <div key={idx} className={`tile ${val === 0 ? 'blank' : ''}`}>
                {val !== 0 ? val : ''}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            {isSolvable ? (
              <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}>
                <CheckCircle2 size={18} /> Solvable Permutation (Even Parity)
              </span>
            ) : (
              <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}>
                <AlertTriangle size={18} /> Unsolvable Permutation (Odd Parity)
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="metric-card">
            <span className="metric-label">Status</span>
            <span className="metric-value" style={{ color: result ? (result.solved ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--text-muted)' }}>
              {result ? (result.solved ? 'Solved!' : 'Unsolvable / No Solution') : 'Ready'}
            </span>
          </div>

          <div className="metrics-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="metric-card">
              <span className="metric-label">Nodes Expanded</span>
              <span className="metric-value">{result?.nodes_expanded ?? 0}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Solution Moves</span>
              <span className="metric-value">{result?.solution_quality ?? 0}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontWeight: '700', marginBottom: '0.6rem', color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
              💡 Syllabus Highlight: Heuristic Comparison
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCompareHeuristics} disabled={isLoading}>
              Run A* Heuristic Benchmark (Misplaced vs Manhattan)
            </button>

            {comparisonResults && (
              <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.3rem' }}>
                  <span>A* (Misplaced Tiles):</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-amber)' }}>{comparisonResults.misplaced.nodes_expanded} nodes</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>A* (Manhattan Distance):</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>{comparisonResults.manhattan.nodes_expanded} nodes</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Result: Manhattan distance is a strictly more informed (dominant) heuristic, expanding fewer states!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
