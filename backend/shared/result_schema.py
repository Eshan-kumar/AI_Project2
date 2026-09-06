import time
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional

@dataclass
class BenchmarkResult:
    problem: str          # "Maze" | "8-Puzzle" | "N-Queens" | "Blocks World"
    algorithm: str        # e.g., "A* (Manhattan)", "BFS", "Simulated Annealing"
    solved: bool
    nodes_expanded: int
    time_taken_ms: float
    solution_quality: float  # path length / moves / plan length / final conflicts
    path: List[Any] = field(default_factory=list)
    history: List[Any] = field(default_factory=list)
    details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
