#!/bin/bash
# Run all validation scripts in sequence
set -e

echo "🔍 Running all validation scripts..."
echo ""

echo "1️⃣ Type checking..."
npm run type-check
echo ""

echo "2️⃣ ESLint checking..."
npm run lint
echo ""

echo "3️⃣ Prettier checking..."
npm run prettier
echo ""

echo "4️⃣ Directory structure..."
npm run validate:structure
echo ""

echo "5️⃣ File naming..."
npm run validate:naming
echo ""

echo "6️⃣ Interface naming..."
npm run validate:interfaces
echo ""

echo "7️⃣ Type alias naming..."
npm run validate:types
echo ""

echo "8️⃣ Constants pattern..."
npm run validate:constants
echo ""

echo "✅ All validation checks passed!"
