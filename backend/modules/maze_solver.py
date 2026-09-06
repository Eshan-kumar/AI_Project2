import time
import heapq
from collections import deque
from typing import List, Tuple, Dict, Any, Optional, Set
from shared.result_schema import BenchmarkResult

# Grid cell values: 0 = Empty, 1 = Wall, 2 = Start, 3 = Goal

DEFAULT_MAZE_10X10 = [
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
]

def manhattan_distance(p1: Tuple[int, int], p2: Tuple[int, int]) -> int:
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

def get_neighbors(cell: Tuple[int, int], rows: int, cols: int, grid: List[List[int]]) -> List[Tuple[int, int]]:
    r, c = cell
    neighbors = []
    # Up, Right, Down, Left
    for dr, dc in [(-1, 0), (0, 1), (1, 0), (0, -1)]:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != 1:
            neighbors.append((nr, nc))
    return neighbors

def reconstruct_path(parent: Dict[Tuple[int, int], Tuple[int, int]], start: Tuple[int, int], goal: Tuple[int, int]) -> List[Tuple[int, int]]:
    path = []
    curr = goal
    while curr in parent:
        path.append(curr)
        curr = parent[curr]
    path.append(start)
    path.reverse()
    return path

def solve_maze(grid: List[List[int]], start: Tuple[int, int] = (0, 0), goal: Tuple[int, int] = (9, 9), algorithm: str = "A*") -> BenchmarkResult:
    rows = len(grid)
    cols = len(grid[0])
    
    start_time = time.perf_counter()
    history = []  # frames logging (explored_cell, current_frontier)
    parent = {}
    visited = set()
    nodes_expanded = 0
    solved = False
    final_path = []

    if grid[start[0]][start[1]] == 1 or grid[goal[0]][goal[1]] == 1:
        end_time = time.perf_counter()
        return BenchmarkResult(
            problem="Maze",
            algorithm=algorithm,
            solved=False,
            nodes_expanded=0,
            time_taken_ms=round((end_time - start_time) * 1000, 3),
            solution_quality=0,
            path=[],
            history=[]
        )

    algo = algorithm.strip().upper()

    if algo == "BFS":
        queue = deque([start])
        visited.add(start)
        history.append({"curr": start, "frontier": list(queue), "visited": list(visited)})

        while queue:
            curr = queue.popleft()
            nodes_expanded += 1

            if curr == goal:
                solved = True
                break

            for nxt in get_neighbors(curr, rows, cols, grid):
                if nxt not in visited:
                    visited.add(nxt)
                    parent[nxt] = curr
                    queue.append(nxt)

            history.append({
                "curr": curr,
                "frontier": list(queue),
                "visited": list(visited)
            })

    elif algo == "DFS":
        stack = [start]
        visited.add(start)
        history.append({"curr": start, "frontier": list(stack), "visited": list(visited)})

        while stack:
            curr = stack.pop()
            nodes_expanded += 1

            if curr == goal:
                solved = True
                break

            for nxt in get_neighbors(curr, rows, cols, grid):
                if nxt not in visited:
                    visited.add(nxt)
                    parent[nxt] = curr
                    stack.append(nxt)

            history.append({
                "curr": curr,
                "frontier": list(stack),
                "visited": list(visited)
            })

    elif "A*" in algo or "A-STAR" in algo:
        # Priority Queue: (f_score, counter, cell)
        counter = 0
        open_set = []
        heapq.heappush(open_set, (manhattan_distance(start, goal), counter, start))
        
        g_score = {start: 0}
        visited.add(start)
        history.append({"curr": start, "frontier": [start], "visited": list(visited)})

        while open_set:
            f, _, curr = heapq.heappop(open_set)
            nodes_expanded += 1

            if curr == goal:
                solved = True
                break

            for nxt in get_neighbors(curr, rows, cols, grid):
                tentative_g = g_score[curr] + 1
                if nxt not in g_score or tentative_g < g_score[nxt]:
                    g_score[nxt] = tentative_g
                    f_score = tentative_g + manhattan_distance(nxt, goal)
                    parent[nxt] = curr
                    visited.add(nxt)
                    counter += 1
                    heapq.heappush(open_set, (f_score, counter, nxt))

            history.append({
                "curr": curr,
                "frontier": [item[2] for item in open_set],
                "visited": list(visited)
            })
    else:
        raise ValueError(f"Unknown maze algorithm: {algorithm}")

    end_time = time.perf_counter()
    time_taken_ms = round((end_time - start_time) * 1000, 3)

    if solved:
        final_path = reconstruct_path(parent, start, goal)
        path_length = len(final_path) - 1
    else:
        path_length = 0

    return BenchmarkResult(
        problem="Maze",
        algorithm=algorithm,
        solved=solved,
        nodes_expanded=nodes_expanded,
        time_taken_ms=time_taken_ms,
        solution_quality=path_length,
        path=final_path,
        history=history,
        details={"rows": rows, "cols": cols, "start": start, "goal": goal}
    )
