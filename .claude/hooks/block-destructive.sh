#!/bin/bash
# Pre-tool hook: Block destructive bash commands
# Severity: BLOCK (prevents execution)

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | sed 's/"command":"//;s/"$//')

BLOCKED_PATTERNS=(
  "rm -rf /"
  "rm -rf /*"
  "mkfs"
  ":(){ :|:& };:"
  "chmod 777"
  "npm publish"
  "git push --force"
  "git reset --hard"
  "git clean -f"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -q "$pattern"; then
    echo '{"severity":"block","message":"Blocked destructive command: '"$pattern"'"}'
    exit 2
  fi
done

echo '{"severity":"info","message":"Command allowed"}'
exit 0
