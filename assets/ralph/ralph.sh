#!/bin/bash
# Ralph - PRD-Driven Autonomous Development Loop for Claude Code
# Inspired by: https://github.com/snarktank/ralph
#
# Usage: ./ralph.sh [iterations]
# Default: 10 iterations

set -e

# Configuration
MAX_ITERATIONS=${1:-10}
PROMPT_FILE="ralph-prompt.md"
PRD_FILE="prd.json"
PROGRESS_FILE="progress.txt"
BRANCH_FILE=".ralph-branch"
ARCHIVE_DIR=".ralph-archive"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                           ║${NC}"
echo -e "${CYAN}║   ${YELLOW}Ralph${CYAN} - PRD-Driven Autonomous Development            ║${NC}"
echo -e "${CYAN}║   Powered by Claude Code + ZuppaClaude                    ║${NC}"
echo -e "${CYAN}║                                                           ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check requirements
check_requirements() {
    if ! command -v claude &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Claude Code not found. Install with:"
        echo "  npm install -g @anthropic-ai/claude-code"
        exit 1
    fi

    if [ ! -f "$PRD_FILE" ]; then
        echo -e "${RED}[ERROR]${NC} $PRD_FILE not found."
        echo "  Run: zuppaclaude ralph init"
        exit 1
    fi

    if [ ! -f "$PROMPT_FILE" ]; then
        echo -e "${RED}[ERROR]${NC} $PROMPT_FILE not found."
        echo "  Run: zuppaclaude ralph init"
        exit 1
    fi
}

# Get current branch
get_branch() {
    git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-git"
}

# Check if branch changed and archive if needed
check_branch() {
    local current_branch=$(get_branch)

    if [ -f "$BRANCH_FILE" ]; then
        local last_branch=$(cat "$BRANCH_FILE")
        if [ "$current_branch" != "$last_branch" ]; then
            echo -e "${YELLOW}[BRANCH]${NC} Branch changed: $last_branch -> $current_branch"
            archive_progress "$last_branch"
        fi
    fi

    echo "$current_branch" > "$BRANCH_FILE"
}

# Archive previous progress
archive_progress() {
    local branch_name=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local archive_path="$ARCHIVE_DIR/${branch_name}_${timestamp}"

    mkdir -p "$archive_path"

    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$archive_path/"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$archive_path/"

    echo -e "${BLUE}[ARCHIVE]${NC} Saved to $archive_path"

    # Reset progress for new branch
    echo "# Progress Log - $(date)" > "$PROGRESS_FILE"
    echo "" >> "$PROGRESS_FILE"
}

# Count completed stories
count_stories() {
    local total=$(jq '.stories | length' "$PRD_FILE" 2>/dev/null || echo "0")
    local completed=$(jq '[.stories[] | select(.passes == true)] | length' "$PRD_FILE" 2>/dev/null || echo "0")
    echo "$completed/$total"
}

# Check if all stories complete
all_complete() {
    local incomplete=$(jq '[.stories[] | select(.passes == false or .passes == null)] | length' "$PRD_FILE" 2>/dev/null || echo "1")
    [ "$incomplete" -eq 0 ]
}

# Run single iteration
run_iteration() {
    local iteration=$1
    local stories=$(count_stories)

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Iteration $iteration/$MAX_ITERATIONS │ Stories: $stories${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    # Run Claude Code with the prompt
    local output=$(claude --print "$PROMPT_FILE" 2>&1) || true

    # Check for completion signal
    if echo "$output" | grep -q "<promise>COMPLETE</promise>"; then
        return 0
    fi

    return 1
}

# Main loop
main() {
    check_requirements
    check_branch

    echo -e "${GREEN}[START]${NC} Running up to $MAX_ITERATIONS iterations"
    echo -e "${BLUE}[PRD]${NC} $(count_stories) stories"
    echo ""

    # Initialize progress file if not exists
    if [ ! -f "$PROGRESS_FILE" ]; then
        echo "# Progress Log - $(date)" > "$PROGRESS_FILE"
        echo "" >> "$PROGRESS_FILE"
    fi

    for ((i=1; i<=MAX_ITERATIONS; i++)); do
        if all_complete; then
            echo ""
            echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║                                                           ║${NC}"
            echo -e "${GREEN}║   ALL STORIES COMPLETE!                                   ║${NC}"
            echo -e "${GREEN}║                                                           ║${NC}"
            echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
            echo ""
            exit 0
        fi

        if run_iteration $i; then
            echo -e "${GREEN}[COMPLETE]${NC} Received completion signal"
            break
        fi

        # Small delay between iterations
        sleep 2
    done

    if ! all_complete; then
        echo ""
        echo -e "${YELLOW}[WARN]${NC} Max iterations reached. $(count_stories) stories completed."
        echo -e "${YELLOW}[WARN]${NC} Run again to continue: ./ralph.sh"
        exit 1
    fi
}

# Run
main
