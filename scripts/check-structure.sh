#!/bin/bash
# Validate directory structure per Ignis patterns
echo "🔍 Checking directory structure per Ignis patterns..."
errors=0

# Check that each directory in src/components has an index.ts
if [ -d "src/components" ]; then
  for dir in src/components/*/; do
    if [ -d "$dir" ]; then
      if [ ! -f "${dir}index.ts" ]; then
        echo "❌ Missing index.ts in: $dir"
        ((errors++))
      fi
    fi
  done
else
  echo "⚠️  src/components/ does not exist yet"
fi

if [ $errors -eq 0 ]; then
  echo "✅ Directory structure check passed!"
else
  echo "❌ Found $errors directory structure issues"
  exit 1
fi
