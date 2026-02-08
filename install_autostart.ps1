# Create shortcut in Startup folder so server runs at Windows login.
# Usage: powershell -ExecutionPolicy Bypass -File install_autostart.ps1
$ErrorActionPreference = "Stop"
$projectDir = (Get-Item $PSScriptRoot).FullName
$vbsPath = Join-Path $projectDir "run_server.vbs"
$startup = [Environment]::GetFolderPath("Startup")
$lnkPath = Join-Path $startup "Local Test Case Generator.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($lnkPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $projectDir
$shortcut.WindowStyle = 7
$shortcut.Save()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($shell) | Out-Null

Write-Output "Shortcut created: $lnkPath"
