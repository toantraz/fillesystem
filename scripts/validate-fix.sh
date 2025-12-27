#!/bin/bash
# Validation fix script that runs prettier:fix and lint:fix
set -e

echo "🔧 Running validation and auto-fix..."
echo ""

echo "1️⃣ Prettier formatting..."
npm run prettier:fix
echo ""

echo "2️⃣ ESLint fixing..."
npm run lint:fix
echo ""

echo "3️⃣ Type checking..."
npm run type-check
echo ""

echo "✅ Validation fix complete!"
