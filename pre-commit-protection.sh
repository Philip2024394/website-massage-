#!/bin/bash

# 🔒 BOOKING SYSTEM PROTECTION WRAPPER
# Automatically runs protection checks before and after git operations

echo "🛡️ BOOKING SYSTEM PROTECTION ACTIVE"
echo "👥 Protecting 120+ active users"
echo "💰 Safeguarding revenue-critical booking system"
echo ""

# Pre-commit protection check
echo "🔍 Running pre-commit protection check..."
node protection-monitor.js

# Check if any protected files are being committed
PROTECTED_FILES=(
    "src/context/PersistentChatProvider.tsx"
    "src/components/PersistentChatWindow.tsx" 
    "src/services/EnterpriseWebSocketService.ts"
    "src/lib/services/bookingCreation.service.ts"
    "src/lib/services/bookingChatIntegration.service.ts"
)

# Get list of files being committed
STAGED_FILES=$(git diff --cached --name-only)

# Check for protected files in commit
PROTECTED_CHANGES=""
for file in $STAGED_FILES; do
    for protected in "${PROTECTED_FILES[@]}"; do
        if [[ "$file" == *"$(basename $protected)"* ]]; then
            PROTECTED_CHANGES="$PROTECTED_CHANGES\n  - $file"
        fi
    done
done

if [ -n "$PROTECTED_CHANGES" ]; then
    echo ""
    echo "🚨 CRITICAL WARNING: Attempting to commit protected files!"
    echo "📁 Protected files detected:$PROTECTED_CHANGES"
    echo ""
    echo "🔐 PROTECTION PROTOCOL REQUIRED:"
    echo "   1. Obtain unlock code from system owner"
    echo "   2. Use format: 'UNLOCK [COMPONENT] WITH CODE: [code] FOR: [change]'"
    echo "   3. Get explicit approval for production impact"
    echo ""
    echo "💡 If this is authorized, add unlock command to commit message"
    echo "❌ Commit blocked to protect 120+ active users"
    echo ""
    
    # Don't actually block in this demo, just warn
    echo "⚠️  DEMO MODE: Commit proceeding with warning"
    echo "🔒 In production, this would block unauthorized commits"
else
    echo "✅ No protected files in commit - proceeding safely"
fi

echo ""
echo "🛡️ PROTECTION CHECK COMPLETE"