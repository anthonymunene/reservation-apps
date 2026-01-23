#!/bin/bash

# GitHub Issues Creation Script for API Best Practices Project
# This script creates all the initial issues based on our code review findings

echo "🚀 Creating GitHub Issues for API Best Practices Implementation"
echo "============================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed. Please install it first:${NC}"
    echo "   brew install gh (macOS)"
    echo "   https://cli.github.com/manual/installation"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please authenticate with GitHub first:${NC}"
    echo "   gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is installed and authenticated${NC}"
echo ""

# Get repository name (avoid pager/interactive mode)
echo -e "${BLUE}🔍 Detecting repository...${NC}"
export PAGER=cat
export GH_PAGER=cat
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>&1)
REPO_STATUS=$?

if [ $REPO_STATUS -ne 0 ] || [ -z "$REPO" ]; then
    echo -e "${RED}❌ Failed to detect repository. Are you in a git repository?${NC}"
    echo "Error: $REPO"
    echo "Please run this script from the repository root directory."
    exit 1
fi
echo -e "${GREEN}✓ Repository detected: $REPO${NC}"
echo ""

# Create milestones
echo -e "${BLUE}📋 Creating Milestones...${NC}"

# Function to create milestone
create_milestone() {
    local title="$1"
    local description="$2"
    local due_date="$3"
    
    echo -n "Creating '$title'... "
    if gh api "repos/$REPO/milestones" -X POST \
        -f title="$title" \
        -f description="$description" \
        -f due_on="$due_date" \
        --silent 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ (may already exist)${NC}"
    fi
}

create_milestone "Phase 1: Critical Security & Performance" \
    "Week 1 - Address critical security vulnerabilities and performance issues" \
    "2026-02-04T23:59:59Z"

create_milestone "Phase 2: API Standards & Documentation" \
    "Week 2 - Implement API standards and documentation" \
    "2026-02-11T23:59:59Z"

create_milestone "Phase 3: Authentication & Authorization" \
    "Week 3-4 - Implement authentication system" \
    "2026-02-25T23:59:59Z"

create_milestone "Phase 4: Performance & Optimization" \
    "Week 5 - Performance optimizations" \
    "2026-03-04T23:59:59Z"

create_milestone "Phase 5: Testing & Quality" \
    "Week 6 - Testing and quality assurance" \
    "2026-03-11T23:59:59Z"

echo ""
echo -e "${BLUE}🏷️  Creating Labels...${NC}"

# Function to create label
create_label() {
    local name="$1"
    local color="$2"
    local description="$3"
    
    echo -n "Creating label '$name'... "
    if gh api "repos/$REPO/labels" -X POST \
        -f name="$name" \
        -f color="$color" \
        -f description="$description" \
        --silent 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ (may already exist)${NC}"
    fi
}

# Create all labels with colors
create_label "security" "d73a4a" "Security vulnerabilities and concerns"
create_label "🔴 critical" "b60205" "Critical priority - immediate attention required"
create_label "performance" "fbca04" "Performance optimization and improvements"
create_label "optimization" "fbca04" "Code and query optimizations"
create_label "code-quality" "0e8a16" "Code quality improvements"
create_label "refactor" "0e8a16" "Code refactoring"
create_label "api-standard" "1d76db" "API standards and best practices"
create_label "documentation" "0075ca" "Documentation improvements"
create_label "best-practice" "1d76db" "Best practices implementation"
create_label "enhancement" "a2eeef" "New features and enhancements"
create_label "feature" "a2eeef" "New feature requests"
create_label "authentication" "d4c5f9" "Authentication and authorization"
create_label "database" "c5def5" "Database related changes"

echo ""
echo -e "${BLUE}🔴 Creating Critical Security Issues...${NC}"

# CRITICAL SECURITY ISSUES
gh issue create \
  --repo "$REPO" \
  --title "[SECURITY] Remove hardcoded database credentials" \
  --body "## 📋 Security Issue Description
Database credentials are hardcoded in config/default.json which is a critical security vulnerability.

