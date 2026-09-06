import time
import math
import random
from typing import List, Tuple, Dict, Any, Optional
from shared.result_schema import BenchmarkResult

def count_conflicts(board: List[int]) -> int:
    """Calculates number of attacking pairs of queens on N x N board."""
    n = len(board)
    conflicts = 0
    for i in range(n):
        for j in range(i + 1, n):
            # Same row
            if board[i] == board[j]:
                conflicts += 1
            # Same diagonal: |row_i - row_j| == |col_i - col_j|
            elif abs(board[i] - board[j]) == abs(i - j):
                conflicts += 1
    return conflicts

def get_neighbors(board: List[int]) -> List[Tuple[List[int], int, int]]:
    """Generates all possible neighbor states by moving 1 queen in its column."""
    n = len(board)
    neighbors = []
    for col in range(n):
        orig_row = board[col]
        for row in range(n):
            if row != orig_row:
                new_board = list(board)
                new_board[col] = row
                neighbors.append((new_board, col, row))
    return neighbors

def solve_nqueens(n: int = 8, algorithm: str = "Simulated Annealing", initial_board: Optional[List[int]] = None, seed: Optional[int] = 42) -> BenchmarkResult:
    start_time = time.perf_counter()
    if seed is not None:
        random.seed(seed)

    if initial_board is not None and len(initial_board) == n:
        current_board = list(initial_board)
    else:
        current_board = [random.randint(0, n - 1) for _ in range(n)]

    current_conflicts = count_conflicts(current_board)
    history = []
    iterations = 0
    nodes_expanded = 0
    solved = False
    algo = algorithm.strip()

    history.append({
        "iteration": 0,
        "board": list(current_board),
        "conflicts": current_conflicts,
        "action": "Initial Configuration"
    })

    if "HILL" in algo.upper():
        # Steepest Ascent Hill Climbing
        max_iterations = 1000
        while iterations < max_iterations:
            if current_conflicts == 0:
                solved = True
                break

            iterations += 1
            neighbors = get_neighbors(current_board)
            nodes_expanded += len(neighbors)

            best_neighbor = None
            best_conflicts = current_conflicts

            # Find neighbor with strictly minimal conflicts (steepest descent)
            for neigh_board, col, row in neighbors:
                c = count_conflicts(neigh_board)
                if c < best_conflicts:
                    best_conflicts = c
                    best_neighbor = neigh_board

            # If no neighbor strictly improves, we are stuck on a local optimum / plateau
            if best_neighbor is None or best_conflicts >= current_conflicts:
                # Local optimum hit!
                break

            current_board = best_neighbor
            current_conflicts = best_conflicts

            history.append({
                "iteration": iterations,
                "board": list(current_board),
                "conflicts": current_conflicts,
                "action": f"Moved to better state (conflicts={current_conflicts})"
            })

    elif "SIMULATED" in algo.upper() or "ANNEALING" in algo.upper() or "SA" in algo.upper():
        # Simulated Annealing
        temp = 100.0
        cooling_rate = 0.992
        min_temp = 0.0001
        max_iterations = 5000

        while temp > min_temp and iterations < max_iterations:
            if current_conflicts == 0:
                solved = True
                break

            iterations += 1
            temp *= cooling_rate

            # Pick a random neighbor
            col = random.randint(0, n - 1)
            row = random.randint(0, n - 1)
            while row == current_board[col]:
                row = random.randint(0, n - 1)

            next_board = list(current_board)
            next_board[col] = row
            nodes_expanded += 1

            next_conflicts = count_conflicts(next_board)
            delta_e = next_conflicts - current_conflicts

            # Accept if better, or with probability e^(-delta_e / T) if worse
            if delta_e < 0 or random.random() < math.exp(-delta_e / temp):
                current_board = next_board
                current_conflicts = next_conflicts
                action = f"Accepted move (conflicts={current_conflicts}, T={temp:.2f})"
            else:
                action = f"Rejected worse move (delta={delta_e}, T={temp:.2f})"

            if iterations % 5 == 0 or current_conflicts == 0:
                history.append({
                    "iteration": iterations,
                    "board": list(current_board),
                    "conflicts": current_conflicts,
                    "temp": round(temp, 4),
                    "action": action
                })

        if current_conflicts == 0:
            solved = True

    elif "GENETIC" in algo.upper() or "GA" in algo.upper():
        # Genetic Algorithm
        pop_size = 100
        mutation_rate = 0.15
        max_generations = 1000

        # Initialize population
        population = [[random.randint(0, n - 1) for _ in range(n)] for _ in range(pop_size)]
        if current_board:
            population[0] = list(current_board)
        
        for gen in range(max_generations):
            iterations += 1

            # Fitness: max_possible_pairs - conflicts
            max_pairs = (n * (n - 1)) // 2
            scores = [(max_pairs - count_conflicts(ind), ind) for ind in population]
            scores.sort(key=lambda x: x[0], reverse=True)
            nodes_expanded += len(population)

            best_fit, best_ind = scores[0]
            curr_conflicts = max_pairs - best_fit

            if gen % 10 == 0 or curr_conflicts == 0:
                history.append({
                    "iteration": gen,
                    "board": list(best_ind),
                    "conflicts": curr_conflicts,
                    "action": f"Generation {gen} (best conflicts={curr_conflicts})"
                })

            if curr_conflicts == 0:
                current_board = best_ind
                current_conflicts = 0
                solved = True
                break

            # Selection (top 50%) & Crossover
            survivors = [ind for _, ind in scores[:pop_size // 2]]
            next_pop = list(survivors)

            while len(next_pop) < pop_size:
                p1, p2 = random.sample(survivors, 2)
                crossover_pt = random.randint(1, n - 1)
                child = p1[:crossover_pt] + p2[crossover_pt:]

                # Mutation
                if random.random() < mutation_rate:
                    child[random.randint(0, n - 1)] = random.randint(0, n - 1)

                next_pop.append(child)

            population = next_pop

        current_board = history[-1]["board"]
        current_conflicts = history[-1]["conflicts"]

    else:
        raise ValueError(f"Unknown N-Queens algorithm: {algorithm}")

    end_time = time.perf_counter()
    time_taken_ms = round((end_time - start_time) * 1000, 3)

    return BenchmarkResult(
        problem="N-Queens",
        algorithm=algorithm,
        solved=solved,
        nodes_expanded=nodes_expanded,
        time_taken_ms=time_taken_ms,
        solution_quality=current_conflicts,
        path=[current_board],
        history=history,
        details={"n": n, "iterations": iterations, "final_conflicts": current_conflicts}
    )
