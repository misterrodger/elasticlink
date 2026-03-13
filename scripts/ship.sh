#!/bin/zsh

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
current_branch=$(git rev-parse --abbrev-ref HEAD)
if git ls-remote --exit-code --heads origin "$current_branch" > /dev/null 2>&1; then
    git push
else
    git push --set-upstream origin "$current_branch"
fi

echo "✅ Done!"