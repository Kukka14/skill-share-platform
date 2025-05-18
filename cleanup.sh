#!/bin/bash

echo "Starting complete repository cleanup..."

# Clean backend
cd backend
./cleanup.sh
cd ..

# Clean frontend
cd frontend
./cleanup.sh
cd ..

# Remove any environment files that shouldn't be in the repo
find . -name ".env*" -type f -delete

# Remove temporary files
find . -name "*.bak" -type f -delete
find . -name "*.tmp" -type f -delete
find . -name "*~" -type f -delete

# Make all scripts executable
chmod +x backend/cleanup.sh
chmod +x frontend/cleanup.sh
chmod +x cleanup.sh

echo "Repository cleanup complete!"
