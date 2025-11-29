#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   StoMaTrade - Neon Database Setup    ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if neonctl is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx not found. Please install Node.js first.${NC}"
    exit 1
fi

# Function to get connection string
get_connection_string() {
    echo -e "${BLUE}Getting connection string from Neon...${NC}"

    # Get project list
    echo -e "${YELLOW}Fetching your Neon projects...${NC}"
    npx neonctl@latest projects list

    echo -e "\n${YELLOW}Enter your Neon project ID (or press Enter to create new):${NC}"
    read PROJECT_ID

    if [ -z "$PROJECT_ID" ]; then
        echo -e "${BLUE}Creating new Neon project...${NC}"
        PROJECT_ID=$(npx neonctl@latest projects create --name stomatrade-backend --output json | jq -r '.id')
        echo -e "${GREEN}Project created with ID: $PROJECT_ID${NC}"
    fi

    # Get connection string
    CONN_STRING=$(npx neonctl@latest connection-string --project-id "$PROJECT_ID" 2>/dev/null)

    if [ -z "$CONN_STRING" ]; then
        echo -e "${RED}Failed to get connection string. Please get it manually from:${NC}"
        echo -e "${YELLOW}https://console.neon.tech${NC}"
        exit 1
    fi

    echo -e "${GREEN}Connection string retrieved!${NC}\n"
    echo "$CONN_STRING"
}

# Main setup
echo -e "${YELLOW}This script will help you setup Neon database for StoMaTrade.${NC}\n"

# Option 1: Get from Neon Console
echo -e "${BLUE}Option 1: Get connection string from Neon Console${NC}"
echo -e "1. Visit: ${YELLOW}https://console.neon.tech${NC}"
echo -e "2. Select or create your project"
echo -e "3. Copy the connection string\n"

# Option 2: Use neonctl
echo -e "${BLUE}Option 2: Use neonctl (automated)${NC}\n"

echo -e "${YELLOW}Choose option (1 or 2):${NC}"
read OPTION

if [ "$OPTION" = "1" ]; then
    echo -e "\n${YELLOW}Enter your Neon connection string:${NC}"
    read CONN_STRING
elif [ "$OPTION" = "2" ]; then
    CONN_STRING=$(get_connection_string)
else
    echo -e "${RED}Invalid option${NC}"
    exit 1
fi

# Validate connection string
if [[ ! $CONN_STRING =~ ^postgresql:// ]]; then
    echo -e "${RED}Invalid connection string format${NC}"
    exit 1
fi

# Ensure sslmode=require
if [[ ! $CONN_STRING =~ sslmode=require ]]; then
    if [[ $CONN_STRING =~ \? ]]; then
        CONN_STRING="${CONN_STRING}&sslmode=require"
    else
        CONN_STRING="${CONN_STRING}?sslmode=require"
    fi
fi

# Update .env file
echo -e "\n${BLUE}Updating .env file...${NC}"

cat > .env << EOF
# Neon Database Connection
DATABASE_URL="${CONN_STRING}"

# Direct URL for migrations (same as DATABASE_URL for Neon)
DIRECT_URL="${CONN_STRING}"

# Application
PORT=3000
NODE_ENV=development
EOF

echo -e "${GREEN}.env file updated successfully!${NC}\n"

# Ask if user wants to run migrations
echo -e "${YELLOW}Do you want to run Prisma migrations now? (y/n)${NC}"
read RUN_MIGRATIONS

if [ "$RUN_MIGRATIONS" = "y" ] || [ "$RUN_MIGRATIONS" = "Y" ]; then
    echo -e "\n${BLUE}Running Prisma migrations...${NC}\n"

    # Generate Prisma Client
    echo -e "${BLUE}1. Generating Prisma Client...${NC}"
    npx prisma generate

    # Push schema to database
    echo -e "\n${BLUE}2. Pushing schema to database...${NC}"
    npx prisma db push

    echo -e "\n${GREEN}Database setup complete!${NC}"
else
    echo -e "\n${YELLOW}Skipping migrations. Run these commands manually:${NC}"
    echo -e "  ${BLUE}npx prisma generate${NC}"
    echo -e "  ${BLUE}npx prisma db push${NC}"
fi

# Display next steps
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Run the application:"
echo -e "   ${BLUE}pnpm run start:dev${NC}\n"
echo -e "2. Access Swagger UI:"
echo -e "   ${BLUE}http://localhost:3000/api${NC}\n"
echo -e "3. Open Prisma Studio (optional):"
echo -e "   ${BLUE}npx prisma studio${NC}\n"

echo -e "${GREEN}Happy coding! 🚀${NC}\n"
