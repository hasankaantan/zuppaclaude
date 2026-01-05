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

# Config
CLAUDE_DIR="$HOME/.claude"
ZUPPACLAUDE_CONFIG_DIR="$HOME/.config/zuppaclaude"
SETTINGS_FILE="$ZUPPACLAUDE_CONFIG_DIR/zc-settings.json"

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║   ZuppaClaude Uninstaller                                         ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}This will remove:${NC}"
echo "  • SuperClaude commands (~/.claude/commands/sc/)"
echo "  • CLAUDE.md configuration (~/.claude/CLAUDE.md)"
echo "  • Spec Kit CLI (specify-cli)"
echo "  • Claude-Z script (~/.local/bin/claude-z)"
echo "  • Claude HUD setup script (~/.local/bin/setup-claude-hud)"
echo "  • Z.AI configuration (~/.config/zai/)"
echo ""

echo -n "Continue with uninstall? [y/N] "
read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="n"
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${CYAN}Uninstall cancelled.${NC}"
    exit 0
fi

echo ""

# Ask about preserving settings
KEEP_SETTINGS=false
if [ -f "$SETTINGS_FILE" ]; then
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Settings Preservation${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Found saved settings at: $SETTINGS_FILE"
    echo "Keeping settings allows quick reinstall with your previous choices."
    echo ""
    echo -n "Keep settings for future reinstall? [Y/n] "
    read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="y"
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        KEEP_SETTINGS=true
        echo -e "${GREEN}[✓]${NC} Settings will be preserved"
    else
        echo -e "${YELLOW}[!]${NC} Settings will be removed"
    fi
    echo ""
fi

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

# Remove Claude-Z
if [ -f "$HOME/.local/bin/claude-z" ]; then
    rm -f "$HOME/.local/bin/claude-z"
    echo -e "${GREEN}[✓]${NC} Claude-Z script removed"
else
    echo -e "${YELLOW}[!]${NC} Claude-Z script not found"
fi

# Remove Claude HUD setup script
if [ -f "$HOME/.local/bin/setup-claude-hud" ]; then
    rm -f "$HOME/.local/bin/setup-claude-hud"
    echo -e "${GREEN}[✓]${NC} Claude HUD setup script removed"
else
    echo -e "${YELLOW}[!]${NC} Claude HUD setup script not found"
fi

# Remove Z.AI configuration
if [ -d "$HOME/.config/zai" ]; then
    rm -rf "$HOME/.config/zai"
    echo -e "${GREEN}[✓]${NC} Z.AI configuration removed"
else
    echo -e "${YELLOW}[!]${NC} Z.AI configuration not found"
fi

# Handle settings
if [ "$KEEP_SETTINGS" = true ]; then
    echo -e "${GREEN}[✓]${NC} Settings preserved at: $SETTINGS_FILE"
else
    if [ -d "$ZUPPACLAUDE_CONFIG_DIR" ]; then
        rm -rf "$ZUPPACLAUDE_CONFIG_DIR"
        echo -e "${GREEN}[✓]${NC} ZuppaClaude settings removed"
    fi
fi

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║   Uninstall complete!                                             ║"
echo "║   Restart Claude Code to apply changes.                           ║"
if [ "$KEEP_SETTINGS" = true ]; then
echo "║                                                                   ║"
echo "║   Settings preserved - reinstall will use your saved config.      ║"
fi
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
