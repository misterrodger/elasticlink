#!/bin/zsh

set -e

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" == "HEAD" ]]; then
    echo "Error: Detached HEAD state. Please checkout a branch first."
    exit 1
fi

echo "Running audit..."
npm run audit

echo "Check for unused dependencies"
npm run depcheck

echo "Check for duplicate code"
npm run jscpd

echo "Check dependency licenses"
npm run license-check

echo "Running formatter..."
npm run format

echo "Running linter..."
npm run lint

echo "Running type check..."
npm run type-check

echo "Build"
npm run build

echo "Running unit tests..."
npm run test:coverage

echo "Running integration tests..."
npm run test:integration

echo "Staging all changes..."
git add .

commit_message="$1"

if [ -z "$commit_message" ]; then
    echo "Enter commit message:"
    read -r commit_message
fi

if [ -z "$commit_message" ]; then
    echo "Error: Commit message cannot be empty"
    exit 1
fi

echo "Committing changes..."
git commit -m "$commit_message"

echo "Pushing to remote..."
if git ls-remote --exit-code --heads origin "$current_branch" > /dev/null 2>&1; then
    git push origin "$current_branch"
else
    git push --set-upstream origin "$current_branch"
fi

echo "✅ Done!"