@echo off
cd /d "%~dp0"
title Local Test Case Generator - http://localhost:3000

echo Installing dependencies if needed...
pip install -q -r backend\requirements.txt 2>nul

echo.
echo Starting server at http://localhost:3000
echo Open this URL in your browser. Closing this window will stop the server.
echo.
start "" "http://localhost:3000"

uvicorn backend.app:app --host 0.0.0.0 --port 3000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: The server failed to start.
    echo Make sure Python is installed and port 3000 is not in use.
)
pause
