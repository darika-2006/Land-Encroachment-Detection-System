# ...existing code...
$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "  TLIS - Thoothukudi Land Intelligence  "
Write-Host "========================================"
Write-Host ""

$ROOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/3] Starting FastAPI Backend (port 8000)..."
Start-Process pwsh -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location `"$ROOT_DIR/code/backend`"; if (Test-Path .venv) { . .venv/bin/Activate.ps1 }; python3 -m uvicorn nland:app --reload --port 8000"
)

Write-Host "[2/3] Starting WhatsApp Flask Bot (port 5000)..."
Start-Process pwsh -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location `"$ROOT_DIR/Whatsapp`"; if (Test-Path .venv) { . .venv/bin/Activate.ps1 }; python3 main.py"
)

Write-Host "[3/3] Starting React Frontend (port 3000)..."
Start-Process pwsh -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location `"$ROOT_DIR/code/frontend`"; npm run dev"
)

Write-Host ""
Write-Host "========================================"
Write-Host "  All servers launched!"
Write-Host ""
Write-Host "  FastAPI   -> http://127.0.0.1:8000"
Write-Host "  WhatsApp  -> http://127.0.0.1:5000"
Write-Host "  Frontend  -> http://localhost:3000"
Write-Host ""
Write-Host "  WhatsApp status check:"
Write-Host "  curl http://127.0.0.1:8000/whatsapp/status"
Write-Host "========================================"
# ...existing code...