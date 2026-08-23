import React, { useState, useEffect } from 'react';
import Controls from './Controls';
import { planBlocks } from '../services/api';
import { Layers, Target, Play, RotateCcw } from 'lucide-react';

export default function BlocksView({ onLogResult }) {
  const [algorithm, setAlgorithm] = useState('State-Space Planner (BFS)');
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const algorithms = ['State-Space Planner (BFS)'];

  const [startStacks, setStartStacks] = useState([['A', 'B'], ['C'], ['D']]);
  const [goalStacks, setGoalStacks] = useState([['A', 'C'], ['B', 'D']]);
  const [customStartInput, setCustomStartInput] = useState('[A, B], [C], [D]');
  const [customGoalInput, setCustomGoalInput] = useState('[A, C], [B, D]');
  const [inputError, setInputError] = useState('');

  const handleRun = async (customStart = null, customGoal = null) => {
    const startToUse = Array.isArray(customStart) ? customStart : startStacks;
    const goalToUse = Array.isArray(customGoal) ? customGoal : goalStacks;
    setIsLoading(true);
    setIsPlaying(false);
    try {
      const data = await planBlocks(startToUse, goalToUse, algorithm);
      setResult(data);
      setCurrentStep(0);
      if (onLogResult) onLogResult(data);
    } catch (err) {
      alert('Error planning blocks: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format stacks array into user-friendly string e.g. "[A, C], [B, D]"
  const formatStacksString = (stacks) => {
    return stacks.map((s) => `[${s.join(', ')}]`).join(', ');
  };

  // Flexible Parser for Custom User Input (Supports [A,C],[B,D] and A,C/B,D and A C / B D)
  const parseBlocksInputString = (inputStr, labelName = 'Input') => {
    if (!inputStr || !inputStr.trim()) {
      throw new Error(`${labelName} cannot be empty.`);
    }

    const trimmed = inputStr.trim();
    const parsedStacks = [];
    const usedBlocks = new Set();

    // Check if bracketed notation [A,C],[B,D] is present
    const bracketMatches = trimmed.match(/\[(.*?)\]/g);

    if (bracketMatches && bracketMatches.length > 0) {
      bracketMatches.forEach((bracket) => {
        const matches = bracket.toUpperCase().match(/[A-D]/g) || [];
        if (matches.length > 0) {
          matches.forEach((b) => {
            if (usedBlocks.has(b)) {
              throw new Error(`Block '${b}' is duplicated in your ${labelName.toLowerCase()}.`);
            }
            usedBlocks.add(b);
          });
          parsedStacks.push(matches);
        }
      });
    } else {
      // Delimiter notation (e.g. "A, C / B, D")
      const stackSegments = trimmed.split(/[\/;|]/);
      stackSegments.forEach((seg) => {
        const matches = seg.toUpperCase().match(/[A-D]/g) || [];
        if (matches.length > 0) {
          matches.forEach((b) => {
            if (usedBlocks.has(b)) {
              throw new Error(`Block '${b}' is duplicated in your ${labelName.toLowerCase()}.`);
            }
            usedBlocks.add(b);
          });
          parsedStacks.push(matches);
        }
      });
    }

    if (usedBlocks.size === 0) {
      throw new Error(`No valid blocks (A, B, C, D) found in ${labelName.toLowerCase()}.`);
    }

    // Include remaining omitted blocks as single items on table
    ['A', 'B', 'C', 'D'].forEach((b) => {
      if (!usedBlocks.has(b)) {
        parsedStacks.push([b]);
      }
    });

    return parsedStacks;
  };

  const handleApplyCustomSetup = () => {
    try {
      const parsedStart = parseBlocksInputString(customStartInput, 'Start arrangement');
      const parsedGoal = parseBlocksInputString(customGoalInput, 'Goal arrangement');
      setStartStacks(parsedStart);
      setGoalStacks(parsedGoal);
      setInputError('');
      handleRun(parsedStart, parsedGoal);
    } catch (err) {
      setInputError(err.message);
    }
  };

  // Generate random block layout distributed across 3 to 4 stack positions/stages
  const generateRandomStacks3To4 = () => {
    const blocks = ['A', 'B', 'C', 'D'].sort(() => Math.random() - 0.5);
    const numStacks = Math.floor(Math.random() * 2) + 3; // 3 or 4 stack stages
    const stacks = Array.from({ length: numStacks }, () => []);
    blocks.forEach((b) => {
      const idx = Math.floor(Math.random() * numStacks);
      stacks[idx].push(b);
    });
    return stacks.filter((s) => s.length > 0);
  };

  const handleRandomizeBlocks = () => {
    let rStart = generateRandomStacks3To4();
    let rGoal = generateRandomStacks3To4();
    let attempts = 0;
    while (JSON.stringify(rStart) === JSON.stringify(rGoal) && attempts < 10) {
      rGoal = generateRandomStacks3To4();
      attempts++;
    }
    setStartStacks(rStart);
    setGoalStacks(rGoal);
    setCustomStartInput(formatStacksString(rStart));
    setCustomGoalInput(formatStacksString(rGoal));
    setInputError('');
    handleRun(rStart, rGoal);
  };

  const history = result?.history || [];
  const totalSteps = history.length;
  const currentFrame = history[currentStep] || null;
  const activeStacks = currentFrame?.state || startStacks;
  const activeAction = currentFrame?.action || 'Initial Configuration';

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
      }, 700 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, speed]);

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>Module 4 — Blocks World Planning</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={() => {
              const defaultStart = [['A', 'B'], ['C'], ['D']];
              const defaultGoal = [['D', 'C', 'B', 'A']];
              setStartStacks(defaultStart);
              setGoalStacks(defaultGoal);
              setCustomStartInput(formatStacksString(defaultStart));
              setCustomGoalInput(formatStacksString(defaultGoal));
              setInputError('');
              handleRun(defaultStart, defaultGoal);
            }}
          >
            Default Single Tower Goal [D,C,B,A]
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              const start2x2 = [['A'], ['B'], ['C'], ['D']];
              const goal2x2 = [['A', 'C'], ['B', 'D']];
              setStartStacks(start2x2);
              setGoalStacks(goal2x2);
              setCustomStartInput(formatStacksString(start2x2));
              setCustomGoalInput(formatStacksString(goal2x2));
              setInputError('');
              handleRun(start2x2, goal2x2);
            }}
            style={{ borderColor: 'var(--accent-green)' }}
          >
            2×2 Goal Preset [A,C] [B,D]
          </button>
          <button
            className="btn-secondary"
            onClick={handleRandomizeBlocks}
            disabled={isLoading}
            style={{ borderColor: 'var(--accent-cyan)' }}
          >
            🎲 Random Layout (3–4 Stages)
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

      {/* CUSTOM USER CONFIGURATION BAR FOR START AND GOAL */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          marginTop: '1rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-glass)',
          padding: '1rem 1.2rem',
          borderRadius: '12px'
        }}
      >
        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={18} /> Custom Block Arrangement Inputs:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
              Initial Start Stacks (e.g. <code>[A, B], [C], [D]</code> or <code>A, B / C / D</code>):
            </label>
            <input
              type="text"
              value={customStartInput}
              onChange={(e) => {
                setCustomStartInput(e.target.value);
                setInputError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyCustomSetup();
              }}
              placeholder="[A, B], [C], [D]"
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.8)',
                border: inputError ? '1px solid #ef4444' : '1px solid var(--border-glass-light)',
                color: '#fff',
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
              Target Goal Stacks (e.g. <code>[A, C], [B, D]</code> or <code>A, C / B, D</code>):
            </label>
            <input
              type="text"
              value={customGoalInput}
              onChange={(e) => {
                setCustomGoalInput(e.target.value);
                setInputError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyCustomSetup();
              }}
              placeholder="[A, C], [B, D]"
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.8)',
                border: inputError ? '1px solid #ef4444' : '1px solid var(--border-glass-light)',
                color: '#fff',
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
          <button
            className="btn-primary"
            onClick={handleApplyCustomSetup}
            disabled={isLoading}
            style={{ padding: '0.55rem 1.2rem' }}
          >
            Apply Custom Setup & Plan
          </button>

          {inputError && (
            <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '600' }}>
              ⚠️ {inputError}
            </span>
          )}
        </div>
      </div>

      {/* TOP SECTION: Action Frame & Physical Blocks Stage */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.2rem',
          marginTop: '1.2rem',
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '1.5rem'
        }}
      >
        <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
          Action ({currentStep}/{totalSteps > 0 ? totalSteps - 1 : 0}): {activeAction}
        </div>

        <div className="blocks-stage" style={{ width: '100%', maxWidth: '700px' }}>
          {activeStacks.map((stack, sIdx) => (
            <div key={sIdx} className="block-stack">
              {stack.map((blockName, bIdx) => (
                <div key={bIdx} className={`block-item block-${blockName}`}>
                  {blockName}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Target Goal Arrangement:{' '}
          <strong style={{ color: 'var(--accent-cyan)' }}>
            {goalStacks.map((s) => `[${s.join(', ')}]`).join(' ')}
          </strong>
        </div>
      </div>

      {/* BOTTOM SECTION: Metrics & Plan Action Sequence placed directly beneath the Action frame */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
        {/* 3-Column Metrics Grid */}
        <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="metric-card">
            <span className="metric-label">Planner Result</span>
            <span
              className="metric-value"
              style={{
                color: result
                  ? result.solved
                    ? 'var(--accent-green)'
                    : 'var(--accent-red)'
                  : 'var(--text-muted)'
              }}
            >
              {result ? (result.solved ? 'Plan Generated!' : 'No Plan Found') : 'Ready'}
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Plan Length</span>
            <span className="metric-value">{result?.solution_quality ?? 0} actions</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">States Explored</span>
            <span className="metric-value">{result?.nodes_expanded ?? 0}</span>
          </div>
        </div>

        {/* Full-width Plan Action Sequence Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            padding: '1.2rem'
          }}
        >
          <div
            style={{
              fontWeight: '700',
              marginBottom: '0.8rem',
              color: 'var(--accent-cyan)',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Layers size={18} /> Plan Action Sequence:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '0.6rem',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '0.4rem'
            }}
          >
            {result?.path && result.path.length > 0 ? (
              result.path.map((act, i) => {
                const isActive = i + 1 === currentStep;
                return (
                  <div
                    key={i}
                    style={{
                      background: isActive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: isActive ? '1px solid var(--accent-amber)' : '1px solid var(--border-glass)',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? 'var(--accent-amber)' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{i + 1}.</span>
                    <span>{act}</span>
                  </div>
                );
              })
            ) : (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Run planner to generate action steps...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
