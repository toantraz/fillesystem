#!/bin/bash
# Generate list of files with suppressed violations for tracking

echo "📊 Tracking suppressed ESLint violations..."
echo ""

# Find all eslint-disable-next-line comments
grep -rn "eslint-disable-next-line" src --include="*.ts" | while read -r line; do
  echo "$line"
done > violations-suppressed.txt

# Find all prettier-ignore comments
grep -rn "prettier-ignore" src --include="*.ts" | while read -r line; do
  echo "$line"
done >> violations-suppressed.txt

if [ -s violations-suppressed.txt ]; then
  echo "✅ Found suppressed violations (see violations-suppressed.txt)"
  echo "   Total suppressed: $(wc -l < violations-suppressed.txt)"
else
  echo "✅ No suppressed violations found!"
fi
