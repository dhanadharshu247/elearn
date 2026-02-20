@echo off
setlocal
echo ==========================================
echo Starting EdWeb Project...
echo ==========================================

:: 0. Cleanup old processes (if any are running)
echo [CLEANUP] Stopping any existing servers on ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
echo [CLEANUP] Done.


:: 1. Check Dependencies
echo [CHECK] Checking for backend virtual environment...
if not exist "backend\.venv" (
    echo [SETUP] Backend virtual environment not found. Creating it now...
    pushd backend
    python -m venv .venv
    echo [SETUP] Installing backend requirements (this may take a minute)
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
    popd
)

echo [CHECK] Checking for frontend node_modules...
if not exist "frontend\node_modules" (
    echo [SETUP] frontend node_modules not found. Installing now...
    pushd frontend
    call npm install
    popd
)

:: 2. Check Backend Database
if not exist "backend\edweb.db" (
    echo [DATABASE] edweb.db not found. Seeding initial data...
    pushd backend
    call .venv\Scripts\activate.bat
    python seed.py
    popd
) else (
    echo [DATABASE] edweb.db found.
)

:: 3. Start Backend in a new window
echo [BACKEND] Starting FastAPI on http://127.0.0.1:8000...
start "EdWeb Backend" cmd /k "cd backend && .venv\Scripts\activate && python main.py"

:: 4. Start Frontend in a new window
echo [FRONTEND] Starting Vite on http://127.0.0.1:5173...
start "EdWeb Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo Both servers are starting!
echo Access the app at: http://127.0.0.1:5173
echo ==========================================
echo Close the new windows to stop the servers.
pause

