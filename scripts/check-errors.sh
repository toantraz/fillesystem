#!/bin/bash
# Validate getError usage with context
echo "🔍 Checking error handling format with getError..."

# Find throw statements that should use getError
grep -rn "throw new Error" src --include="*.ts" | head -5 | while read -r line; do
  echo "⚠️  Consider using getError: $line"
done

echo "✅ Error handling check complete!"
