@echo off
setlocal
title Ollama Starter (with CORS)
echo.
echo ===========================================
echo   Ollama Starter: Setting OLLAMA_ORIGINS=*
echo ===========================================
echo.

:: Check if Ollama is already running
echo [1/3] Checking if Ollama is already active...
curl -s -f http://127.0.0.1:11434/ >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Ollama is already running. Restarting to apply CORS settings...
)

echo [2/3] Stopping existing Ollama processes...
taskkill /F /IM ollama.exe /T >nul 2>&1
taskkill /F /IM ollama_app.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

echo [3/3] Starting Ollama with CORS enabled...
echo (OLLAMA_ORIGINS=* helps avoid browser blocking)
echo.

set OLLAMA_ORIGINS=*

:: Try to run 'ollama serve'
ollama serve

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: Ollama failed to start (Exit Code: %ERRORLEVEL%).
    echo.
    echo Possible reasons:
    echo 1. Ollama is not installed or not in your PATH.
    echo 2. Another process is using port 11434.
    echo 3. Check Task Manager for zombie 'ollama.exe' processes.
    echo.
    pause
)

endlocal

