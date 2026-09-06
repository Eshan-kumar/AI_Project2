import time
import heapq
from typing import List, Tuple, Dict, Any, Optional, Set
from shared.result_schema import BenchmarkResult

GOAL_STATE: Tuple[int, ...] = (1, 2, 3, 4, 5, 6, 7, 8, 0)

# 3x3 goal coordinates for each tile value (1..8)
GOAL_POSITIONS: Dict[int, Tuple[int, int]] = {
    1: (0, 0), 2: (0, 1), 3: (0, 2),
    4: (1, 0), 5: (1, 1), 6: (1, 2),
    7: (2, 0), 8: (2, 1), 0: (2, 2)
}

def is_solvable(state: Tuple[int, ...]) -> bool:
    """Checks inversion count parity for 3x3 puzzle (ignoring blank tile 0)."""
    tiles = [t for t in state if t != 0]
    inversions = 0
    for i in range(len(tiles)):
        for j in range(i + 1, len(tiles)):
            if tiles[i] > tiles[j]:
                inversions += 1
    return inversions % 2 == 0

def h_misplaced(state: Tuple[int, ...]) -> int:
    """Counts misplaced tiles (excluding blank 0)."""
    return sum(1 for i in range(9) if state[i] != 0 and state[i] != GOAL_STATE[i])

def h_manhattan(state: Tuple[int, ...]) -> int:
    """Sum of Manhattan distances of each tile from its target goal position."""
    dist = 0
    for idx, tile in enumerate(state):
        if tile != 0:
            r, c = divmod(idx, 3)
            gr, gc = GOAL_POSITIONS[tile]
            dist += abs(r - gr) + abs(c - gc)
    return dist

def get_neighbors(state: Tuple[int, ...]) -> List[Tuple[Tuple[int, ...], str]]:
    """Returns valid successor states and blank movement direction ('Up', 'Down', 'Left', 'Right')."""
    blank_idx = state.index(0)
    r, c = divmod(blank_idx, 3)
    neighbors = []

    moves = [
        (-1, 0, "Up"),
        (1, 0, "Down"),
        (0, -1, "Left"),
        (0, 1, "Right")
    ]

    for dr, dc, move_name in moves:
        nr, nc = r + dr, c + dc
        if 0 <= nr < 3 and 0 <= nc < 3:
            swap_idx = nr * 3 + nc
            state_list = list(state)
            state_list[blank_idx], state_list[swap_idx] = state_list[swap_idx], state_list[blank_idx]
            neighbors.append((tuple(state_list), move_name))

    return neighbors

def solve_puzzle(start_state: Tuple[int, ...], algorithm: str = "A* (Manhattan)", max_expansions: int = 50000) -> BenchmarkResult:
    start_time = time.perf_counter()
    
    if len(start_state) != 9:
        raise ValueError("8-puzzle state must be a tuple of 9 integers (0..8).")

    if not is_solvable(start_state):
        end_time = time.perf_counter()
        return BenchmarkResult(
            problem="8-Puzzle",
            algorithm=algorithm,
            solved=False,
            nodes_expanded=0,
            time_taken_ms=round((end_time - start_time) * 1000, 3),
            solution_quality=0,
            path=[start_state],
            history=[{"state": start_state, "move": "Unsolvable state"}],
            details={"error": "Unsolvable puzzle permutation"}
        )

    algo = algorithm.strip()

    # Define heuristic function
    if algo == "UCS":
        h_func = lambda s: 0
        use_g = True
    elif algo == "Greedy":
        h_func = h_manhattan
        use_g = False
    elif "Misplaced" in algo:
        h_func = h_misplaced
        use_g = True
    elif "Manhattan" in algo or "A*" in algo:
        h_func = h_manhattan
        use_g = True
    else:
        h_func = h_manhattan
        use_g = True

    # Priority Queue: (f_value, counter, state)
    counter = 0
    open_set = []
    initial_h = h_func(start_state)
    initial_f = initial_h if not use_g else initial_h
    heapq.heappush(open_set, (initial_f, counter, start_state))

    g_score = {start_state: 0}
    parent = {}
    move_made = {}
    visited = set()
    history = []
    nodes_expanded = 0
    solved = False

    while open_set and nodes_expanded < max_expansions:
        f, _, curr = heapq.heappop(open_set)
        
        if curr in visited:
            continue
        visited.add(curr)
        nodes_expanded += 1

        history.append({
            "state": curr,
            "move": move_made.get(curr, "Start"),
            "g": g_score.get(curr, 0),
            "h": h_func(curr)
        })

        if curr == GOAL_STATE:
            solved = True
            break

        curr_g = g_score[curr]

        for nxt_state, move in get_neighbors(curr):
            tentative_g = curr_g + 1
            if nxt_state not in g_score or tentative_g < g_score[nxt_state]:
                g_score[nxt_state] = tentative_g
                parent[nxt_state] = curr
                move_made[nxt_state] = move
                
                h_val = h_func(nxt_state)
                f_val = (tentative_g + h_val) if use_g else h_val
                
                counter += 1
                heapq.heappush(open_set, (f_val, counter, nxt_state))

    end_time = time.perf_counter()
    time_taken_ms = round((end_time - start_time) * 1000, 3)

    if solved:
        # Reconstruct path
        path = []
        curr = GOAL_STATE
        while curr in parent:
            path.append(curr)
            curr = parent[curr]
        path.append(start_state)
        path.reverse()
        solution_length = len(path) - 1
    else:
        path = [start_state]
        solution_length = 0

    return BenchmarkResult(
        problem="8-Puzzle",
        algorithm=algorithm,
        solved=solved,
        nodes_expanded=nodes_expanded,
        time_taken_ms=time_taken_ms,
        solution_quality=solution_length,
        path=path,
        history=history,
        details={"solvable": True, "start_state": start_state}
    )
