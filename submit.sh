#!/bin/sh

git add .
echo "what's the message?"
read COMMIT_MESSAGE

# Check if the commit message is empty
if [ -z "$COMMIT_MESSAGE" ]; then
  echo "Error: Commit message cannot be empty."
  exit 1
fi

# Add all changes
git add .

# Commit with the user's message
git commit -m "$COMMIT_MESSAGE"

# Push to the current branch
# git push origin HEAD
git push
