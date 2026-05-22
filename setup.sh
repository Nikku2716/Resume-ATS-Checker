#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "=== Resume ATS Checker Setup ==="

echo ""
echo "1. Setting up backend..."
cd "$SCRIPT_DIR/backend"

if ! command -v uv &>/dev/null; then
  echo "   Installing uv..."
  pip install uv --quiet
fi

if [ ! -d ".venv" ]; then
  uv venv
fi
uv pip install --quiet -r requirements.txt
echo "   Backend dependencies installed."

echo ""
echo "2. Setting up frontend..."
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  npm install --silent
fi
echo "   Frontend dependencies installed."

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Start the backend:"
echo "  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo ""
echo "Start the frontend (in another terminal):"
echo "  cd frontend && npm run dev"
echo ""
echo "Open http://localhost:5173 in your browser."
echo ""
echo "Run tests:"
echo "  cd backend && source .venv/bin/activate && python -m pytest tests/ -v"
