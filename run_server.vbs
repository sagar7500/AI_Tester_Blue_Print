' Run the Local Test Case Generator server in the background (no window).
' Used by "Run at Windows startup" so you can open http://localhost:3000 anytime.
Option Explicit
Dim fso, shell, scriptDir, cmd, wsh
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = scriptDir
cmd = "cmd /c pip install -q -r backend\requirements.txt 2>nul && uvicorn backend.app:app --host 0.0.0.0 --port 3000"
' 0 = hidden window, True = wait (keeps server running)
shell.Run cmd, 0, True
