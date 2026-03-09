#!/bin/bash

set -e

echo "Running audit..."
npm run audit

echo "Running linter..."
npm run lint

echo "Running type check..."
npm run type-check

echo "Running formatter..."
npm run format

echo "Running unit tests..."
npm run test:coverage

echo "Running integration tests..."
npm run test:integration

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