#!/bin/sh
set -e

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.yarn-state.yml" ]; then
  echo "📦 Installing dependencies..."
  yarn install --immutable
fi

# Execute the command
exec "$@"

