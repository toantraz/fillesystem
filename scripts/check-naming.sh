#!/bin/bash
# Validate file naming conventions (kebab-case with type suffix)
echo "🔍 Checking file naming conventions..."
errors=0

# Check TypeScript files in src/
find src -name "*.ts" -type f | while read -r file; do
  basename=$(basename "$file")
  # Skip declaration files and index files
  if [[ "$basename" == *.d.ts ]] || [[ "$basename" == "index.ts" ]]; then
    continue
  fi
  # Check if file uses kebab-case
  if [[ ! "$basename" =~ ^[a-z][a-z0-9\-]*\.(component|controller|service|repository|adapter|helper|ts)$ ]]; then
    echo "⚠️  File may not follow kebab-case with type suffix: $file"
  fi
done

echo "✅ File naming check complete!"
