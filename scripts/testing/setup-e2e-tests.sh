#!/bin/bash
# AI Human E2E Testing System - Setup Verification Script (Linux/Mac)
# Run this before executing E2E tests to ensure all dependencies are ready

echo "🚀 AI Human E2E Testing System - Setup Verification"
echo "================================================================================"
echo ""

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# ============================================
# 1. Check Node.js Installation
# ============================================
echo -e "${YELLOW}📦 Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "   ${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "   ${RED}❌ Node.js not found${NC}"
    ERRORS=$((ERRORS+1))
fi

# ============================================
# 2. Check pnpm Installation
# ============================================
echo -e "${YELLOW}📦 Checking pnpm installation...${NC}"
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "   ${GREEN}✅ pnpm: $PNPM_VERSION${NC}"
else
    echo -e "   ${YELLOW}⚠️ pnpm not found (will use npm)${NC}"
    WARNINGS=$((WARNINGS+1))
fi

# ============================================
# 3. Install Dependencies
# ============================================
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"

if [ -f "pnpm-lock.yaml" ]; then
    echo -e "   ${CYAN}Using pnpm...${NC}"
    pnpm install --frozen-lockfile
elif [ -f "package-lock.json" ]; then
    echo -e "   ${CYAN}Using npm...${NC}"
    npm ci
else
    echo -e "   ${CYAN}Using npm...${NC}"
    npm install
fi

if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "   ${RED}❌ Failed to install dependencies${NC}"
    ERRORS=$((ERRORS+1))
fi

# ============================================
# 4. Check Playwright Installation
# ============================================
echo ""
echo -e "${YELLOW}🎭 Checking Playwright installation...${NC}"

if [ -d "node_modules/@playwright" ]; then
    echo -e "   ${GREEN}✅ Playwright package installed${NC}"
    
    # Check version from package.json
    if command -v jq &> /dev/null; then
        PLAYWRIGHT_VERSION=$(cat package.json | jq -r '.devDependencies["@playwright/test"]')
        echo -e "   ${CYAN}📌 Version: $PLAYWRIGHT_VERSION${NC}"
    fi
else
    echo -e "   ${RED}❌ Playwright not installed${NC}"
    ERRORS=$((ERRORS+1))
fi

# ============================================
# 5. Install Playwright Browsers
# ============================================
echo ""
echo -e "${YELLOW}🌐 Installing Playwright browsers...${NC}"
echo -e "   ${GRAY}This may take a few minutes...${NC}"

if [ -d "node_modules/@playwright" ]; then
    npx playwright install chromium
    
    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ Chromium browser installed${NC}"
    else
        echo -e "   ${RED}❌ Failed to install browsers${NC}"
        ERRORS=$((ERRORS+1))
    fi
    
    # Install system dependencies
    echo -e "   ${GRAY}Installing system dependencies...${NC}"
    npx playwright install-deps chromium 2>/dev/null
else
    echo -e "   ${YELLOW}⏭️ Skipped (Playwright not installed)${NC}"
fi

# ============================================
# 6. Check Appwrite Configuration
# ============================================
echo ""
echo -e "${YELLOW}🔧 Checking Appwrite configuration...${NC}"

if [ -f ".env" ]; then
    REQUIRED_VARS=("VITE_APPWRITE_ENDPOINT" "VITE_APPWRITE_PROJECT_ID" "VITE_APPWRITE_DATABASE_ID")
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "$var" .env; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        echo -e "   ${GREEN}✅ Appwrite environment variables configured${NC}"
    else
        echo -e "   ${YELLOW}⚠️ Missing variables: ${MISSING_VARS[*]}${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "   ${YELLOW}⚠️ .env file not found${NC}"
    WARNINGS=$((WARNINGS+1))
fi

# ============================================
# 7. Check E2E Test Configuration
# ============================================
echo ""
echo -e "${YELLOW}🧪 Checking E2E test configuration...${NC}"

if [ -f ".env" ]; then
    E2E_VARS=("BASE_URL" "THERAPIST_URL" "ADMIN_URL")
    MISSING_E2E=()
    
    for var in "${E2E_VARS[@]}"; do
        if ! grep -q "$var" .env; then
            MISSING_E2E+=("$var")
        fi
    done
    
    if [ ${#MISSING_E2E[@]} -eq 0 ]; then
        echo -e "   ${GREEN}✅ E2E test URLs configured${NC}"
    else
        echo -e "   ${YELLOW}⚠️ Missing variables: ${MISSING_E2E[*]}${NC}"
        echo -e "   ${CYAN}💡 Add to .env:${NC}"
        echo -e "      ${GRAY}BASE_URL=http://localhost:3000${NC}"
        echo -e "      ${GRAY}THERAPIST_URL=http://localhost:3005${NC}"
        echo -e "      ${GRAY}ADMIN_URL=http://localhost:3007${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
fi

# ============================================
# 8. Check Audio Files
# ============================================
echo ""
echo -e "${YELLOW}🔊 Checking notification audio files...${NC}"

AUDIO_FILES=(
    "public/sounds/booking-notification.mp3"
    "public/sounds/new-booking.mp3"
    "src/assets/sounds/booking-notification.mp3"
    "sounds/booking-notification.mp3"
)

AUDIO_FOUND=false
for audio_path in "${AUDIO_FILES[@]}"; do
    if [ -f "$audio_path" ]; then
        echo -e "   ${GREEN}✅ Audio file found: $audio_path${NC}"
        AUDIO_FOUND=true
        break
    fi
done

if [ "$AUDIO_FOUND" = false ]; then
    echo -e "   ${YELLOW}⚠️ Audio notification file not found${NC}"
    echo -e "   ${CYAN}💡 Create audio file at:${NC}"
    echo -e "      ${GRAY}public/sounds/booking-notification.mp3${NC}"
    WARNINGS=$((WARNINGS+1))
fi

# ============================================
# 9. Check Backend Server
# ============================================
echo ""
echo -e "${YELLOW}🌐 Checking backend server...${NC}"

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 2 | grep -q "200\|301\|302"; then
    echo -e "   ${GREEN}✅ Backend server running at http://localhost:3000${NC}"
else
    echo -e "   ${YELLOW}⚠️ Backend server not running${NC}"
    echo -e "   ${CYAN}💡 Start server: pnpm dev${NC}"
    WARNINGS=$((WARNINGS+1))
fi

# ============================================
# 10. Check Test Files
# ============================================
echo ""
echo -e "${YELLOW}📝 Checking E2E test files...${NC}"

TEST_FILES=(
    "e2e-tests/flows/ai-human-multi-user-workflow.spec.ts"
    "e2e-tests/flows/booking-flow.spec.ts"
    "e2e-tests/verification/RevenueGuard.ts"
    "e2e-tests/services/notificationValidator.ts"
)

MISSING_TESTS=0
for test_file in "${TEST_FILES[@]}"; do
    if [ -f "$test_file" ]; then
        echo -e "   ${GREEN}✅ $test_file${NC}"
    else
        echo -e "   ${RED}❌ $test_file (missing)${NC}"
        MISSING_TESTS=$((MISSING_TESTS+1))
    fi
done

if [ $MISSING_TESTS -gt 0 ]; then
    ERRORS=$((ERRORS+1))
fi

# ============================================
# 11. Check Playwright Config
# ============================================
echo ""
echo -e "${YELLOW}⚙️ Checking Playwright configuration...${NC}"

if [ -f "playwright.config.ts" ]; then
    echo -e "   ${GREEN}✅ playwright.config.ts found${NC}"
else
    echo -e "   ${YELLOW}⚠️ playwright.config.ts not found${NC}"
    WARNINGS=$((WARNINGS+1))
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "================================================================================"
echo -e "${CYAN}📊 Setup Verification Summary${NC}"
echo "================================================================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - Ready to run E2E tests!${NC}"
    echo ""
    echo -e "${CYAN}🚀 Next steps:${NC}"
    echo -e "   ${GRAY}1. Start backend: pnpm dev${NC}"
    echo -e "   ${GRAY}2. Run tests: pnpm test:e2e${NC}"
    echo -e "   ${GRAY}3. View report: pnpm test:e2e:report${NC}"
    exit 0
else
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}❌ ERRORS FOUND: $ERRORS${NC}"
        echo ""
    fi
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️ WARNINGS: $WARNINGS${NC}"
        echo ""
    fi
    
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}❌ Setup INCOMPLETE - Fix errors before running tests${NC}"
        exit 1
    else
        echo -e "${YELLOW}⚠️ Setup COMPLETE with warnings - Tests may have limited functionality${NC}"
        exit 0
    fi
fi