## 📍 Location
**File(s)**: \`apps/api/config/default.json:14\`

## 🎯 Impact Assessment
- [x] Critical - Immediate production risk

## 🔍 Current Implementation
\`\`\`json
\"postgresql\": {
  \"client\": \"postgres\",
  \"connection\": \"postgres://postgres:postgres@0.0.0.0:5432/reservation_knex_dev\"
}
\`\`\`

## ✅ Proposed Solution
- Move credentials to environment variables
- Use Infisical or dotenv for local development
- Update configuration to read from process.env

## ✔️ Acceptance Criteria
- [ ] Credentials removed from config files
- [ ] Environment variables implemented
- [ ] Documentation updated with setup instructions
- [ ] .env.example file created" \
  --label "security,🔴 critical" \
  --milestone "Phase 1: Critical Security & Performance"

echo "✓ Created security issue: Remove hardcoded database credentials"
echo ""
echo -e "${BLUE}🟡 Creating Performance Issues...${NC}"

# PERFORMANCE ISSUES
gh issue create \
  --repo "$REPO" \
  --title "[PERF] Fix N+1 query problem in properties service" \
  --body "## 📋 Performance Issue Description
Virtual resolvers in properties.schema.ts are making separate database queries for each property, causing N+1 query problems.

## 📍 Location
**Service/File**: \`apps/api/src/services/properties/properties.schema.ts:44-81\`

## 🎯 Performance Impact
- [x] Database queries (N+1, missing indexes)

## 🔍 Current Implementation
\`\`\`typescript
ownedBy: virtual(async (property, context) => {
  const { data } = await context.app.service('profiles').find({
    query: { userId: property.host }
  })
  // Separate query for each property
})
\`\`\`

## ✅ Proposed Optimization
- Implement batch loading
- Use DataLoader pattern
- Add database joins where appropriate
- Consider eager loading relationships

## ✔️ Acceptance Criteria
- [ ] N+1 queries eliminated
- [ ] Response time improved by >50%
- [ ] Tests added for query optimization" \
  --label "performance,optimization" \
  --milestone "Phase 1: Critical Security & Performance"

echo "✓ Created performance issue: Fix N+1 query problem"
echo ""
echo -e "${BLUE}🟠 Creating Code Quality Issues...${NC}"

# CODE QUALITY ISSUES
gh issue create \
  --repo "$REPO" \
  --title "[QUALITY] Remove console.log statements from production code" \
  --body "## 📋 Code Quality Issue
Console.log statements found in production code that should be replaced with proper logging.

## 📍 Location
**File(s)**:
- \`apps/api/src/hooks/sanitiseImagedata.ts:6\`
- \`apps/api/src/services/properties/properties.hooks.ts:4\`

## 🎯 Type of Issue
- [x] Console.log statements

## 🔍 Current Code
\`\`\`typescript
console.log(\`Running hook create order on \${context.path}.\${context.method}\`)
\`\`\`

## ✅ Refactored Code
\`\`\`typescript
logger.debug('Running hook create order', {
  path: context.path,
  method: context.method
})
\`\`\`

## ✔️ Acceptance Criteria
- [ ] All console.log statements removed
- [ ] Proper logger implemented
- [ ] Log levels configured appropriately" \
  --label "code-quality,refactor" \
  --milestone "Phase 1: Critical Security & Performance"

echo "✓ Created quality issue: Remove console.log statements"

gh issue create \
  --repo "$REPO" \
  --title "[QUALITY] Implement consistent error handling across services" \
  --body "## 📋 Code Quality Issue
Error handling is inconsistent across different services. Need standardized error handling patterns.

## 🎯 Type of Issue
- [x] Missing error handling
- [x] Inconsistent patterns

## ✅ Proposed Solution
- Create centralized error handler
- Implement custom error classes
- Add error codes and messages
- Standardize error responses

## ✔️ Acceptance Criteria
- [ ] Error handler middleware created
- [ ] Custom error classes implemented
- [ ] All services use consistent error handling
- [ ] Error responses follow API standard format" \
  --label "code-quality,refactor" \
  --milestone "Phase 1: Critical Security & Performance"

echo "✓ Created quality issue: Implement consistent error handling"
echo ""
echo -e "${BLUE}🔵 Creating API Standard Issues...${NC}"

# API STANDARDS
gh issue create \
  --repo "$REPO" \
  --title "[API] Implement OpenAPI/Swagger documentation" \
  --body "## 📋 API Standard to Implement
Set up OpenAPI/Swagger documentation for all API endpoints.

## 🎯 Type of Standard
- [x] Documentation

## 📍 Affected Endpoints
- [x] All endpoints

## ✅ Implementation Plan
- Install and configure Swagger UI
- Generate OpenAPI specs from TypeBox schemas
- Document all endpoints
- Add request/response examples
- Set up automatic documentation generation

## ✔️ Acceptance Criteria
- [ ] Swagger UI accessible at /api-docs
- [ ] All endpoints documented
- [ ] Schemas auto-generated from TypeBox
- [ ] Examples provided for each endpoint" \
  --label "api-standard,documentation" \
  --milestone "Phase 2: API Standards & Documentation"

echo "✓ Created API standard issue: Implement OpenAPI/Swagger documentation"

gh issue create \
  --repo "$REPO" \
  --title "[API] Standardize API response format" \
  --body "## 📋 API Standard to Implement
Implement consistent response format across all API endpoints.

## 🎯 Type of Standard
- [x] Response format standardization

## ✅ Standard Format
\`\`\`json
{
  \"success\": true,
  \"data\": {},
  \"meta\": {
    \"timestamp\": \"2025-01-28T10:00:00Z\",
    \"version\": \"1.0.0\",
    \"pagination\": {}
  }
}
\`\`\`

## ✔️ Acceptance Criteria
- [ ] Response wrapper implemented
- [ ] All endpoints return standard format
- [ ] Error responses standardized
- [ ] Pagination metadata included" \
  --label "api-standard,best-practice" \
  --milestone "Phase 2: API Standards & Documentation"

echo "✓ Created API standard issue: Standardize API response format"

gh issue create \
  --repo "$REPO" \
  --title "[API] Add pagination to all list endpoints" \
  --body "## 📋 API Standard to Implement
Implement consistent pagination across all list endpoints.

## 📍 Affected Endpoints
- [x] /users
- [x] /properties
- [x] /profiles
- [x] /amenities
- [x] /reviews

## ✅ Implementation
- Page-based pagination
- Limit/offset support
- Total count in metadata
- Default and max limits

## ✔️ Acceptance Criteria
- [ ] Pagination implemented on all list endpoints
- [ ] Consistent query parameters (page, limit)
- [ ] Metadata includes total count and pages
- [ ] Max limit enforced" \
  --label "api-standard,best-practice" \
  --milestone "Phase 2: API Standards & Documentation"

echo "✓ Created API standard issue: Add pagination to all list endpoints"
echo ""
echo -e "${BLUE}✨ Creating Feature Issues...${NC}"

# FEATURES
gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Implement JWT authentication" \
  --body "## 📋 Feature Description
Implement JWT-based authentication system using FeathersJS authentication module.

## 🎯 Feature Type
- [x] Authentication/Authorization

## 💡 Proposed Solution
- Use @feathersjs/authentication-jwt
- Implement login/logout endpoints
- Add refresh token mechanism
- Secure all protected routes

## 📚 Learning Goals
- [x] Understanding JWT authentication flow
- [x] FeathersJS authentication patterns
- [x] Token refresh strategies

## ✔️ Acceptance Criteria
- [ ] JWT authentication implemented
- [ ] Login/logout endpoints working
- [ ] Refresh token mechanism added
- [ ] Protected routes secured
- [ ] Tests for authentication flow" \
  --label "enhancement,feature,authentication" \
  --milestone "Phase 3: Authentication & Authorization"

echo "✓ Created feature issue: Implement JWT authentication"

gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Implement rate limiting" \
  --body "## 📋 Feature Description
Add rate limiting to prevent API abuse and ensure fair usage.

## 🎯 Feature Type
- [x] Security/Performance

## 💡 Proposed Solution
- Implement per-IP rate limiting
- Add user-based rate limits
- Configure different limits per endpoint
- Add rate limit headers to responses

## ✔️ Acceptance Criteria
- [ ] Rate limiting middleware implemented
- [ ] Configurable limits per endpoint
- [ ] Rate limit headers in responses
- [ ] 429 status code when limit exceeded
- [ ] Documentation updated" \
  --label "enhancement,feature,security" \
  --milestone "Phase 2: API Standards & Documentation"

echo "✓ Created feature issue: Implement rate limiting"
echo ""
echo -e "${BLUE}📊 Creating Database Optimization Issues...${NC}"

gh issue create \
  --repo "$REPO" \
  --title "[PERF] Add database indexes for frequently queried fields" \
  --body "## 📋 Performance Issue Description
Missing database indexes on frequently queried fields causing slow queries.

## 📍 Tables Affected
- Property (host, propertyTypeId, city)
- User (email)
- Profile (userId)
- PropertyAmenity (propertyId, amenityId)

## ✅ Proposed Indexes
\`\`\`sql
CREATE INDEX idx_property_host ON Property(host);
CREATE INDEX idx_property_type ON Property(propertyTypeId);
CREATE INDEX idx_property_city ON Property(city);
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_profile_user ON Profile(userId);
CREATE UNIQUE INDEX idx_property_amenity ON PropertyAmenity(propertyId, amenityId);
\`\`\`

## ✔️ Acceptance Criteria
- [ ] Indexes added via migration
- [ ] Query performance tested
- [ ] No duplicate indexes
- [ ] Migration is reversible" \
  --label "performance,database" \
  --milestone "Phase 4: Performance & Optimization"

echo "✓ Created performance issue: Add database indexes"
echo ""
echo -e "${GREEN}✅ Issues creation complete!${NC}"
echo ""
echo "📋 Summary:"
echo "   - Security Issues: 1"
echo "   - Performance Issues: 2"
echo "   - Code Quality Issues: 2"
echo "   - API Standards: 3"
echo "   - Features: 2"
echo "   - Database: 1"
echo ""
echo "Next steps:"
echo "1. Run: gh issue list"
echo "2. Create a project: gh project create"
echo "3. Add issues to project board"
