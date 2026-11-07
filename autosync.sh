#!/bin/bash
echo "Monitoring $(pwd) for changes..."
echo "Auto-sync is running. Press [Ctrl + C] to stop."

while true; do
  if [[ -n $(git status --porcelain) ]]; then
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$TIMESTAMP] File change detected. Pushing to GitHub..."
    git add -A
    git commit -m "Auto-update: $TIMESTAMP"
    git push origin main
    echo "[$TIMESTAMP] Successfully updated GitHub repository."
  fi
  sleep 3
done
