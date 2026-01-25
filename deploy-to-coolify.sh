#!/bin/bash
# Petfendy - Coolify Deployment Script

set -e

echo "🚀 Petfendy Deployment Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
COOLIFY_HOST="46.224.248.228"
COOLIFY_PORT="8000"
PROJECT_NAME="petfendy"

echo -e "${BLUE}📦 Step 1: Checking prerequisites...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

echo -e "${BLUE}📝 Step 2: Committing changes...${NC}"

# Add all changes
git add .

# Commit if there are changes
if git diff --staged --quiet; then
    echo "No changes to commit"
else
    git commit -m "Deploy to Coolify - $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${GREEN}✅ Changes committed${NC}"
fi

echo ""
echo -e "${BLUE}📤 Step 3: Pushing to repository...${NC}"

# Push to remote
git push origin main || git push origin master

echo -e "${GREEN}✅ Pushed to repository${NC}"
echo ""

echo -e "${BLUE}🔧 Step 4: Coolify Configuration${NC}"
echo ""
echo "Now you need to configure Coolify manually:"
echo ""
echo "1. Go to: http://${COOLIFY_HOST}:${COOLIFY_PORT}"
echo "2. Login with your credentials"
echo "3. Create PostgreSQL database:"
echo "   - Name: petfendy-db"
echo "   - Database: petfendy"
echo "   - Username: petfendy_user"
echo "   - Password: PetF3ndy2024!Secure#DB"
echo ""
echo "4. Create Application:"
echo "   - Repository: $(git remote get-url origin)"
echo "   - Branch: $(git branch --show-current)"
echo "   - Port: 3000"
echo ""
echo "5. Add Environment Variables (see COOLIFY-QUICK-START.md)"
echo ""
echo "6. Click Deploy!"
echo ""
echo -e "${GREEN}✅ Deployment script completed${NC}"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - COOLIFY-QUICK-START.md"
echo "   - COOLIFY-STEP-BY-STEP.md"
