#!/bin/bash

echo "Cleaning React project..."

# Remove node_modules
rm -rf node_modules/

# Remove build artifacts
rm -rf build/
rm -rf dist/

# Remove lock files (optional - do this if you want to completely regenerate dependencies)
# rm -f package-lock.json
# rm -f yarn.lock

# Remove temporary and cache files
rm -rf .cache/
rm -rf .parcel-cache/
rm -rf coverage/

# Reinstall dependencies (optional)
# npm install

echo "Frontend cleanup complete!"
