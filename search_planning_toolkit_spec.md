# AI Search & Planning Toolkit — Full Implementation Specification

## ⚠️ INSTRUCTIONS FOR THE CODING AGENT — READ FIRST

Before writing any code, **produce a full Implementation Report** and present it back for review. Do NOT start building until this report has been shared. The report must include:

1. **Understanding summary** — restate the project scope in your own words to confirm correct understanding of all 4 problems and their algorithms.
2. **Proposed tech stack** — language(s), frameworks/libraries, and why.
3. **Proposed architecture** — module/file breakdown, how the 4 problem modules connect to the shared dashboard and UI shell.
4. **Data/result schema** — the exact shared format each algorithm run will log (fields, types) for the dashboard.
5. **Build order** — the sequence you'll implement things in, mapped against the 4-day timeline below.
6. **Risks/open questions** — anything ambiguous in this spec that needs a decision before coding starts (e.g., exact heuristics, grid sizes, random seeds).

Only after this report is reviewed and approved should implementation begin. Build incrementally and confirm each problem module works independently before wiring it into the shared dashboard/UI shell.

---

## Project Overview

Build an **AI Search & Planning Playground**: a single web app containing **4 classic AI problems**, each solved using **multiple search/planning algorithms**, with a shared benchmarking dashboard comparing performance across all of them. This demonstrates the full breadth of Unit II (Search) and Unit V (Planning) from the syllabus in one cohesive, presentable project.

The project is split into 4 independent problem modules (one per team member) plus a shared integration layer (built together on the final day).

---

## Tech Stack (recommended)

- **Frontend/Visualization:** HTML5 Canvas / React (if web) — needs to support animated step-by-step visualization for each problem
- **Logic/Backend:** Python (preferred for search/planning code clarity) or JavaScript if a pure client-side app is easier to deploy/demo
- **No ML libraries required** — this is classical AI (search & planning), not machine learning
- Keep everything in **one repo** with a consistent shared results format (see Shared Dashboard section) so all 4 modules plug into the same UI shell

---

## Module 1 — Maze / Grid Pathfinding

**Owner: Person A**

### Requirements
- Configurable grid (recommend default **10×10**, with walls/obstacles placed either manually or via a simple maze-generation algorithm)
- Start cell and goal cell clearly marked
- Implement algorithms:
  - **BFS** (Breadth-First Search)
  - **DFS** (Depth-First Search)
  - **A\*** with Manhattan distance heuristic
- Each algorithm run must return: path found (Y/N), path length, nodes expanded, execution time
- **Visualization:** animate which cells are explored (a "frontier" color) before the final path is highlighted — this is the single most important visual output of this module, since it makes the difference between blind (BFS/DFS) and heuristic-guided (A*) search immediately visible
- Allow switching between algorithms on the same maze instance for direct side-by-side comparison

### Deliverable
A `maze_solver` module exposing a common interface, e.g. `solve(maze, algorithm) -> {path, nodes_expanded, time_taken, path_length}`, plus a renderer that can replay the exploration step-by-step.

---

## Module 2 — 8-Puzzle (Sliding Tile Puzzle)

**Owner: Person B**

