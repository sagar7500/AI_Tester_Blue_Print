@echo off
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "LNK=%STARTUP%\Local Test Case Generator.lnk"

if exist "%LNK%" (
  del "%LNK%"
  echo Auto-start removed. The server will no longer start at login.
  echo You can still run start.bat when you want to use the app.
) else (
  echo Auto-start was not installed.
)
echo.
pause
