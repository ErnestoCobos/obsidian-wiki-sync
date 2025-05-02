#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Function to check threshold and color output
check_threshold() {
  local value=$1
  local threshold=$2
  
  if (( $(echo "$value >= $threshold" | bc -l) )); then
    echo -e "${GREEN}$value%${RESET}"
  elif (( $(echo "$value >= $(echo "$threshold - 10" | bc -l)" | bc -l) )); then
    echo -e "${YELLOW}$value%${RESET}"
  else
    echo -e "${RED}$value%${RESET}"
  fi
}

# Run tests with coverage if not already run
if [ ! -d "coverage" ] || [ ! -f "coverage/coverage-summary.json" ]; then
  echo -e "${BLUE}Running tests with coverage...${RESET}"
  npm run test:coverage
fi

# Check if coverage directory exists
if [ ! -d "coverage" ]; then
  echo -e "${RED}Error: Coverage directory not found!${RESET}"
  exit 1
fi

# Generate coverage badge
echo -e "${BLUE}Generating coverage badge...${RESET}"
npx make-coverage-badge --output-path ./coverage/badge.svg

# Print summary
echo -e "\n${GREEN}Coverage report generated successfully!${RESET}"
echo -e "${YELLOW}Summary:${RESET}"

# Extract coverage metrics
COVERAGE_SUMMARY="./coverage/coverage-summary.json"
if [ -f "$COVERAGE_SUMMARY" ]; then
  LINES=$(jq '.total.lines.pct' $COVERAGE_SUMMARY)
  STATEMENTS=$(jq '.total.statements.pct' $COVERAGE_SUMMARY)
  FUNCTIONS=$(jq '.total.functions.pct' $COVERAGE_SUMMARY)
  BRANCHES=$(jq '.total.branches.pct' $COVERAGE_SUMMARY)
  
  # Get thresholds from jest.config.js
  LINES_THRESHOLD=$(grep -A5 "global:" jest.config.js | grep "lines:" | awk '{print $2}' | tr -d ',')
  STATEMENTS_THRESHOLD=$(grep -A5 "global:" jest.config.js | grep "statements:" | awk '{print $2}' | tr -d ',')
  FUNCTIONS_THRESHOLD=$(grep -A5 "global:" jest.config.js | grep "functions:" | awk '{print $2}' | tr -d ',')
  BRANCHES_THRESHOLD=$(grep -A5 "global:" jest.config.js | grep "branches:" | awk '{print $2}' | tr -d ',')
  
  # Print overall metrics with thresholds
  echo -e "  - Lines: $(check_threshold $LINES $LINES_THRESHOLD) (threshold: ${CYAN}$LINES_THRESHOLD%${RESET})"
  echo -e "  - Statements: $(check_threshold $STATEMENTS $STATEMENTS_THRESHOLD) (threshold: ${CYAN}$STATEMENTS_THRESHOLD%${RESET})"
  echo -e "  - Functions: $(check_threshold $FUNCTIONS $FUNCTIONS_THRESHOLD) (threshold: ${CYAN}$FUNCTIONS_THRESHOLD%${RESET})"
  echo -e "  - Branches: $(check_threshold $BRANCHES $BRANCHES_THRESHOLD) (threshold: ${CYAN}$BRANCHES_THRESHOLD%${RESET})"
  
  # Show detailed file metrics for main.ts
  echo -e "\n${YELLOW}Detailed metrics for main.ts:${RESET}"
  MAIN_LINES=$(jq '.["main.ts"].lines.pct' $COVERAGE_SUMMARY)
  MAIN_STATEMENTS=$(jq '.["main.ts"].statements.pct' $COVERAGE_SUMMARY)
  MAIN_FUNCTIONS=$(jq '.["main.ts"].functions.pct' $COVERAGE_SUMMARY)
  MAIN_BRANCHES=$(jq '.["main.ts"].branches.pct' $COVERAGE_SUMMARY)
  
  # Get file-specific thresholds
  MAIN_LINES_THRESHOLD=$(grep -A5 "main.ts" jest.config.js | grep "lines:" | awk '{print $2}' | tr -d ',')
  MAIN_STATEMENTS_THRESHOLD=$(grep -A5 "main.ts" jest.config.js | grep "statements:" | awk '{print $2}' | tr -d ',')
  MAIN_FUNCTIONS_THRESHOLD=$(grep -A5 "main.ts" jest.config.js | grep "functions:" | awk '{print $2}' | tr -d ',')
  MAIN_BRANCHES_THRESHOLD=$(grep -A5 "main.ts" jest.config.js | grep "branches:" | awk '{print $2}' | tr -d ',')
  
  echo -e "  - Lines: $(check_threshold $MAIN_LINES $MAIN_LINES_THRESHOLD) (threshold: ${CYAN}$MAIN_LINES_THRESHOLD%${RESET})"
  echo -e "  - Statements: $(check_threshold $MAIN_STATEMENTS $MAIN_STATEMENTS_THRESHOLD) (threshold: ${CYAN}$MAIN_STATEMENTS_THRESHOLD%${RESET})"
  echo -e "  - Functions: $(check_threshold $MAIN_FUNCTIONS $MAIN_FUNCTIONS_THRESHOLD) (threshold: ${CYAN}$MAIN_FUNCTIONS_THRESHOLD%${RESET})"
  echo -e "  - Branches: $(check_threshold $MAIN_BRANCHES $MAIN_BRANCHES_THRESHOLD) (threshold: ${CYAN}$MAIN_BRANCHES_THRESHOLD%${RESET})"
  
  # List files with low coverage
  echo -e "\n${YELLOW}Files with lower than expected coverage:${RESET}"
  jq -r 'to_entries[] | select(.key != "total" and (.value.lines.pct < 70 or .value.functions.pct < 75 or .value.branches.pct < 60)) | "\(.key): Lines: \(.value.lines.pct)%, Functions: \(.value.functions.pct)%, Branches: \(.value.branches.pct)%"' $COVERAGE_SUMMARY | while read -r line; do
    echo -e "  - ${RED}$line${RESET}"
  done
  
  # Check if threshold is met
  if (( $(echo "$LINES < $LINES_THRESHOLD" | bc -l) )) || \
     (( $(echo "$STATEMENTS < $STATEMENTS_THRESHOLD" | bc -l) )) || \
     (( $(echo "$FUNCTIONS < $FUNCTIONS_THRESHOLD" | bc -l) )) || \
     (( $(echo "$BRANCHES < $BRANCHES_THRESHOLD" | bc -l) )); then
    echo -e "\n${RED}Warning: Coverage thresholds not met!${RESET}"
  else
    echo -e "\n${GREEN}Success: All coverage thresholds met!${RESET}"
  fi
else
  echo -e "${RED}Coverage summary not found!${RESET}"
fi

echo -e "\n${BLUE}Full coverage report available at:${RESET}"
echo -e "  ${YELLOW}file://$(pwd)/coverage/lcov-report/index.html${RESET}"
echo -e "\n${BLUE}Coverage badge saved to:${RESET}"
echo -e "  ${YELLOW}./coverage/badge.svg${RESET}\n"

# If in CI environment, output path to junit.xml
if [ "$CI" = "true" ] && [ -f "coverage/junit.xml" ]; then
  echo -e "${BLUE}JUnit XML report available at:${RESET}"
  echo -e "  ${YELLOW}./coverage/junit.xml${RESET}\n"
fi