@echo off
echo Starting AI Search & Planning Playground...
echo.

echo Starting Python API Backend Server on http://localhost:8000...
start /b "" python main.py 8000

timeout /t 2 >nul

echo Starting React (JSX) Frontend Dev Server on http://localhost:5173...
cd frontend
npm run dev
