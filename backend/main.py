import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modules.maze_solver import solve_maze, DEFAULT_MAZE_10X10
from modules.puzzle_solver import solve_puzzle
from modules.nqueens_solver import solve_nqueens
from modules.blocks_planner import plan_blocks

class APIHandler(BaseHTTPRequestHandler):
    def _send_response(self, data: dict, status_code: int = 200):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _get_actual_path(self):
        parsed_url = urlparse(self.path)
        # Vercel preserves the original path in these headers during a rewrite
        invoke_path = self.headers.get('x-invoke-path') or self.headers.get('x-now-route-matches')
        if invoke_path:
            return invoke_path
        return parsed_url.path

    def do_GET(self):
        actual_path = self._get_actual_path()
        if actual_path == '/api/presets':
            presets = {
                "maze": {
                    "default_10x10": DEFAULT_MAZE_10X10,
                    "algorithms": ["BFS", "DFS", "A* (Manhattan)"]
                },
                "puzzle": {
                    "solvable_easy": [1, 2, 3, 4, 0, 5, 7, 8, 6],
                    "solvable_medium": [2, 8, 3, 1, 6, 4, 7, 0, 5],
                    "solvable_hard": [8, 6, 7, 2, 5, 4, 3, 0, 1],
                    "unsolvable": [1, 2, 3, 4, 5, 6, 8, 7, 0],
                    "algorithms": ["UCS", "Greedy", "A* (Misplaced)", "A* (Manhattan)"]
                },
                "nqueens": {
                    "n": 8,
                    "algorithms": ["Hill Climbing", "Simulated Annealing", "Genetic Algorithm"]
                },
                "blocks": {
                    "start": [["A", "B"], ["C"]],
                    "goal": [["C", "B", "A"]],
                    "algorithms": ["State-Space Planner (BFS)"]
                }
            }
            self._send_response(presets)
        else:
            self._send_response({"error": f"Endpoint not found. actual_path: {actual_path}, self.path: {self.path}"}, 404)

    def do_POST(self):
        actual_path = self._get_actual_path()
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'

        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception:
            body = {}

        if actual_path == '/api/solve/maze':
            grid = body.get('grid', DEFAULT_MAZE_10X10)
            start = tuple(body.get('start', [0, 0]))
            goal = tuple(body.get('goal', [9, 9]))
            algorithm = body.get('algorithm', 'A* (Manhattan)')
            res = solve_maze(grid, start, goal, algorithm)
            self._send_response(res.to_dict())

        elif actual_path == '/api/solve/puzzle':
            start_state = tuple(body.get('start_state', [1, 2, 3, 4, 0, 5, 7, 8, 6]))
            algorithm = body.get('algorithm', 'A* (Manhattan)')
            res = solve_puzzle(start_state, algorithm)
            self._send_response(res.to_dict())

        elif actual_path == '/api/solve/nqueens':
            n = body.get('n', 8)
            algorithm = body.get('algorithm', 'Simulated Annealing')
            initial_board = body.get('initial_board', None)
            seed = body.get('seed', None)
            res = solve_nqueens(n=n, algorithm=algorithm, initial_board=initial_board, seed=seed)
            self._send_response(res.to_dict())

        elif actual_path == '/api/solve/blocks':
            start_stacks = body.get('start_stacks', None)
            goal_stacks = body.get('goal_stacks', None)
            algorithm = body.get('algorithm', 'State-Space Planner (BFS)')
            res = plan_blocks(start_stacks, goal_stacks, algorithm)
            self._send_response(res.to_dict())

        elif actual_path == '/api/benchmark/all':
            # Runs all algorithm combinations on default problem configurations
            results = []

            # 1. Maze runs
            for algo in ["BFS", "DFS", "A* (Manhattan)"]:
                r = solve_maze(DEFAULT_MAZE_10X10, (0, 0), (9, 9), algo)
                results.append(r.to_dict())

            # 2. 8-Puzzle runs (Solvable Medium puzzle)
            puzzle_state = (1, 8, 2, 0, 4, 3, 7, 6, 5)
            for algo in ["UCS", "Greedy", "A* (Misplaced)", "A* (Manhattan)"]:
                r = solve_puzzle(puzzle_state, algo)
                results.append(r.to_dict())

            # 3. N-Queens runs
            for algo in ["Hill Climbing", "Simulated Annealing", "Genetic Algorithm"]:
                r = solve_nqueens(n=8, algorithm=algo, seed=100)
                results.append(r.to_dict())

            # 4. Blocks World run
            r = plan_blocks()
            results.append(r.to_dict())

            self._send_response({"results": results})

        else:
            self._send_response({"error": f"Unknown API route. actual_path: {actual_path}, self.path: {self.path}"}, 404)

def run_server(port: int = 8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, APIHandler)
    print(f"Python Search & Planning REST API running on http://localhost:{port}")
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
