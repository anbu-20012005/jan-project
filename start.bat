@echo off
echo.
echo ================================================================
echo  MineSense AI -- SIH2026 Prototype Startup
echo  AI-Enabled Mine Subsidence Monitoring and Early Warning System
echo ================================================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found at project root.
    echo Please copy .env.example to .env and add your MISTRAL_API_KEY.
    echo.
    echo The backend will start in fallback mode without the API key.
    echo.
)

echo [1/3] Starting FastAPI backend...
echo       API will be available at: http://localhost:8000
echo       API docs:                 http://localhost:8000/docs
echo.
start "MineSense AI Backend" cmd /k "cd /d %~dp0backend && python main.py"

echo [2/3] Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak > nul

echo [3/3] Starting Vite frontend...
echo       Dashboard will open at: http://localhost:5173
echo.
start "MineSense AI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ================================================================
echo  MineSense AI is starting!
echo  Open your browser to: http://localhost:5173
echo ================================================================
echo.
echo Press any key to close this launcher...
pause > nul
