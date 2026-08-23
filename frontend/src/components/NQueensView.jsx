import React, { useState, useEffect } from 'react';
import Controls from './Controls';
import { solveNQueens } from '../services/api';
import { Crown, Flame, AlertCircle } from 'lucide-react';

function getAttackingPairs(board) {
  const n = board.length;
  const attackingSet = new Set();
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (board[i] === board[j] || Math.abs(board[i] - board[j]) === Math.abs(i - j)) {
        attackingSet.add(i);
        attackingSet.add(j);
      }
    }
  }
  return attackingSet;
}

export default function NQueensView({ onLogResult }) {
  const [board, setBoard] = useState([0, 1, 2, 3, 4, 5, 6, 7]);
  const [algorithm, setAlgorithm] = useState('Simulated Annealing');
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const algorithms = ['Hill Climbing', 'Simulated Annealing', 'Genetic Algorithm'];

  const handleRun = async (forcedBoard = null, seed = null) => {
    const boardToUse = Array.isArray(forcedBoard) ? forcedBoard : board;
    const seedToUse = typeof seed === 'number' ? seed : null;
    setIsLoading(true);
    setIsPlaying(false);
    try {
      const data = await solveNQueens(8, algorithm, boardToUse, seedToUse);
      setResult(data);
      setCurrentStep(0);
      if (onLogResult) onLogResult(data);
    } catch (err) {
      alert('Error running N-Queens: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoStuckLocalOptimum = async () => {
    setAlgorithm('Hill Climbing');
    setIsLoading(true);
    setIsPlaying(false);
    // Seed 42 produces a local optimum plateau where Hill Climbing gets stuck with conflicts > 0
    try {
      const data = await solveNQueens(8, 'Hill Climbing', null, 42);
      setResult(data);
      setCurrentStep(data.history.length - 1);
    } catch (err) {
      alert('Demo error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const history = result?.history || [];
  const totalSteps = history.length;
  const currentFrame = history[currentStep] || null;
  const activeBoard = currentFrame?.board || board;
  const activeConflicts = currentFrame?.conflicts ?? 0;
  const attackingSet = getAttackingPairs(activeBoard);

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
      }, 250 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, speed]);

  const handleRandomizeBoard = () => {
    const randomBoard = Array.from({ length: 8 }, () => Math.floor(Math.random() * 8));
    setBoard(randomBoard);
    setResult(null);
    setCurrentStep(0);
    // Run search with the new random initial board
    handleRun(randomBoard, Math.floor(Math.random() * 10000));
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>Module 3 — N-Queens (Local Search: 8-Queens)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleDemoStuckLocalOptimum} disabled={isLoading}>
            <AlertCircle size={16} color="var(--accent-amber)" />
            Demo Hill Climbing Stuck (Local Optimum)
          </button>
          <button className="btn-secondary" onClick={handleRandomizeBoard} disabled={isLoading} style={{ borderColor: 'var(--accent-cyan)' }}>
            🎲 Randomize Queen Board
          </button>
        </div>
      </div>

      <Controls
        onRun={() => handleRun()}
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
          <div className="chessboard">
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => {
                const isDark = (r + c) % 2 === 1;
                const hasQueen = activeBoard[c] === r;
                const isConflict = hasQueen && attackingSet.has(c);

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`square ${isDark ? 'dark' : 'light'} ${isConflict ? 'conflict' : ''}`}
                  >
                    {hasQueen && (
                      <Crown
                        className="queen-icon"
                        size={28}
                        color={isConflict ? '#ef4444' : '#f59e0b'}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="metric-card">
            <span className="metric-label">Search Result</span>
            <span
              className="metric-value"
              style={{
                color: result
                  ? activeConflicts === 0
                    ? 'var(--accent-green)'
                    : 'var(--accent-amber)'
                  : 'var(--text-muted)'
              }}
            >
              {result ? (activeConflicts === 0 ? 'Zero Conflicts (Solved!)' : `Stuck: ${activeConflicts} Conflicts`) : 'Ready'}
            </span>
          </div>

          <div className="metrics-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="metric-card">
              <span className="metric-label">Attacking Pairs</span>
              <span className="metric-value" style={{ color: activeConflicts > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                {activeConflicts}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Iterations</span>
              <span className="metric-value">{result?.details?.iterations ?? 0}</span>
            </div>
          </div>

          {currentFrame?.temp !== undefined && (
            <div className="metric-card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flame size={14} color="var(--accent-amber)" /> SA Temperature (T)
              </span>
              <span className="metric-value" style={{ color: 'var(--accent-amber)' }}>
                {currentFrame.temp}
              </span>
            </div>
          )}

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.8rem', borderRadius: '10px', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.4rem', color: 'var(--accent-cyan)' }}>Syllabus Highlight:</div>
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Hill Climbing makes greedy local choices and easily gets trapped on <strong>local optima/plateaus</strong>. Simulated Annealing uses probabilistic temperature decay to jump out of local traps!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
