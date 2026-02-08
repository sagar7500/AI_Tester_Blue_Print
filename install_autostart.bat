@echo off
cd /d "%~dp0"

echo Adding "Local Test Case Generator" to Windows Startup...
echo So the server will start when you log in and http://localhost:3000 will always work.
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0install_autostart.ps1"

if %errorlevel% equ 0 (
  echo Done. The server will start automatically when you log in.
  echo.
  echo Starting the server now so you can use http://localhost:3000 right away...
  start "" wscript.exe "%~dp0run_server.vbs"
  timeout /t 2 /nobreak >nul
  echo You can open http://localhost:3000 in your browser now.
  echo To remove auto-start later, run: uninstall_autostart.bat
) else (
  echo Failed to create shortcut. Check that the path does not contain special characters.
)
echo.
pause
