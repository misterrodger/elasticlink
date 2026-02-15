#!/bin/bash

set -e

echo "Running audit..."
npm run audit

echo "Running linter..."
npm run lint

echo "Running formatter..."
npm run format

echo "Running tests..."
npm run test:coverage

echo "Staging all changes..."
git add .

echo "Enter commit message:"
read -r commit_message

if [ -z "$commit_message" ]; then
    echo "Error: Commit message cannot be empty"
    exit 1
fi

echo "Committing changes..."
git commit -m "$commit_message"

echo "Pushing to remote..."
git push

echo "✅ Done!"