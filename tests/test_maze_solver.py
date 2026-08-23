import unittest
from modules.maze_solver import solve_maze, DEFAULT_MAZE_10X10

class TestMazeSolver(unittest.TestCase):
    def test_bfs_solves_default_maze(self):
        res = solve_maze(DEFAULT_MAZE_10X10, algorithm="BFS")
        self.assertTrue(res.solved)
        self.assertGreater(res.nodes_expanded, 0)
        self.assertGreater(res.solution_quality, 0)
        self.assertEqual(res.path[0], (0, 0))
        self.assertEqual(res.path[-1], (9, 9))

    def test_dfs_solves_default_maze(self):
        res = solve_maze(DEFAULT_MAZE_10X10, algorithm="DFS")
        self.assertTrue(res.solved)
        self.assertGreater(res.nodes_expanded, 0)

    def test_astar_solves_default_maze(self):
        res = solve_maze(DEFAULT_MAZE_10X10, algorithm="A*")
        self.assertTrue(res.solved)
        self.assertEqual(res.path[0], (0, 0))
        self.assertEqual(res.path[-1], (9, 9))

    def test_blocked_start_unsolvable(self):
        blocked_grid = [[1, 0], [0, 0]]
        res = solve_maze(blocked_grid, start=(0,0), goal=(1,1), algorithm="A*")
        self.assertFalse(res.solved)

if __name__ == '__main__':
    unittest.main()
