#!/bin/bash

# Character API Integration Test Script
# Tests Discord webhook integration with Mary Magnumbytes and Mac Nazarene characters
# Usage: ./test-integration.sh [start|stop|test|full]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_PORT=${API_PORT:-8000}
API_URL="http://localhost:$API_PORT"
PID_FILE="$SCRIPT_DIR/character-api.pid"
LOG_FILE="$SCRIPT_DIR/character-api.log"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
SKIPPED=0

# ============================================================================
# Helper Functions
# ============================================================================

log_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    echo -e "   ${RED}Error${NC}: $2"
    ((FAILED++))
}

log_skip() {
    echo -e "${YELLOW}⏭️  SKIP${NC}: $1 ($2)"
    ((SKIPPED++))
}

log_info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

log_header() {
    echo -e "\n${BLUE}================================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================================================${NC}"
}

# Start the Character API server
start_api() {
    log_info "Starting Character API on port $API_PORT..."
    
    # Kill any existing process
    stop_api 2>/dev/null || true
    
    # Start Character API server in background
    cd "$SCRIPT_DIR"
    python server.py "$API_PORT" > "$LOG_FILE" 2>&1 &
    API_PID=$!
    echo "$API_PID" > "$PID_FILE"
    
    # Wait for server to start
    log_info "Waiting for server to start..."
    for i in {1..10}; do
        if curl -s "$API_URL/api/character-health" > /dev/null 2>&1; then
            log_info "Character API is running on $API_URL"
            return 0
        fi
        sleep 1
    done
    
    log_fail "Character API failed to start" "Check $LOG_FILE for errors"
    return 1
}

# Stop the Character API server
stop_api() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            log_info "Stopping Character API (PID: $PID)..."
            kill "$PID" 2>/dev/null || true
            rm -f "$PID_FILE"
        fi
    fi
}

# Clean up on exit
cleanup() {
    stop_api
}

trap cleanup EXIT

# ============================================================================
# Test Functions
# ============================================================================

test_health_endpoint() {
    log_info "Testing health endpoint..."
    
    local response
    response=$(curl -s "$API_URL/api/character-health")
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/character-health")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Health endpoint" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    # Check for required fields
    if echo "$response" | grep -q '"status".*"healthy"'; then
        log_pass "Health endpoint returns healthy status"
    else
        log_fail "Health endpoint" "Missing or incorrect 'status' field"
        return 1
    fi
    
    if echo "$response" | grep -q '"discord_webhook"'; then
        log_pass "Health endpoint includes Discord webhook status"
    else
        log_fail "Health endpoint" "Missing 'discord_webhook' field"
        return 1
    fi
    
    if echo "$response" | grep -q '"characters_loaded"'; then
        local char_count=$(echo "$response" | grep -o '"characters_loaded":[0-9]*' | grep -o '[0-9]*')
        if [ "$char_count" -ge 8 ]; then
            log_pass "Health endpoint shows $char_count characters loaded (expected >= 8)"
        else
            log_fail "Health endpoint" "Only $char_count characters loaded, expected >= 8"
            return 1
        fi
    else
        log_fail "Health endpoint" "Missing 'characters_loaded' field"
        return 1
    fi
    
    echo "$response" | head -20
}

test_short_health_endpoint() {
    log_info "Testing short health endpoint (/health)..."
    
    local response
    response=$(curl -s "$API_URL/health")
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Short health endpoint" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    if echo "$response" | grep -q '"status".*"healthy"'; then
        log_pass "Short health endpoint works"
    else
        log_fail "Short health endpoint" "Incorrect response"
        return 1
    fi
}

