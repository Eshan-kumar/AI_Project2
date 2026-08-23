# AI Search & Planning Playground

A web-based playground and benchmark toolkit demonstrating classic Artificial Intelligence search and planning algorithms across 4 core problem domains, built with a **Python 3.13 backend** and a modern **React (JSX) frontend**.

---

## 🚀 Features & Problem Modules

1. **Module 1 — 10×10 Grid Pathfinding**:
   - **Algorithms**: BFS, DFS, A* Search (Manhattan Distance).
   - **Visualizer**: Animated grid frontier exploration showing search order differences between blind (BFS/DFS) and informed (A*) search.

2. **Module 2 — 8-Puzzle (Sliding Tile)**:
   - **Algorithms**: UCS, Greedy Best-First, A* (Misplaced Tiles), A* (Manhattan Distance).
   - **Solvability Check**: Inversion count parity check before solving.
   - **Key Feature**: Live side-by-side heuristic comparison demonstrating Manhattan distance dominance (12 nodes vs 30 nodes for Misplaced tiles).

3. **Module 3 — N-Queens (Local Search)**:
   - **Algorithms**: Steepest-Ascent Hill Climbing, Simulated Annealing, Genetic Algorithm.
   - **Key Feature**: Live demo showing Hill Climbing getting trapped in local optima/plateaus vs Simulated Annealing finding zero-conflict global optima.

4. **Module 4 — Blocks World Planning**:
   - **Algorithms**: State-Space BFS / A* Planner over canonical predicate state graphs (`On`, `OnTable`, `Clear`).
   - **Visualizer**: Animated physical block stack movement sequence.

5. **Shared Integration Dashboard**:
   - Aggregated performance leaderboard table and visual bar charts comparing nodes expanded, execution time (ms), and solution quality across all algorithms.

---

## 📁 Repository Structure

```
c:/AI_Project2/
├── docs/
│   ├── implementation_report.md  # Architectural specification report
│   └── report.md                  # Final project analysis report
├── shared/
│   └── result_schema.py          # Unified BenchmarkResult schema
├── modules/
│   ├── maze_solver.py            # Module 1 (BFS, DFS, A*)
│   ├── puzzle_solver.py          # Module 2 (UCS, Greedy, A* Misplaced/Manhattan)
│   ├── nqueens_solver.py         # Module 3 (Hill Climbing, Simulated Annealing, GA)
│   └── blocks_planner.py         # Module 4 (State-Space Planner)
├── frontend/                     # React (JSX) Application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Controls.jsx
│   │   │   ├── MazeView.jsx
│   │   │   ├── PuzzleView.jsx
│   │   │   ├── NQueensView.jsx
│   │   │   ├── BlocksView.jsx
│   │   │   └── DashboardView.jsx
│   │   └── services/
│   │       └── api.js
│   └── package.json
├── tests/                        # Python Unit Test Suite
│   ├── test_maze_solver.py
│   ├── test_puzzle_solver.py
│   ├── test_nqueens_solver.py
│   └── test_blocks_planner.py
├── main.py                       # Python REST API Server
└── README.md
```

---

## 🛠️ How to Run

### 1. Run Python Unit Tests
```powershell
python -m unittest discover -s tests -p "test_*.py"
```

### 2. Start Python Backend API Server
```powershell
python main.py 8000
```
*API running on `http://localhost:8000`*

### 3. Start React JSX Frontend Dev Server
```powershell
cd frontend
npm install
npm run dev
```
*Web Playground running on `http://localhost:5173`*
