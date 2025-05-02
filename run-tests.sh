#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Function to print header
print_header() {
  echo -e "\n${YELLOW}===================================${RESET}"
  echo -e "${YELLOW}$1${RESET}"
  echo -e "${YELLOW}===================================${RESET}\n"
}

# Check if we just want to run a specific test suite
if [ "$1" != "" ]; then
  case $1 in
    "unit")
      print_header "Running Unit Tests"
      npx jest tests/plugin.test.ts tests/settings.test.ts tests/sync.test.ts
      exit $?
      ;;
    "integration")
      print_header "Running Integration Tests"
      npx jest tests/integration
      exit $?
      ;;
    "components")
      print_header "Running Component Tests"
      npx jest tests/components
      exit $?
      ;;
    "performance")
      print_header "Running Performance Tests"
      npx jest tests/performance
      exit $?
      ;;
    "e2e")
      print_header "Running End-to-End Tests"
      npx jest tests/e2e
      exit $?
      ;;
    "coverage")
      print_header "Running Tests with Coverage"
      npx jest --coverage
      exit $?
      ;;
    "coverage:ci")
      print_header "Running Tests with Coverage for CI"
      CI=true npx jest --coverage --ci
      exit $?
      ;;
    "coverage:report")
      print_header "Generating Coverage Report"
      ./generate-coverage.sh
      exit $?
      ;;
    *)
      echo -e "${RED}Unknown test suite: $1${RESET}"
      echo "Available options: unit, integration, components, performance, e2e, coverage, coverage:ci, coverage:report"
      exit 1
      ;;
  esac
fi

# Run all tests in order
run_test_suite() {
  print_header "$1"
  npx jest $2
  RESULT=$?
  if [ $RESULT -eq 0 ]; then
    echo -e "\n${GREEN}✓ $1 passed${RESET}\n"
  else
    echo -e "\n${RED}✗ $1 failed${RESET}\n"
    FAILED=1
  fi
}

FAILED=0

# Run tests in order from simplest to most complex
run_test_suite "Unit Tests" "tests/plugin.test.ts tests/settings.test.ts tests/sync.test.ts"
run_test_suite "Component Tests" "tests/components"
run_test_suite "Integration Tests" "tests/integration"
run_test_suite "Performance Tests" "tests/performance"

# Only run E2E tests if they exist and are not in CI
if [ -d "tests/e2e" ] && [ "$CI" != "true" ]; then
  run_test_suite "End-to-End Tests" "tests/e2e"
fi

# Summary
if [ $FAILED -eq 0 ]; then
  print_header "All tests passed successfully! 🎉"
  
  # Generate coverage report if --coverage flag is passed
  if [ "$2" == "--coverage" ]; then
    print_header "Generating Coverage Report"
    ./generate-coverage.sh
  fi
else
  print_header "Some tests failed. Please check the output above."
  exit 1
fi