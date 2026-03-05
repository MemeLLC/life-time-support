#!/bin/bash
set -euo pipefail

INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active')

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if ! git diff --name-only | grep -E '\.(ts|tsx|js|jsx)$' >/dev/null 2>&1; then
  exit 0
fi

if pnpm -C "$CLAUDE_PROJECT_DIR" typecheck; then
  exit 0
else
  echo "Typecheck failed. Fix TypeScript errors, then try again." >&2
  exit 2
fi
