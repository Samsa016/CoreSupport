#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/src/backend"
FRONTEND_DIR="$ROOT_DIR/src/frontend"
LOG_DIR="$ROOT_DIR/.dev-logs"

mkdir -p "$LOG_DIR"

kill_by_port() {
  local port="$1"

  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" >/dev/null 2>&1 || true
    return
  fi

  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti tcp:"$port" || true)"
    if [[ -n "${pids:-}" ]]; then
      kill $pids >/dev/null 2>&1 || true
    fi
  fi
}

echo "Stopping old dev servers..."
pkill -f "uvicorn main:app --reload" >/dev/null 2>&1 || true
pkill -f "next dev" >/dev/null 2>&1 || true
kill_by_port 8000
kill_by_port 3000

echo "Starting backend on :8000..."
if [[ -x "$BACKEND_DIR/.venv/bin/uvicorn" ]]; then
  nohup bash -lc "cd \"$BACKEND_DIR\" && .venv/bin/uvicorn main:app --reload" \
    > "$LOG_DIR/backend.log" 2>&1 &
else
  echo "Backend venv not found at $BACKEND_DIR/.venv"
  echo "Create it first: cd src/backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

echo "Starting frontend on :3000..."
nohup bash -lc "cd \"$FRONTEND_DIR\" && npm run dev" \
  > "$LOG_DIR/frontend.log" 2>&1 &

sleep 2

echo "Done."
echo "Backend log:  $LOG_DIR/backend.log"
echo "Frontend log: $LOG_DIR/frontend.log"
echo "Check status: ss -ltnp | awk '\$4 ~ /:(3000|8000)\$/'"
