#!/bin/bash
# Validate I prefix convention for interfaces
echo "🔍 Checking interface naming (I prefix)..."
errors=0

# Find all interfaces and check for I prefix
grep -r "^interface " src --include="*.ts" | grep -v "^interface I" | while read -r line; do
  echo "❌ Interface missing I prefix: $line"
  ((errors++))
done

# Check for type aliases incorrectly using I prefix
grep -r "^type I" src --include="*.ts" | while read -r line; do
  echo "❌ Type alias should not use I prefix (use T prefix): $line"
  ((errors++))
done

if [ $errors -eq 0 ]; then
  echo "✅ Interface naming check passed!"
else
  echo "❌ Found interface naming issues"
fi
