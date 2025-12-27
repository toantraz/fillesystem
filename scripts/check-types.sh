#!/bin/bash
# Validate T prefix convention for type aliases
echo "🔍 Checking type alias naming (T prefix)..."
errors=0

# Find all type aliases and check for T prefix (excluding interfaces)
grep -r "^type " src --include="*.ts" | grep -v "^type T" | grep -v "^type I" | while read -r line; do
  echo "⚠️  Type alias missing T prefix: $line"
done

echo "✅ Type alias naming check complete!"
