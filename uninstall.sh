#!/bin/bash

#===============================================================================
#   ZuppaClaude Uninstaller
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

CLAUDE_DIR="$HOME/.claude"

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║   ZuppaClaude Uninstaller                                         ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}This will remove:${NC}"
echo "  • SuperClaude commands (~/.claude/commands/sc/)"
echo "  • CLAUDE.md configuration (~/.claude/CLAUDE.md)"
echo "  • Spec Kit CLI (specify-cli)"
echo ""

read -p "Continue with uninstall? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${CYAN}Uninstall cancelled.${NC}"
    exit 0
fi

echo ""

# Remove SuperClaude
if [ -d "$CLAUDE_DIR/commands/sc" ]; then
    rm -rf "$CLAUDE_DIR/commands/sc"
    echo -e "${GREEN}[✓]${NC} SuperClaude removed"
else
    echo -e "${YELLOW}[!]${NC} SuperClaude not found"
fi

# Backup and remove CLAUDE.md
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    BACKUP="$CLAUDE_DIR/CLAUDE.md.uninstall.$(date +%Y%m%d_%H%M%S)"
    mv "$CLAUDE_DIR/CLAUDE.md" "$BACKUP"
    echo -e "${GREEN}[✓]${NC} CLAUDE.md backed up to: $BACKUP"
else
    echo -e "${YELLOW}[!]${NC} CLAUDE.md not found"
fi

# Remove Spec Kit
if command -v uv >/dev/null 2>&1; then
    uv tool uninstall specify-cli 2>/dev/null && echo -e "${GREEN}[✓]${NC} Spec Kit removed (uv)" || true
elif command -v pipx >/dev/null 2>&1; then
    pipx uninstall specify-cli 2>/dev/null && echo -e "${GREEN}[✓]${NC} Spec Kit removed (pipx)" || true
elif command -v pip3 >/dev/null 2>&1; then
    pip3 uninstall specify-cli -y 2>/dev/null && echo -e "${GREEN}[✓]${NC} Spec Kit removed (pip3)" || true
else
    echo -e "${YELLOW}[!]${NC} Could not remove Spec Kit (no package manager found)"
fi

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║   Uninstall complete!                                             ║"
echo "║   Restart Claude Code to apply changes.                           ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
