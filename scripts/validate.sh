#!/bin/bash
# Validation script that runs type-check, lint, and prettier checks
set -e

echo "🔍 Running validation..."
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

echo "✅ All validation checks passed!"
