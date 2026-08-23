import unittest
from modules.blocks_planner import plan_blocks

class TestBlocksPlanner(unittest.TestCase):
    def test_default_blocks_plan(self):
        # Start: [['A', 'B'], ['C']] -> Goal: [['C', 'B', 'A']]
        res = plan_blocks()
        self.assertTrue(res.solved)
        self.assertGreater(res.solution_quality, 0)
        self.assertGreater(len(res.path), 0)

    def test_already_at_goal(self):
        start = [['A', 'B']]
        goal = [['A', 'B']]
        res = plan_blocks(start_stacks=start, goal_stacks=goal)
        self.assertTrue(res.solved)
        self.assertEqual(res.solution_quality, 0)

if __name__ == '__main__':
    unittest.main()
