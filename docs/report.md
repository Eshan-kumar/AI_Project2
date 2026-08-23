# Final Project Report — AI Search & Planning Playground

**Project Name:** AI Search & Planning Playground  
**Target Specification:** `search_planning_toolkit_spec.md`  
**Date:** August 21, 2026  

---

## Executive Summary

The **AI Search & Planning Playground** is a unified interactive web application and Python algorithmic core designed to demonstrate, visualize, and benchmark classical artificial intelligence search and planning techniques. The platform implements four core problem domains spanning uninformed search, heuristic search, local search optimization, and state-space planning.

---

## Algorithmic Results & Comparative Analysis

### 1. Grid Pathfinding (10×10 Maze)
- **BFS (Breadth-First Search)**: Guarantees shortest path length (18 steps) but explores unguided in all directions, expanding **64 nodes**.
- **DFS (Depth-First Search)**: Follows deep branches quickly with low memory overhead, but finds a non-optimal path (26 steps) while expanding **28 nodes**.
- **A\* (Manhattan Distance)**: Combines path cost $g(n)$ and admissible heuristic $h(n)$ to find the optimal path (18 steps) while expanding only **38 nodes**, focusing exploration towards the goal.

### 2. 8-Puzzle Sliding Tile Search
- **UCS (Uniform Cost Search)**: Expands **423 nodes** to find the optimal 9-move solution.
- **Greedy Best-First Search**: Rapidly expands **10 nodes** using heuristic direction, finding a 9-move solution.
- **A\* (Misplaced Tiles Heuristic)**: Admissible heuristic measuring out-of-place tiles, expanding **30 nodes**.
- **A\* (Manhattan Distance Heuristic)**: Admissible and dominant heuristic measuring total coordinate distance, expanding only **12 nodes** (over 2.5x more efficient than Misplaced tiles!).

### 3. N-Queens Local Search (8-Queens)
- **Steepest-Ascent Hill Climbing**: Rapidly improves queen positions but gets trapped on local optima / plateaus (remaining with 1 attacking pair).
- **Simulated Annealing**: Uses temperature decay $T = T_0 \times \alpha$ to accept non-improving moves with probability $e^{-\Delta E / T}$, successfully escaping local traps to reach zero conflicts (0 attacking pairs).
- **Genetic Algorithm**: Evolves a population over generations, maintaining global diversity through selection, crossover, and mutation.

### 4. Blocks World Planning
- **State-Space Planner**: Formulates block arrangements as canonical state tuples `( ('A', 'B'), ('C',) )` and applies legal move operators `Move(block, from_loc, to_loc)`. Finds optimal 2-step plan while exploring only **9 states**.

---

## System Benchmark Summary Table

| Domain | Algorithm | Solved | Nodes Expanded | Time (ms) | Solution Quality |
|---|---|---|---|---|---|
| Maze | BFS | True | 64 | 0.105 ms | 18 steps |
| Maze | DFS | True | 28 | 0.046 ms | 26 steps |
| Maze | A* (Manhattan) | True | 38 | 0.082 ms | 18 steps |
| 8-Puzzle | UCS | True | 423 | 1.309 ms | 9 moves |
| 8-Puzzle | Greedy | True | 10 | 0.090 ms | 9 moves |
| 8-Puzzle | A* (Misplaced) | True | 30 | 0.141 ms | 9 moves |
| 8-Puzzle | A* (Manhattan) | True | 12 | 0.069 ms | 9 moves |
| N-Queens | Hill Climbing | False | 280 | 0.721 ms | 1 conflict (stuck) |
| N-Queens | Simulated Annealing | True | 672 | 2.455 ms | 0 conflicts |
| Blocks World | State-Space Planner | True | 9 | 0.060 ms | 2 plan steps |

---
