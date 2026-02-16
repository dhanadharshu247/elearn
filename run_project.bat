@echo off
echo Starting EdWeb Project...

:: Start Backend in a new window
echo Starting Backend (FastAPI)...
start cmd /k "cd backend && python main.py"

:: Start Frontend in a new window
echo Starting Frontend (Vite)...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting. You can access the app at http://127.0.0.1:5173
pause
