#!/bin/bash

# GitHub Project Board Setup Script
# This script creates and configures a GitHub Project for tracking API improvements

echo "📊 Setting up GitHub Project Board for API Best Practices"
echo "========================================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Please authenticate: gh auth login${NC}"
    exit 1
fi

# Check for project scope
echo -e "${BLUE}🔍 Checking authentication scopes...${NC}"
if ! gh auth status 2>&1 | grep -q "project"; then
    echo -e "${YELLOW}⚠️  Missing 'project' scope for GitHub CLI${NC}"
    echo ""
    echo "To create and manage GitHub Projects, you need to refresh your token with the 'project' scope:"
    echo ""
    echo -e "${GREEN}Run this command:${NC}"
    echo "  gh auth refresh -s project"
    echo ""
    read -p "Would you like to run this now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh auth refresh -s project
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to refresh token${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Please run 'gh auth refresh -s project' and try again${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ GitHub CLI ready${NC}"
echo ""

# Avoid pager issues
export PAGER=cat
export GH_PAGER=cat

# Get repository information
echo -e "${BLUE}🔍 Detecting repository...${NC}"
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>&1)
if [ $? -ne 0 ] || [ -z "$REPO" ]; then
    echo -e "${RED}❌ Failed to detect repository${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Repository: ${REPO}${NC}"
echo ""

# Create the project
echo ""
echo -e "${BLUE}📋 Creating Project Board...${NC}"

PROJECT_TITLE="API Best Practices Implementation"
PROJECT_DESCRIPTION="Tracking improvements for reservation booking platform API - Learning best practices through iterative development"

# Create project (this will return the project data)
echo "Attempting to create project '$PROJECT_TITLE'..."
PROJECT_DATA=$(gh project create \
  --owner "@me" \
  --title "$PROJECT_TITLE" \
  --format json 2>&1)

CREATE_STATUS=$?

if [ $CREATE_STATUS -eq 0 ]; then
    # Successfully created
    PROJECT_URL=$(echo "$PROJECT_DATA" | jq -r .url 2>/dev/null)
    PROJECT_NUMBER=$(echo "$PROJECT_DATA" | jq -r .number 2>/dev/null)
    echo -e "${GREEN}✅ Project created: ${PROJECT_URL}${NC}"
else
    # Creation failed - check if it already exists
    echo -e "${YELLOW}⚠️  Could not create project (may already exist). Searching...${NC}"
    
    PROJECT_DATA=$(gh project list --owner "@me" --format json --limit 100 2>&1)
    if [ $? -eq 0 ]; then
        # Search for existing project with matching title
        PROJECT_URL=$(echo "$PROJECT_DATA" | jq -r ".projects[] | select(.title==\"$PROJECT_TITLE\") | .url" 2>/dev/null | head -1)
        PROJECT_NUMBER=$(echo "$PROJECT_DATA" | jq -r ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" 2>/dev/null | head -1)
        
        if [ -n "$PROJECT_URL" ] && [ "$PROJECT_URL" != "null" ]; then
            echo -e "${GREEN}✅ Found existing project: ${PROJECT_URL}${NC}"
        else
            echo -e "${RED}❌ Project '${PROJECT_TITLE}' not found${NC}"
            echo ""
            echo "Available projects:"
            gh project list --owner "@me" --limit 10
            echo ""
            echo "You can either:"
            echo "1. Delete or rename an existing project"
            echo "2. Manually create a project and link issues"
            exit 1
        fi
    else
        echo -e "${RED}❌ Failed to list projects: $PROJECT_DATA${NC}"
        exit 1
    fi
fi

if [ -z "$PROJECT_NUMBER" ] || [ "$PROJECT_NUMBER" = "null" ]; then
    echo -e "${RED}❌ Could not determine project number${NC}"
    exit 1
fi

echo -e "${BLUE}Project Number: ${PROJECT_NUMBER}${NC}"

echo ""
echo -e "${BLUE}🏗️  Configuring Project Fields...${NC}"

# Note: GitHub Projects v2 API for field creation is complex
# We'll provide instructions for manual setup
cat << EOF

${YELLOW}📝 Manual Configuration Required:${NC}

Please complete the following steps in your browser:

1. Open your project: ${BLUE}${PROJECT_URL}${NC}

2. Add these custom fields:
   ${GREEN}➕ Priority Field (Single Select):${NC}
      • 🔴 Critical
      • 🟡 High
      • 🟠 Medium
      • 🔵 Low

   ${GREEN}➕ Effort Field (Number):${NC}
      • 1-5 scale for effort estimation

   ${GREEN}➕ Phase Field (Single Select):${NC}
      • Phase 1: Security & Performance
      • Phase 2: API Standards
      • Phase 3: Authentication
      • Phase 4: Optimization
      • Phase 5: Testing

   ${GREEN}➕ Component Field (Single Select):${NC}
      • Users Service
      • Properties Service
      • Profiles Service
      • Reviews Service
      • Database
      • Documentation
      • Infrastructure

3. Configure Views:
   ${GREEN}📊 Board View (Default):${NC}
      Columns: 📋 Backlog → 🚀 In Progress → 👀 Review → ✅ Done

   ${GREEN}📊 Table View:${NC}
      Group by: Phase
      Sort by: Priority (High to Low)

   ${GREEN}📊 Roadmap View:${NC}
      Date field: Milestone due date
      Group by: Phase

4. Set up Automation (Settings → Workflows):
   ${GREEN}🤖 Auto-move to "In Progress":${NC}
      When: Issue assigned
      Then: Set Status to "In Progress"

   ${GREEN}🤖 Auto-move to "Review":${NC}
      When: Pull request opened
      Then: Set Status to "Review"

   ${GREEN}🤖 Auto-move to "Done":${NC}
      When: Issue closed
      Then: Set Status to "Done"

EOF

echo ""
echo -e "${BLUE}🔗 Linking Issues to Project...${NC}"

# Add all issues to the project
echo "Finding open issues to add to project board..."

# Get all open issues from the current repo
ISSUES=$(gh issue list --repo "$REPO" --state open --json number --jq '.[].number' 2>/dev/null)

if [ -z "$ISSUES" ]; then
    echo -e "${YELLOW}⚠️  No open issues found. Run ./create-issues.sh first.${NC}"
else
    ADDED_COUNT=0
    FAILED_COUNT=0
    
    for issue_num in $ISSUES; do
        echo -n "Adding issue #$issue_num... "
        if gh project item-add "$PROJECT_NUMBER" --owner "@me" --url "https://github.com/${REPO}/issues/${issue_num}" --format json > /dev/null 2>&1; then
            echo -e "${GREEN}✅${NC}"
            ((ADDED_COUNT++))
        else
            echo -e "${YELLOW}⚠️  (may already be added)${NC}"
            ((FAILED_COUNT++))
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Added $ADDED_COUNT issues to project${NC}"
    if [ $FAILED_COUNT -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $FAILED_COUNT issues may have already been in the project${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Project Board Setup Complete!${NC}"
echo ""
echo "📋 Quick Commands:"
echo "   View project:     gh project view $PROJECT_NUMBER"
echo "   List issues:      gh issue list --project \"$PROJECT_TITLE\""
echo "   Create issue:     gh issue create --project \"$PROJECT_TITLE\""
echo "   View in browser:  open $PROJECT_URL"
echo ""
echo "📚 Next Steps:"
echo "1. Complete manual configuration in browser"
echo "2. Run ./create-issues.sh to create issues"
echo "3. Start working on Phase 1 issues"
echo "4. Update API_REVIEW_DOCUMENTATION.md as you progress"
