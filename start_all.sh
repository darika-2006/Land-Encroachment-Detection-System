#!/bin/bash

echo "========================================"
echo "  TLIS - Thoothukudi Land Intelligence  "
echo "========================================"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[1/4] Starting FastAPI Backend (port 8000)..."
gnome-terminal -- bash -c "cd '$ROOT_DIR/code/backend'; \
  [ -d .venv ] && source .venv/bin/activate; \
  python3 -m uvicorn nland:app --reload --port 8000; exec bash"

echo "[2/4] Starting WhatsApp Flask Bot (port 5000)..."
gnome-terminal -- bash -c "cd '$ROOT_DIR/Whatsapp'; \
  [ -d .venv ] && source .venv/bin/activate; \
  python3 main.py; exec bash"

echo "[3/4] Starting React Frontend (port 3000)..."
gnome-terminal -- bash -c "cd '$ROOT_DIR/code/frontend'; \
  npm run dev; exec bash"

echo "[4/4] Starting Ngrok tunnel (port 5000)..."
gnome-terminal -- bash -c "ngrok http 5000; exec bash"

echo ""
echo "========================================"
echo "  All servers launched!"
echo ""
echo "  FastAPI   -> http://127.0.0.1:8000"
echo "  WhatsApp  -> http://127.0.0.1:5000"
echo "  Frontend  -> http://localhost:3000"
echo "  Ngrok UI  -> http://127.0.0.1:4040"
echo ""
echo "  1. Open http://127.0.0.1:4040"
echo "  2. Copy the https:// ngrok URL"
echo "  3. Paste in Twilio Sandbox Webhook"
echo "========================================"