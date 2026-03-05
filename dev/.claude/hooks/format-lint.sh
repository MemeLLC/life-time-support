#!/bin/bash
# format-lint.sh – Claude Code post-write hook
# Runs Prettier and ESLint --fix on files after Claude edits them.
# Triggered by: Edit / Write tool calls (configured in .claude/settings.json)
set -euo pipefail

# DEBUG: Log hook invocation to verify it fires
echo "[$(date)] Hook fired" >> /tmp/format-lint-debug.log

# Read the JSON payload from stdin (contains tool_input.file_path, etc.)
INPUT=$(cat)
echo "[$(date)] INPUT=$INPUT" >> /tmp/format-lint-debug.log
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Bail out if no file path was provided
[[ -z "$FILE_PATH" ]] && exit 0

# Only process file types that Prettier / ESLint care about
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css|*.scss) ;;
  *) exit 0 ;;
esac

# Prettier – auto-format the written file
pnpm -C "$CLAUDE_PROJECT_DIR" exec prettier --write "$FILE_PATH"

# ESLint – auto-fix lint issues (JS/TS files only)
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    pnpm -C "$CLAUDE_PROJECT_DIR" exec eslint --fix "$FILE_PATH"
    ;;
esac
