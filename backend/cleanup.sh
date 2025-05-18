#!/bin/bash

echo "Cleaning Spring Boot project..."

# Maven clean to remove target directory
./mvnw clean

# Remove logs
rm -rf logs/

# Remove unnecessary IDE files
rm -rf .idea/
rm -rf *.iml

# Remove any temp or backup files
find . -name "*.bak" -type f -delete
find . -name "*.tmp" -type f -delete
find . -name "*~" -type f -delete

echo "Backend cleanup complete!"
