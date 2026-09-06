import time
import heapq
from collections import deque
from typing import List, Tuple, Dict, Any, Optional, Set
from shared.result_schema import BenchmarkResult

# A state is represented as a canonical tuple of stacks (each stack is a tuple of block names, e.g. ( ('A', 'B'), ('C',) ) )
# Bottom block in stack is on the table, top block is clear.

def canonical_state(stacks: List[List[str]]) -> Tuple[Tuple[str, ...], ...]:
    """Converts list of stacks into sorted canonical tuple representation."""
    cleaned = [tuple(stack) for stack in stacks if stack]
    cleaned.sort()
    return tuple(cleaned)

def parse_state(state_tuple: Tuple[Tuple[str, ...], ...]) -> List[List[str]]:
    """Converts canonical tuple representation back into list of stacks."""
    return [list(stack) for stack in state_tuple]

def get_possible_moves(state_tuple: Tuple[Tuple[str, ...], ...]) -> List[Tuple[Tuple[Tuple[str, ...], ...], str]]:
    """
    Generates all valid legal moves from current state.
    A move takes the top block from stack i and places it either:
    1. On the table (creating a new stack).
    2. On top of stack j (where j != i).
    """
    stacks = parse_state(state_tuple)
    num_stacks = len(stacks)
    moves = []

    for i in range(num_stacks):
        if not stacks[i]:
            continue

        # Top block of stack i
        top_block = stacks[i][-1]
        source_under = stacks[i][-2] if len(stacks[i]) > 1 else "TABLE"

        # Option 1: Move top_block to TABLE (only if it wasn't already alone on table)
        if len(stacks[i]) > 1:
            new_stacks = [list(st) for st in stacks]
            new_stacks[i].pop()
            new_stacks.append([top_block])
            action_desc = f"Move({top_block}, {source_under} -> TABLE)"
            moves.append((canonical_state(new_stacks), action_desc))

        # Option 2: Move top_block onto top of stack j
        for j in range(num_stacks):
            if i == j or not stacks[j]:
                continue
            target_top = stacks[j][-1]
            new_stacks = [list(st) for st in stacks]
            new_stacks[i].pop()
            new_stacks[j].append(top_block)
            action_desc = f"Move({top_block}, {source_under} -> {target_top})"
            moves.append((canonical_state(new_stacks), action_desc))

    return moves

def is_goal_satisfied(current_state: Tuple[Tuple[str, ...], ...], goal_state: Tuple[Tuple[str, ...], ...]) -> bool:
    """Checks if current state exactly matches the target goal state arrangement."""
    return current_state == goal_state

# Presets
DEFAULT_START_BLOCKS = ( ('A', 'B'), ('C',) )      # Stack 1: A (bottom), B (top); Stack 2: C
DEFAULT_GOAL_BLOCKS  = ( ('C', 'B', 'A'), )         # Stack: C (bottom), B (middle), A (top)

def plan_blocks(
    start_stacks: Optional[List[List[str]]] = None,
    goal_stacks: Optional[List[List[str]]] = None,
    algorithm: str = "State-Space Planner (BFS)"
) -> BenchmarkResult:
    start_time = time.perf_counter()

    if start_stacks is None:
        start_state = canonical_state([['A', 'B'], ['C']])
    else:
        start_state = canonical_state(start_stacks)

    if goal_stacks is None:
        goal_state = canonical_state([['C', 'B', 'A']])
    else:
        goal_state = canonical_state(goal_stacks)

    queue = deque([start_state])
    visited = {start_state}
    parent = {}
    action_log = {}
    history = []
    nodes_expanded = 0
    solved = False

    history.append({
        "step": 0,
        "state": parse_state(start_state),
        "action": "Initial State"
    })

    if is_goal_satisfied(start_state, goal_state):
        solved = True

    while queue and not solved:
        curr = queue.popleft()
        nodes_expanded += 1

        if is_goal_satisfied(curr, goal_state):
            solved = True
            goal_reached_state = curr
            break

        for nxt_state, action in get_possible_moves(curr):
            if nxt_state not in visited:
                visited.add(nxt_state)
                parent[nxt_state] = curr
                action_log[nxt_state] = action
                queue.append(nxt_state)

    end_time = time.perf_counter()
    time_taken_ms = round((end_time - start_time) * 1000, 3)

    if solved:
        # Reconstruct plan actions
        actions = []
        state_sequence = []
        curr = goal_reached_state if 'goal_reached_state' in locals() else start_state

        while curr in parent:
            state_sequence.append(curr)
            actions.append(action_log[curr])
            curr = parent[curr]

        state_sequence.append(start_state)
        state_sequence.reverse()
        actions.reverse()

        plan_history = []
        for idx, (st, act) in enumerate(zip(state_sequence, ["Start"] + actions)):
            plan_history.append({
                "step": idx,
                "state": parse_state(st),
                "action": act
            })
        
        plan_length = len(actions)
    else:
        actions = []
        plan_history = history
        plan_length = 0

    return BenchmarkResult(
        problem="Blocks World",
        algorithm=algorithm,
        solved=solved,
        nodes_expanded=nodes_expanded,
        time_taken_ms=time_taken_ms,
        solution_quality=plan_length,
        path=actions,
        history=plan_history,
        details={"start_state": parse_state(start_state), "goal_state": parse_state(goal_state)}
    )
