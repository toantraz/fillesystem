#!/bin/bash
# Fix and validate a single file
# Usage: scripts/fix-file.sh path/to/file.ts

FILE="$1"

if [ -z "$FILE" ]; then
  echo "Usage: scripts/fix-file.sh path/to/file.ts"
  exit 1
fi

echo "🔧 Fixing and validating: $FILE"

# Run prettier on the file
npx prettier --write "$FILE"

# Run eslint fix on the file
npx eslint --fix "$FILE"

# Type check
npx tsc --noEmit "$FILE" 2>/dev/null || echo "⚠️  Type errors detected"

echo "✅ File processed: $FILE"
