#!/bin/bash
# Start the trade poll daemon in the background.
# Logs go to /tmp/cotp-poller.log
# Run from repo root or indexer dir.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG="$HOME/Library/Logs/cotp-poller.log"

# Kill any existing poller
pkill -f "poll_daemon.py" 2>/dev/null

echo "[start_poller] Starting poll daemon at $(date)" >> "$LOG"
nohup /opt/homebrew/bin/python3 "$SCRIPT_DIR/poll_daemon.py" >> "$LOG" 2>&1 &
echo "[start_poller] Started with PID $!" >> "$LOG"
echo "Poll daemon started (PID $!). Logs: $LOG"
