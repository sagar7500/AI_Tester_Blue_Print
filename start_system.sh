#!/usr/bin/env bash
# Single server: API + frontend on http://localhost:3000. Run from project root.
set -e
cd "$(dirname "$0")"

echo "Installing dependencies if needed..."
pip install -q -r backend/requirements.txt

echo ""
echo "Server: http://localhost:3000"
echo "Close this terminal to stop the server."
echo ""

uvicorn backend.app:app --host 0.0.0.0 --port 3000
