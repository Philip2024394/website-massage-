#!/bin/bash
# 🔒 CI/CD Production Lock Check
# Prevents deployment if locked files are modified
# Use in GitHub Actions, Netlify, Vercel, etc.

set -e

echo "🔍 CI: Checking for production-locked file changes..."

# Define locked files (matching CODEOWNERS and validate-production-lock.ps1)
LOCKED_FILES=(
    "PRODUCTION_LOCK_LANDING_LOADING.md"
    "src/pages/MainLandingPage.tsx"
    "src/pages/LandingPage.tsx"
    "src/pages/LoadingGate.tsx"
    "src/pages/HomePage.tsx"
    "src/App.tsx"
    "src/AppRouter.tsx"
    "src/context/LoadingContext.tsx"
    "src/services/customerGPSCollectionService.ts"
    "src/services/simpleGPSBookingIntegration.ts"
)

# Get changed files compared to main branch
# Works with: GitHub Actions, GitLab CI, Netlify, Vercel
if [ -n "$GITHUB_BASE_REF" ]; then
    # GitHub Actions PR
    CHANGED_FILES=$(git diff --name-only origin/$GITHUB_BASE_REF...HEAD)
elif [ -n "$CI_MERGE_REQUEST_TARGET_BRANCH_NAME" ]; then
    # GitLab CI MR
    CHANGED_FILES=$(git diff --name-only origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME...HEAD)
elif [ -n "$CACHED_COMMIT_REF" ]; then
    # Netlify
    CHANGED_FILES=$(git diff --name-only $CACHED_COMMIT_REF...HEAD)
else
    # Default: compare with origin/main
    CHANGED_FILES=$(git diff --name-only origin/main...HEAD 2>/dev/null || git diff --name-only HEAD~1...HEAD)
fi

# Check for violations
VIOLATIONS=()
for file in "${LOCKED_FILES[@]}"; do
    if echo "$CHANGED_FILES" | grep -q "^$file$"; then
        VIOLATIONS+=("$file")
    fi
done

# Report results
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ CI FAILED: PRODUCTION-LOCKED FILES MODIFIED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "The following locked files have been modified:"
    for violation in "${VIOLATIONS[@]}"; do
        echo "  🔒 $violation"
    done
    echo ""
    echo "⚠️  These files are under PRODUCTION LOCK to prevent app outages."
    echo ""
    echo "Landing and loading pages were previously crashing."
    echo "Current behavior is stable and MUST NOT CHANGE."
    echo ""
    echo "📋 Required actions:"
    echo "  1. Review: PRODUCTION_LOCK_LANDING_LOADING.md"
    echo "  2. Get approval from @Philip2024394"
    echo "  3. Follow change control process"
    echo "  4. Revert changes or create new branch with approval"
    echo ""
    echo "🚫 Deployment blocked to protect production stability."
    echo ""
    exit 1
else
    echo "✅ CI: No production-locked files modified. Deployment allowed."
    exit 0
fi
