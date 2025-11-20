#!/bin/bash

# Make sure we're in the project root
if [ ! -d "app" ]; then
  echo "Error: 'app' folder not found in current directory."
  exit 1
fi

cd app || exit 1

# Create the 'school' folder if it doesn't exist
mkdir -p school

# Move everything except the 'school' folder itself into 'school/'
for f in *; do
  if [ "$f" != "school" ]; then
    mv "$f" school/
  fi
done

echo "✅ All files in app/ moved into app/school/ successfully."
