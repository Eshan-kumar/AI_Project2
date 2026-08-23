import unittest
from modules.puzzle_solver import solve_puzzle, is_solvable, GOAL_STATE

class TestPuzzleSolver(unittest.TestCase):
    def test_solvability_checker(self):
        solvable_state = (1, 2, 3, 4, 0, 5, 7, 8, 6)
        unsolvable_state = (1, 2, 3, 4, 5, 6, 8, 7, 0)
        self.assertTrue(is_solvable(solvable_state))
        self.assertFalse(is_solvable(unsolvable_state))

    def test_astar_manhattan(self):
        state = (1, 2, 3, 4, 0, 5, 7, 8, 6)
        res = solve_puzzle(state, algorithm="A* (Manhattan)")
        self.assertTrue(res.solved)
        self.assertEqual(res.path[-1], GOAL_STATE)

    def test_heuristics_node_comparison(self):
        state = (1, 2, 3, 4, 0, 5, 7, 8, 6)
        res_misplaced = solve_puzzle(state, algorithm="A* (Misplaced)")
        res_manhattan = solve_puzzle(state, algorithm="A* (Manhattan)")
        self.assertTrue(res_misplaced.solved)
        self.assertTrue(res_manhattan.solved)
        # Manhattan heuristic should expand <= misplaced heuristic nodes
        self.assertLessEqual(res_manhattan.nodes_expanded, res_misplaced.nodes_expanded)

    def test_unsolvable_returns_false(self):
        unsolvable_state = (1, 2, 3, 4, 5, 6, 8, 7, 0)
        res = solve_puzzle(unsolvable_state, algorithm="A* (Manhattan)")
        self.assertFalse(res.solved)

if __name__ == '__main__':
    unittest.main()
