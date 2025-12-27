#!/bin/bash
# Validate [ClassName][methodName] logging format
echo "🔍 Checking logging format [ClassName][methodName]..."

grep -rn "logger\." src --include="*.ts" | grep -v "\[.*\]\[.*\]" | head -10 | while read -r line; do
  echo "⚠️  May not follow [ClassName][methodName] format: $line"
done

echo "✅ Logging format check complete!"
