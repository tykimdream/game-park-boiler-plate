#!/bin/bash
# Post-tool hook: Warn if console.log detected in written files
# Severity: WARN (allows execution but warns)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | sed 's/"file_path":"//;s/"$//')

# Skip if not a source file
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Skip test files
if [[ "$FILE_PATH" =~ \.(spec|test)\.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Check for console.log
if [ -f "$FILE_PATH" ] && grep -q "console\.log" "$FILE_PATH"; then
  echo '{"severity":"warn","message":"console.log detected. Use console.warn or console.error instead."}'
  exit 0
fi

echo '{"severity":"info","message":"No console.log found"}'
exit 0
