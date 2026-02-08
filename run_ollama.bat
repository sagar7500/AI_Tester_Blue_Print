@echo off
echo Stopping Ollama...
taskkill /F /IM ollama.exe /T >nul 2>&1
taskkill /F /IM ollama_app.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

echo Setting CORS Environment Variable...
set OLLAMA_ORIGINS=*

echo Starting Ollama with CORS enabled...
ollama serve
