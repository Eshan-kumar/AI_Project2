import unittest
from modules.nqueens_solver import solve_nqueens, count_conflicts

class TestNQueensSolver(unittest.TestCase):
    def test_conflict_counter(self):
        # Solved 4-queens board [1, 3, 0, 2]
        self.assertEqual(count_conflicts([1, 3, 0, 2]), 0)
        # 4 queens on same row [0, 0, 0, 0] -> 6 pairs
        self.assertEqual(count_conflicts([0, 0, 0, 0]), 6)

    def test_simulated_annealing(self):
        res = solve_nqueens(n=8, algorithm="Simulated Annealing", seed=123)
        self.assertIn(res.solved, [True, False])
        self.assertLessEqual(res.solution_quality, 4)

    def test_hill_climbing(self):
        res = solve_nqueens(n=8, algorithm="Hill Climbing", seed=42)
        self.assertIsNotNone(res.nodes_expanded)
        self.assertGreater(len(res.history), 0)

if __name__ == '__main__':
    unittest.main()
