#!/usr/bin/env bash
# ==============================================================================
# Riders Bay SIEP Season 7.0 - Instant Agent Context Checker
# ==============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
CYAN="\033[36m"
RED="\033[31m"
RESET="\033[0m"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo -e "${CYAN}${BOLD}======================================================${RESET}"
echo -e "${CYAN}${BOLD}   🏍️  RIDERS BAY CODEBASE CONTEXT & STATUS CHECK      ${RESET}"
echo -e "${CYAN}${BOLD}======================================================${RESET}"
echo ""

# 1. Git Status Summary
echo -e "${BOLD}1. Git State:${RESET}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
LATEST_COMMIT=$(git log -1 --oneline 2>/dev/null || echo "none")
echo -e "   • Branch: ${GREEN}${CURRENT_BRANCH}${RESET}"
echo -e "   • Head:   ${YELLOW}${LATEST_COMMIT}${RESET}"

DIRTY_COUNT=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "$DIRTY_COUNT" -gt 0 ]; then
  echo -e "   • Status: ${YELLOW}${DIRTY_COUNT} uncommitted/untracked files${RESET}"
  git status --short
else
  echo -e "   • Status: ${GREEN}Clean working tree${RESET}"
fi
echo ""

# 2. TypeScript Compilation Check
echo -e "${BOLD}2. Type Safety Check (web/):${RESET}"
if [ -d "web" ]; then
  if (cd web && [ -f "./node_modules/.bin/tsc" ] && ./node_modules/.bin/tsc --noEmit 2>/dev/null); then
    echo -e "   • TypeScript: ${GREEN}PASS (0 errors)${RESET}"
  else
    echo -e "   • TypeScript: ${RED}FAIL or skipped (check web/)${RESET}"
  fi
else
  echo "   • web/ directory not found"
fi
echo ""

# 3. Active Handover Snippet
echo -e "${BOLD}3. Active Handover Focus (.context/HANDOVER.md):${RESET}"
if [ -f ".context/HANDOVER.md" ]; then
  sed -n '/1\. CURRENT WORKSPACE STATUS/,/4\. KNOWN QUIRKS/p' .context/HANDOVER.md | head -n 35
else
  echo -e "   ${YELLOW}.context/HANDOVER.md not found. Create one to maintain session memory.${RESET}"
fi

echo ""
echo -e "${CYAN}======================================================${RESET}"
echo -e "${GREEN}Context loaded. Reference AGENTS.md for full operating rules.${RESET}"