test_get_all_characters() {
    log_info "Testing GET /api/characters..."
    
    local response
    response=$(curl -s "$API_URL/api/characters")
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/characters")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Get all characters" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    # Check for Mary Magnumbytes (ID: 1)
    if echo "$response" | grep -q '"id": 1' && echo "$response" | grep -q '"name": "Mary Magnumbytes"'; then
        log_pass "Mary Magnumbytes found in characters list"
    else
        log_fail "Get all characters" "Mary Magnumbytes not found"
        return 1
    fi
    
    # Check for Mac Nazarene (ID: 2)
    if echo "$response" | grep -q '"id": 2' && echo "$response" | grep -q '"name": "Mac Nazarene"'; then
        log_pass "Mac Nazarene found in characters list"
    else
        log_fail "Get all characters" "Mac Nazarene not found"
        return 1
    fi
    
    # Check total count
    local total=$(echo "$response" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    if [ "$total" -ge 8 ]; then
        log_pass "All $total characters retrieved"
    else
        log_fail "Get all characters" "Only $total characters, expected >= 8"
        return 1
    fi
}

test_get_character_by_id() {
    log_info "Testing GET /api/characters/1 (Mary Magnumbytes)..."
    
    local response
    response=$(curl -s "$API_URL/api/characters/1")
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/characters/1")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Get character by ID" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    if echo "$response" | grep -q '"id": 1' && echo "$response" | grep -q '"name": "Mary Magnumbytes"'; then
        log_pass "Mary Magnumbytes retrieved by ID"
    else
        log_fail "Get character by ID" "Incorrect character data"
        return 1
    fi
    
    # Check for required fields
    if echo "$response" | grep -q '"archetype"' && echo "$response" | grep -q '"rarity"'; then
        log_pass "Character has all required fields"
    else
        log_fail "Get character by ID" "Missing required fields"
        return 1
    fi
    
    log_info "Testing GET /api/characters/2 (Mac Nazarene)..."
    
    response=$(curl -s "$API_URL/api/characters/2")
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/characters/2")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Get Mac Nazarene by ID" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    if echo "$response" | grep -q '"id": 2' && echo "$response" | grep -q '"name": "Mac Nazarene"'; then
        log_pass "Mac Nazarene retrieved by ID"
    else
        log_fail "Get Mac Nazarene by ID" "Incorrect character data"
        return 1
    fi
}

test_search_characters() {
    log_info "Testing GET /api/characters/search/mary..."
    
    local response
    response=$(curl -s "$API_URL/api/characters/search/mary")
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/characters/search/mary")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Search characters" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    if echo "$response" | grep -q '"total":[1-9]'; then
        log_pass "Search returned results"
    else
        log_fail "Search characters" "No results returned"
        return 1
    fi
}

test_random_character() {
    log_info "Testing GET /api/characters/random..."
    
    local response
    response=$(curl -s "$API_URL/api/characters/random")
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/characters/random")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Random character" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    if echo "$response" | grep -q '"id"' && echo "$response" | grep -q '"name"'; then
        log_pass "Random character endpoint works"
    else
        log_fail "Random character" "Invalid response"
        return 1
    fi
}

test_discord_notification() {
    log_info "Testing POST /api/notifications/discord..."
    
    local test_payload='{
        "content": "Test notification from integration test",
        "embeds": [{
            "title": "Test Embed",
            "description": "Testing Discord notification integration",
            "color": 3447003,
            "timestamp": "'"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)""
        }]
    }'
    
    local response
    local status_code
    response=$(curl -s -X POST -H "Content-Type: application/json" -d "$test_payload" "$API_URL/api/notifications/discord")
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$test_payload" "$API_URL/api/notifications/discord")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Discord notification" "Expected HTTP 200, got $status_code"
        echo "Response: $response"
        return 1
    fi
    
    if echo "$response" | grep -q '"status".*"sent"'; then
        log_pass "Discord notification endpoint works"
    else
        log_fail "Discord notification" "Incorrect response"
        echo "Response: $response"
        return 1
    fi
}

test_discord_webhook_receiver() {
    log_info "Testing POST /api/webhooks/discord..."
    
    local test_payload='{
        "event": "test_event",
        "user_id": "123456789",
        "user_name": "TestUser",
        "message": "Test webhook event",
        "timestamp": "'"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)""
    }'
    
    local response
    local status_code
    response=$(curl -s -X POST -H "Content-Type: application/json" -d "$test_payload" "$API_URL/api/webhooks/discord")
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$test_payload" "$API_URL/api/webhooks/discord")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Discord webhook receiver" "Expected HTTP 200, got $status_code"
        echo "Response: $response"
        return 1
    fi
    
    if echo "$response" | grep -q '"status".*"received"'; then
        log_pass "Discord webhook receiver endpoint works"
    else
        log_fail "Discord webhook receiver" "Incorrect response"
        echo "Response: $response"
        return 1
    fi
}

test_invalid_json() {
    log_info "Testing error handling with invalid JSON..."
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "not valid json" "$API_URL/api/notifications/discord")
    
    if [ "$status_code" = "400" ]; then
        log_pass "Invalid JSON returns 400 error"
    else
        log_fail "Invalid JSON handling" "Expected HTTP 400, got $status_code"
        return 1
    fi
}

