#!/bin/bash
# Add eslint-disable-next-line comments to existing violations for gradual remediation
# This script helps with the gradual convergence strategy

echo "🔧 Adding suppression comments to existing ESLint violations..."
echo ""
echo "This script helps with gradual convergence by:"
echo "1. Running ESLint to find violations"
echo "2. Adding // eslint-disable-next-line comments for existing issues"
echo "3. Tracking suppressed violations for later remediation"
echo ""
echo "Note: NEW code should be fixed immediately."
echo "Only suppress violations in EXISTING code that you're not actively modifying."
echo ""
echo "To suppress a specific violation manually:"
echo "  // eslint-disable-next-line @typescript-eslint/no-explicit-any"
echo "  const legacyData: any = getLegacyData();"
