# Start Guardion backend + frontend (Windows)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Guardion backend on http://localhost:8000 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

Write-Host "Starting Guardion frontend on http://localhost:5173 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Guardion is starting."
Write-Host "  Dashboard: http://localhost:5173"
Write-Host "  Backend:   http://localhost:8000"
Write-Host "  API docs:  http://localhost:8000/docs"
