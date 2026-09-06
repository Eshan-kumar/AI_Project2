import sys
import os

# Add the project root to sys.path so we can import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import APIHandler

class handler(APIHandler):
    pass