### Requirements
- Standard 3×3 sliding puzzle (tiles 1–8 + blank), with a shuffled start state (ensure it's solvable — 8-puzzle solvability depends on permutation parity, so validate this before use)
- Implement algorithms:
  - **Uniform Cost Search (UCS)**
  - **Greedy Best-First Search** using a heuristic
  - **A\*** using **two different heuristics**, tested separately:
    - Heuristic 1: number of misplaced tiles
    - Heuristic 2: sum of Manhattan distances of each tile from its goal position
- Each run must return: solution found (Y/N), solution length (moves), nodes expanded, execution time
- **Comparison angle to highlight:** run A* with both heuristics on the *same* shuffled start and show that Manhattan distance expands far fewer nodes — this directly demonstrates the syllabus concept of heuristic quality/admissibility
- **Visualization:** show the tile board animating through the solution moves once found

### Deliverable
A `puzzle_solver` module exposing `solve(start_state, algorithm, heuristic=None) -> {path, nodes_expanded, time_taken, solution_length}`, plus a step-through animator for the solved sequence.

---

## Module 3 — N-Queens (Local Search)

**Owner: Person C**

### Requirements
- Standard N-Queens problem, default **N=8**
- Implement algorithms:
  - **Hill Climbing** (steepest-ascent, minimizing number of attacking queen pairs)
  - **Simulated Annealing** (with a cooling schedule, to escape local optima that hill climbing gets stuck in)
  - *(Stretch goal, if time allows)*: a simple **Genetic Algorithm** variant for extra comparison richness
- Each run must return: solution found (Y/N), final conflict count, iterations taken, execution time
- Important: Hill Climbing should be shown *failing* to reach a solution on at least one run (getting stuck on a local optimum/plateau) to visually demonstrate why Simulated Annealing exists — this is a great presentation moment
- **Visualization:** animate the board updating queen-by-queen (or iteration-by-iteration) as the algorithm improves the configuration, with a live "conflict count" readout

### Deliverable
A `nqueens_solver` module exposing `solve(n, algorithm) -> {solved, final_conflicts, iterations, time_taken, board_history}`, plus a renderer that steps through `board_history` to animate convergence.

---

## Module 4 — Blocks World Planning

**Owner: Person D**

### Requirements
- Classic Blocks World: a set of labeled blocks (recommend 3–5 blocks) on a table, in some start arrangement, with a goal arrangement to reach (e.g., start: A on table, B on A, C on table → goal: C on B, B on A)
- Represent state as block positions (on-table or on-another-block) plus a "clear" predicate (nothing on top)
- Define actions with preconditions/effects, e.g. `Move(X, Y)`: precondition `Clear(X), Clear(Y)`, effect `On(X,Y)`, removes previous `On(X, Z)`
- Implement **one** of the following (pick based on time available):
  - **State-space search planner** (treat each valid arrangement as a search state, use BFS/A* over states to find an action sequence to the goal) — recommended, reuses Module 1's search logic conceptually
  - *(Stretch goal)* a basic **planning graph** (Graphplan-style layers of actions/literals)
- Each run must return: plan found (Y/N), sequence of actions, plan length, nodes expanded, execution time
- **Visualization:** show blocks physically rearranging step-by-step as each planned action executes

### Deliverable
A `blocks_planner` module exposing `plan(start_state, goal_state) -> {actions, plan_length, nodes_expanded, time_taken}`, plus a renderer animating the block moves in sequence.

---

## Shared Dashboard & Integration Layer

**Built together by all 4, primarily on the final day**

### Shared result schema
Every algorithm run, regardless of problem, must log results in this common format so they can all appear in one dashboard table:

```json
{
  "problem": "Maze | 8-Puzzle | N-Queens | Blocks World",
  "algorithm": "string",
  "solved": true,
  "nodes_expanded": 0,
  "time_taken_ms": 0,
  "solution_quality": 0,  // path length / moves / plan length / final conflicts
}
```

### Shared UI shell
- A single app with a **problem-selector** (tabs or menu: Maze / 8-Puzzle / N-Queens / Blocks World)
- Each tab shows that problem's own visualization, using **consistent controls** across all four: `Run`, `Step`, `Reset`, `Speed` slider
- A separate **Dashboard / Leaderboard tab** that aggregates all logged runs into one comparison table/chart (e.g., a bar chart of nodes expanded across all algorithm+problem combinations run so far)

### Integration checklist
- [ ] All 4 modules expose their `solve()`/`plan()` function via the shared result schema
- [ ] All 4 visualizations are wired into the tabbed UI shell
- [ ] Dashboard tab correctly aggregates and displays results from all 4 problems
- [ ] End-to-end run-through tested: launch app → run every algorithm on every problem → confirm dashboard populates correctly

---

## Suggested File Structure

```
search-planning-toolkit/
├── README.md
├── docs/
│   ├── implementation_report.md   # produced BEFORE coding starts (see instructions above)
│   └── report.md                  # final write-up: algorithms used, sample results, screenshots
├── main.py / app.js               # entrypoint, ties UI shell + all modules together
├── modules/
│   ├── maze_solver.py             # Module 1 — Person A
│   ├── puzzle_solver.py           # Module 2 — Person B
│   ├── nqueens_solver.py          # Module 3 — Person C
│   └── blocks_planner.py          # Module 4 — Person D
├── visualization/
│   ├── maze_view.*
│   ├── puzzle_view.*
│   ├── nqueens_view.*
│   ├── blocks_view.*
│   └── dashboard_view.*
├── shared/
│   └── result_schema.py           # common logging format used by all 4 modules
└── tests/
    ├── test_maze_solver.py
    ├── test_puzzle_solver.py
    ├── test_nqueens_solver.py
    └── test_blocks_planner.py
```

---

## Presentation Guidance

Structure the presentation by **algorithm family / concept**, not by person, so it reads as one cohesive project:

1. **Uninformed Search** (Module 1: BFS, DFS) — explain blind search, show maze exploration animation
2. **Informed Search** (Modules 1 & 2: A*, Greedy, heuristics) — explain heuristic-guided search, show the two-heuristic A* comparison on the 8-puzzle as the key "aha" moment
3. **Local Search** (Module 3: Hill Climbing vs Simulated Annealing) — explain local optima, show Hill Climbing getting stuck vs Simulated Annealing succeeding
4. **Planning** (Module 4: Blocks World) — explain how planning differs from search (reasoning over actions with preconditions/effects, not just states), show the block-moving animation
5. **Closing: Dashboard** — show the aggregated comparison table/chart across all 4 problems as the unifying conclusion, tying back to "which algorithm to use when" as the big-picture takeaway

---

## Build Order / Timeline (target: finish by the 25th)

| Day | Person A (Maze) | Person B (8-Puzzle) | Person C (N-Queens) | Person D (Blocks World) |
|---|---|---|---|---|
| **Day 0 (today)** | Coding agent produces Implementation Report for review before any code is written | | | |
| **Day 1** | Build grid + BFS/DFS | Build puzzle state rep + solvability check + UCS | Build board rep + Hill Climbing | Build block state rep + action rules |
| **Day 2** | Add A* + heuristic, wire into shared result schema | Add Greedy + A* with both heuristics, wire into shared result schema | Add Simulated Annealing, wire into shared result schema | Implement state-space planner, wire into shared result schema |
| **Day 3** | Polish visualization/animation | Polish visualization/animation | Polish visualization/animation, ensure a "stuck" hill-climbing case is demoable | Polish visualization/animation |
| **Day 4** | **Full team:** integrate all 4 modules into tabbed UI shell, build Dashboard tab, end-to-end test, build presentation deck, run a full dry-run demo | | | |

---

## Notes for the Coding Agent

- **Do not skip the Implementation Report step.** Submit it first and wait for confirmation before writing code.
- Favor **working, demoable modules** over exhaustive edge-case handling — each module should reliably run start-to-finish on its default configuration (10×10 maze, 3×3 puzzle, 8-Queens, 4-block world) even if broader configurability is limited.
- Keep all 4 modules **independent and self-testable** before integration — this mirrors how a 4-person team would actually build it, and makes debugging integration issues much easier.
- Use **fixed/seeded default scenarios** for the primary demo in each module (e.g., a specific maze layout, a specific shuffled puzzle, a specific block arrangement) so presentations are reliable and repeatable, while still allowing "Randomize" as a secondary option.
- The **two-heuristic A\* comparison on the 8-puzzle** and the **Hill Climbing failure vs Simulated Annealing success on N-Queens** are the two highest-value "aha" moments for the presentation — prioritize making these clearly visible and correctly reproducible over any other stretch goals.
