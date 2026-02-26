#!/usr/bin/env bash
set -euo pipefail

commit_message="${1:-}"

if [ -z "$commit_message" ]; then
  commit_message="chore: release $(date +%Y-%m-%d)"
  echo "No commit message provided. Using: \"$commit_message\""
fi

npm run test
npm run build

git add -A

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "$commit_message"
git push