test_nonexistent_endpoint() {
    log_info "Testing 404 for non-existent endpoint..."
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/non-existent")
    
    if [ "$status_code" = "404" ]; then
        log_pass "Non-existent endpoint returns 404"
    else
        log_fail "404 handling" "Expected HTTP 404, got $status_code"
        return 1
    fi
}

test_content_creators() {
    log_info "Testing GET /api/content/creators..."
    
    local response
    response=$(curl -s "$API_URL/api/content/creators")
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/content/creators")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Content creators endpoint" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    if echo "$response" | grep -q '"success": true'; then
        log_pass "Content creators endpoint works"
    else
        log_fail "Content creators endpoint" "Incorrect response"
        return 1
    fi
}

test_budget_summary() {
    log_info "Testing GET /api/budget/summary..."
    
    local response
    response=$(curl -s "$API_URL/api/budget/summary")
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/budget/summary")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Budget summary endpoint" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    if echo "$response" | grep -q '"total_budget"' && echo "$response" | grep -q '"total_characters"'; then
        log_pass "Budget summary endpoint works"
    else
        log_fail "Budget summary endpoint" "Missing required fields"
        return 1
    fi
}

test_character_performance() {
    log_info "Testing GET /api/analytics/character-performance..."
    
    local response
    response=$(curl -s "$API_URL/api/analytics/character-performance")
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/analytics/character-performance")
    
    if [ "$status_code" != "200" ]; then
        log_fail "Character performance endpoint" "Expected HTTP 200, got $status_code"
        return 1
    fi
    
    if echo "$response" | grep -q '"summary"' && echo "$response" | grep -q '"data"'; then
        log_pass "Character performance endpoint works"
    else
        log_fail "Character performance endpoint" "Incorrect response"
        return 1
    fi
}

# ============================================================================
# Test Runner
# ============================================================================

run_tests() {
    log_header "Character API Integration Test Suite"
    echo -e "${BLUE}API URL${NC}: $API_URL"
    echo -e "${BLUE}Testing${NC}: Discord webhook integration with Mary & Mac characters"
    echo
    
    # Run all tests
    test_health_endpoint
    test_short_health_endpoint
    test_get_all_characters
    test_get_character_by_id
    test_search_characters
    test_random_character
    test_discord_notification
    test_discord_webhook_receiver
    test_invalid_json
    test_nonexistent_endpoint
    test_content_creators
    test_budget_summary
    test_character_performance
}

print_summary() {
    log_header "Test Summary"
    
    local total=$((PASSED + FAILED + SKIPPED))
    local duration=$SECONDS
    
    echo -e "${BLUE}Total Tests${NC}:  $total"
    echo -e "${GREEN}Passed${NC}:      $PASSED"
    echo -e "${RED}Failed${NC}:      $FAILED"
    echo -e "${YELLOW}Skipped${NC}:      $SKIPPED"
    echo -e "${BLUE}Duration${NC}:      ${duration}s"
    echo
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        echo
        echo -e "${BLUE}Next Steps:${NC}"
        echo "  1. Deploy to Vercel: vercel --prod"
        echo "  2. Set DISCORD_WEBHOOK environment variable in Vercel"
        echo "  3. Configure Discord bot with webhook URL"
        echo "  4. Test Discord integration in production"
        return 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        return 1
    fi
}

# ============================================================================
# Main
# ============================================================================

case "${1:-full}" in
    start)
        log_header "Starting Character API"
        start_api
        ;;
    stop)
        log_header "Stopping Character API"
        stop_api
        ;;
    test)
        log_header "Running Integration Tests"
        if [ ! -f "$PID_FILE" ]; then
            start_api || exit 1
        fi
        run_tests
        print_summary
        ;;
    full)
        log_header "Full Test Cycle: Start → Test → Stop"
        start_api || exit 1
        run_tests
        print_summary
        stop_api
        ;;
    *)
        echo "Usage: $0 {start|stop|test|full}"
        echo "  start - Start the Character API server"
        echo "  stop  - Stop the Character API server"
        echo "  test  - Run integration tests (auto-starts if needed)"
        echo "  full  - Start, test, and stop (default)"
        exit 1
        ;;
esac
