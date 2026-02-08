
Write-Host "Stopping existing Ollama processes..."
Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "ollama_app" -Force -ErrorAction SilentlyContinue

Write-Host "Setting OLLAMA_ORIGINS to allow browser access..."
$env:OLLAMA_ORIGINS="*"

Write-Host "Starting Ollama..."
Start-Process -FilePath "ollama" -ArgumentList "serve" -NoNewWindow
