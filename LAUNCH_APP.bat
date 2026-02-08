@echo off
title A.I. Tester Launcher

echo ==================================================
echo       🚀 Starting Local Tester AI (Hosted)
echo ==================================================
echo.

echo [1/5] 🛑 Stopping existing Ollama processes...
taskkill /F /IM ollama_app.exe >nul 2>&1
taskkill /F /IM ollama.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/5] 🌍 Setting CORS Environment Variables...
set OLLAMA_ORIGINS=*
set OLLAMA_HOST=0.0.0.0:11434

echo [3/5] 🧠 Starting Ollama Server...
start "Ollama Server" /MIN ollama serve

echo [4/5] ⏳ Waiting for Ollama (5s)...
timeout /t 5 /nobreak >nul

echo [5/5] 🌐 Starting Web Server...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐍 Using Python Server...
    start python server.py
) else (
    echo ⚠️  Python not found. Using PowerShell fallback.
    echo ⚠️  DO NOT CLOSE THIS WINDOW. IT HOSTS YOUR APP. ⚠️
    start http://localhost:8080
    powershell -ExecutionPolicy Bypass -File server.ps1 -Port 8080
)
