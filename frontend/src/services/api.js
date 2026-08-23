const API_BASE = 'http://localhost:8000/api';

export async function fetchPresets() {
  try {
    const res = await fetch(`${API_BASE}/presets`);
    if (!res.ok) throw new Error('Failed to fetch presets');
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return null;
  }
}

export async function solveMaze(grid, start, goal, algorithm) {
  const res = await fetch(`${API_BASE}/solve/maze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grid, start, goal, algorithm })
  });
  if (!res.ok) throw new Error('Failed to solve maze');
  return await res.json();
}

export async function solvePuzzle(start_state, algorithm) {
  const res = await fetch(`${API_BASE}/solve/puzzle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_state, algorithm })
  });
  if (!res.ok) throw new Error('Failed to solve 8-puzzle');
  return await res.json();
}

export async function solveNQueens(n, algorithm, initial_board = null, seed = 42) {
  const res = await fetch(`${API_BASE}/solve/nqueens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ n, algorithm, initial_board, seed })
  });
  if (!res.ok) throw new Error('Failed to solve N-Queens');
  return await res.json();
}

export async function planBlocks(start_stacks = null, goal_stacks = null, algorithm = 'State-Space Planner (BFS)') {
  const res = await fetch(`${API_BASE}/solve/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_stacks, goal_stacks, algorithm })
  });
  if (!res.ok) throw new Error('Failed to plan blocks');
  return await res.json();
}

export async function runBenchmarkAll() {
  const res = await fetch(`${API_BASE}/benchmark/all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to run benchmarks');
  return await res.json();
}
