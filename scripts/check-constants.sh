#!/bin/bash
# Validate static class pattern (no enums)
echo "🔍 Checking for enum usage (should use static class pattern)..."
errors=0

# Find all enum declarations
grep -r "^enum " src --include="*.ts" | while read -r line; do
  echo "❌ Found enum (use static class instead): $line"
  ((errors++))
done

if [ $errors -eq 0 ]; then
  echo "✅ No enums found - static class pattern check passed!"
else
  echo "❌ Found $errors enum(s) that should be converted to static class"
fi
