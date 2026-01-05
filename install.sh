#!/bin/bash

#===============================================================================
#
#   ███████╗██╗   ██╗██████╗ ██████╗  █████╗  ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗
#   ╚══███╔╝██║   ██║██╔══██╗██╔══██╗██╔══██╗██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝
#     ███╔╝ ██║   ██║██████╔╝██████╔╝███████║██║     ██║     ███████║██║   ██║██║  ██║█████╗
#    ███╔╝  ██║   ██║██╔═══╝ ██╔═══╝ ██╔══██║██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝
#   ███████╗╚██████╔╝██║     ██║     ██║  ██║╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗
#   ╚══════╝ ╚═════╝ ╚═╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
#
#   Claude Code Power-Up Installer
#   SuperClaude + Spec Kit + Custom Configuration
#
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Config
CLAUDE_DIR="$HOME/.claude"
COMMANDS_DIR="$CLAUDE_DIR/commands"
ZAI_CONFIG_DIR="$HOME/.config/zai"
ZUPPACLAUDE_CONFIG_DIR="$HOME/.config/zuppaclaude"
SETTINGS_FILE="$ZUPPACLAUDE_CONFIG_DIR/zc-settings.json"
SETTINGS_VERSION="1.0"
SUPERCLAUDE_REPO="https://github.com/SuperClaude-Org/SuperClaude_Framework.git"
ZUPPACLAUDE_REPO="https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main"

# Global flags
INSTALL_CLAUDE_Z=false
INSTALL_CLAUDE_HUD=false
ZAI_API_KEY=""
NPM_USE_SUDO=false
HAS_EXISTING_SETTINGS=false

#===============================================================================
# Helper Functions
#===============================================================================

#===============================================================================
# Settings Management
#===============================================================================

# Encode string to base64 (for API keys)
encode_base64() {
    echo -n "$1" | base64
}

# Decode base64 string
decode_base64() {
    echo -n "$1" | base64 -d 2>/dev/null || echo "$1"
}

# Check if settings file exists
has_existing_settings() {
    [ -f "$SETTINGS_FILE" ]
}

# Load settings from JSON file
load_settings() {
    if ! has_existing_settings; then
        return 1
    fi

    log_info "Found existing settings: $SETTINGS_FILE"

    # Parse settings using basic tools (no jq dependency)
    if command_exists python3; then
        # Use Python for reliable JSON parsing
        local settings
        settings=$(python3 -c "
import json
import sys
try:
    with open('$SETTINGS_FILE', 'r') as f:
        s = json.load(f)
    c = s.get('components', {})
    print('INSTALL_CLAUDE_Z=' + ('true' if c.get('claude_z', {}).get('installed') else 'false'))
    print('INSTALL_CLAUDE_HUD=' + ('true' if c.get('claude_hud', {}).get('installed') else 'false'))
    api_key = c.get('claude_z', {}).get('api_key_encoded', '')
    if api_key:
        import base64
        try:
            print('ZAI_API_KEY=' + base64.b64decode(api_key).decode())
        except:
            print('ZAI_API_KEY=')
    else:
        print('ZAI_API_KEY=')
except Exception as e:
    print('# Error: ' + str(e), file=sys.stderr)
    sys.exit(1)
" 2>/dev/null)

        if [ $? -eq 0 ]; then
            eval "$settings"
            HAS_EXISTING_SETTINGS=true
            return 0
        fi
    fi

    # Fallback: Use grep for basic parsing
    if grep -q '"claude_z"' "$SETTINGS_FILE" 2>/dev/null; then
        if grep -q '"installed": true' "$SETTINGS_FILE" 2>/dev/null; then
            INSTALL_CLAUDE_Z=true
        fi
    fi
    if grep -q '"claude_hud"' "$SETTINGS_FILE" 2>/dev/null; then
        INSTALL_CLAUDE_HUD=true
    fi

    HAS_EXISTING_SETTINGS=true
    return 0
}

# Save settings to JSON file
save_settings() {
    mkdir -p "$ZUPPACLAUDE_CONFIG_DIR"

    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local created_at="$timestamp"
    if [ -f "$SETTINGS_FILE" ] && command_exists python3; then
        created_at=$(python3 -c "
import json
try:
    with open('$SETTINGS_FILE', 'r') as f:
        print(json.load(f).get('created', '$timestamp'))
except:
    print('$timestamp')
" 2>/dev/null) || created_at="$timestamp"
    fi

    # Encode API key
    local api_key_encoded=""
    if [ -n "$ZAI_API_KEY" ]; then
        api_key_encoded=$(encode_base64 "$ZAI_API_KEY")
    fi

    # Create JSON settings file
    cat > "$SETTINGS_FILE" << SETTINGSEOF
{
  "version": "$SETTINGS_VERSION",
  "created": "$created_at",
  "updated": "$timestamp",
  "components": {
    "superclaude": {
      "installed": true,
      "path": "$COMMANDS_DIR/sc"
    },
    "speckit": {
      "installed": true
    },
    "claude_z": {
      "installed": $INSTALL_CLAUDE_Z,
      "api_key_encoded": "$api_key_encoded",
      "config_dir": "$ZAI_CONFIG_DIR"
    },
    "claude_hud": {
      "installed": $INSTALL_CLAUDE_HUD
    }
  },
  "preferences": {
    "auto_update_check": true,
    "backup_configs": true
  }
}
SETTINGSEOF

    chmod 600 "$SETTINGS_FILE"
    log_success "Settings saved to $SETTINGS_FILE"
}

# Display current settings
show_settings() {
    if ! has_existing_settings; then
        log_info "No existing settings found"
        return 1
    fi

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Existing ZuppaClaude Settings${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    if command_exists python3; then
        python3 -c "
import json
try:
    with open('$SETTINGS_FILE', 'r') as f:
        s = json.load(f)
    c = s.get('components', {})
    print('  Version: ' + s.get('version', 'unknown'))
    print('  Last updated: ' + s.get('updated', 'unknown'))
    print('')
    print('  Components:')
    print('    • SuperClaude: ' + ('Yes' if c.get('superclaude', {}).get('installed') else 'No'))
    print('    • Spec Kit: ' + ('Yes' if c.get('speckit', {}).get('installed') else 'No'))
    print('    • Claude-Z: ' + ('Yes' if c.get('claude_z', {}).get('installed') else 'No'))
    print('    • Claude HUD: ' + ('Yes' if c.get('claude_hud', {}).get('installed') else 'No'))
except Exception as e:
    print('  Error reading settings: ' + str(e))
" 2>/dev/null
    else
        echo "  Settings file: $SETTINGS_FILE"
        echo "  (Install python3 for detailed view)"
    fi
    echo ""
}

print_banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║   ███████╗██╗   ██╗██████╗ ██████╗  █████╗                        ║"
    echo "║   ╚══███╔╝██║   ██║██╔══██╗██╔══██╗██╔══██╗                       ║"
    echo "║     ███╔╝ ██║   ██║██████╔╝██████╔╝███████║                       ║"
    echo "║    ███╔╝  ██║   ██║██╔═══╝ ██╔═══╝ ██╔══██║                       ║"
    echo "║   ███████╗╚██████╔╝██║     ██║     ██║  ██║                       ║"
    echo "║   ╚══════╝ ╚═════╝ ╚═╝     ╚═╝     ╚═╝  ╚═╝  CLAUDE              ║"
    echo "║                                                                   ║"
    echo "║   Claude Code Power-Up Installer                                  ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_step() {
    echo -e "\n${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}\n"
}

# Check home directory write permissions
check_home_permissions() {
    if [ ! -w "$HOME" ]; then
        log_error "Cannot write to home directory: $HOME"
        echo ""
        echo -e "${YELLOW}Your home directory is not writable.${NC}"
        echo -e "${YELLOW}This is required for ZuppaClaude installation.${NC}"
        echo ""
        echo -e "Check permissions with: ${CYAN}ls -la $HOME${NC}"
        echo -e "Fix with: ${CYAN}sudo chown -R \$(id -u):\$(id -g) $HOME${NC}"
        echo ""
        return 1
    fi

    # Check if .claude directory exists and is writable
    if [ -d "$CLAUDE_DIR" ] && [ ! -w "$CLAUDE_DIR" ]; then
        log_warning "$CLAUDE_DIR exists but is not writable"
        echo -n "Fix permissions? [Y/n] "
        read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="y"
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            if sudo chown -R "$(id -u):$(id -g)" "$CLAUDE_DIR" 2>/dev/null; then
                log_success "$CLAUDE_DIR permissions fixed"
            else
                log_error "Failed to fix permissions. Run manually:"
                echo -e "  ${CYAN}sudo chown -R \$(id -u):\$(id -g) \"$CLAUDE_DIR\"${NC}"
                return 1
            fi
        fi
    fi
    return 0
}

# Check and fix npm permissions (cache and global prefix)
check_npm_permissions() {
    if ! command_exists npm; then
        return 0
    fi

    local needs_sudo=false

    # Get npm cache directory
    local npm_cache
    npm_cache=$(npm config get cache 2>/dev/null) || npm_cache=""

    # Get npm global prefix
    local npm_prefix
    npm_prefix=$(npm config get prefix 2>/dev/null) || npm_prefix=""

    # Check cache for root-owned files
    if [ -n "$npm_cache" ] && [ -d "$npm_cache" ]; then
        local cache_root_files
        cache_root_files=$(find "$npm_cache" -user 0 2>/dev/null | head -1) || true
        if [ -n "$cache_root_files" ]; then
            log_warning "npm cache contains root-owned files"
            log_info "Cache: $npm_cache"
            needs_sudo=true
        fi
    fi

    # Check if global prefix requires sudo
    if [ -n "$npm_prefix" ] && [ -d "$npm_prefix/lib/node_modules" ]; then
        if [ ! -w "$npm_prefix/lib/node_modules" ]; then
            log_warning "npm global directory is not writable"
            log_info "Prefix: $npm_prefix"
            needs_sudo=true
        fi
    fi

    if [ "$needs_sudo" = true ]; then
        echo ""
        echo -e "${YELLOW}npm requires elevated permissions for global installs.${NC}"
        echo -e "${YELLOW}Options:${NC}"
        echo ""
        echo -e "  1. Use sudo for npm install (will be prompted)"
        echo -e "  2. Fix permissions: ${CYAN}sudo chown -R \$(id -u):\$(id -g) \"$npm_prefix\"${NC}"
        echo -e "  3. Use nvm to manage Node.js (recommended)"
        echo ""
        echo -n "Continue with sudo npm install? [Y/n] "
        read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="y"
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            NPM_USE_SUDO=true
        else
            log_warning "Skipping - Claude Code install may fail"
            NPM_USE_SUDO=false
        fi
    fi
    return 0
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

#===============================================================================
# Dependency Checks
#===============================================================================

check_dependencies() {
    log_step "Step 1/7: Checking Dependencies"

    # Check home directory permissions first
    check_home_permissions || exit 1

    local missing_deps=()
    local optional_missing=()

    # Required: Check OS
    case "$(uname -s)" in
        Darwin)
            log_success "macOS detected"
            ;;
        Linux)
            log_success "Linux detected"
            ;;
        *)
            log_error "Unsupported OS: $(uname -s)"
            exit 1
            ;;
    esac

    # Required: curl or wget
    if command_exists curl; then
        log_success "curl found"
    elif command_exists wget; then
        log_success "wget found"
    else
        missing_deps+=("curl")
    fi

    # Required: git
    if command_exists git; then
        log_success "git found: $(git --version | head -1)"
    else
        missing_deps+=("git")
    fi

    # Required: Python 3
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
        log_success "Python found: $PYTHON_VERSION"

        # Check Python version >= 3.8
        PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
        PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)
        if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
            log_warning "Python 3.8+ recommended (found $PYTHON_VERSION)"
        fi
    else
        missing_deps+=("python3")
    fi

    # Check for uv (preferred) or pip
    if command_exists uv; then
        log_success "uv found: $(uv --version 2>&1 | head -1)"
        PACKAGE_MANAGER="uv"
    elif command_exists pipx; then
        log_success "pipx found"
        PACKAGE_MANAGER="pipx"
    elif command_exists pip3; then
        log_success "pip3 found"
        PACKAGE_MANAGER="pip3"
    elif command_exists pip; then
        log_success "pip found"
        PACKAGE_MANAGER="pip"
    else
        optional_missing+=("uv or pip")
    fi

    # Check for Claude Code
    if command_exists claude; then
        CLAUDE_VERSION=$(claude --version 2>/dev/null | head -1 || echo "unknown")
        log_success "Claude Code found: $CLAUDE_VERSION"
        # Offer to update
        if command_exists npm; then
            echo -n "Update Claude Code to latest? [y/N] "
            read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="n"
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                check_npm_permissions
                log_info "Updating Claude Code..."
                if [ "$NPM_USE_SUDO" = true ]; then
                    sudo npm update -g @anthropic-ai/claude-code && log_success "Claude Code updated" || log_warning "Update failed, continuing..."
                else
                    npm update -g @anthropic-ai/claude-code && log_success "Claude Code updated" || log_warning "Update failed, continuing..."
                fi
            fi
        fi
    else
        log_warning "Claude Code not found"
        # Try to install Claude Code
        if command_exists npm; then
            # Check npm permissions before install
            check_npm_permissions
            echo -n "Install Claude Code via npm? [Y/n] "
            read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="y"
            echo
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                log_info "Installing Claude Code..."
                local npm_cmd="npm"
                if [ "$NPM_USE_SUDO" = true ]; then
                    npm_cmd="sudo npm"
                fi
                if $npm_cmd install -g @anthropic-ai/claude-code 2>&1; then
                    log_success "Claude Code installed"
                else
                    log_error "Failed to install Claude Code"
                    echo ""
                    echo -e "${YELLOW}Troubleshooting tips:${NC}"
                    echo -e "  1. Check npm cache permissions: ${CYAN}npm cache verify${NC}"
                    echo -e "  2. Try with sudo: ${CYAN}sudo npm install -g @anthropic-ai/claude-code${NC}"
                    echo -e "  3. Use npx instead: ${CYAN}npx @anthropic-ai/claude-code${NC}"
                    echo ""
                fi
            fi
        else
            log_info "Install manually: https://claude.com/code"
        fi
    fi

    # Check for Node.js/npm
    if command_exists npm; then
        log_success "npm found: $(npm --version)"
    else
        log_warning "npm not found - Claude Code auto-install unavailable"
    fi

    # Check for Homebrew (macOS)
    if [ "$(uname -s)" = "Darwin" ]; then
        if command_exists brew; then
            log_success "Homebrew found"
        else
            log_warning "Homebrew not found - some auto-installs may fail"
        fi
    fi

    # Report missing dependencies
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo ""
        log_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo -e "  ${RED}•${NC} $dep"
        done
        echo ""

        # Try to install missing deps
        if [ "$(uname -s)" = "Darwin" ] && command_exists brew; then
            echo -n "Install missing dependencies with Homebrew? [Y/n] "
            read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="y"
            echo
            if [[ $REPLY =~ ^[Nn]$ ]]; then
                log_error "Please install missing dependencies and run again."
                exit 1
            fi
            for dep in "${missing_deps[@]}"; do
                log_info "Installing $dep..."
                brew install "$dep" || log_error "Failed to install $dep"
            done
        else
            log_error "Please install missing dependencies and run again."
            exit 1
        fi
    fi

    # Install uv if no package manager found
    if [ ${#optional_missing[@]} -gt 0 ]; then
        log_warning "No Python package manager found. Installing uv..."
        curl -LsSf https://astral.sh/uv/install.sh | sh

        # Source uv environment if available
        if [ -f "$HOME/.local/bin/env" ]; then
            # shellcheck source=/dev/null
            source "$HOME/.local/bin/env"
        fi
        export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

        if command_exists uv; then
            log_success "uv installed successfully"
            PACKAGE_MANAGER="uv"
        else
            log_error "uv installed but not found in PATH"
            echo ""
            echo -e "${YELLOW}uv was installed to ~/.local/bin but PATH wasn't updated.${NC}"
            echo -e "${YELLOW}Run the following and try again:${NC}"
            echo ""
            echo -e "  ${CYAN}source ~/.local/bin/env${NC}"
            echo ""
            exit 1
        fi
    fi

    log_success "All dependencies satisfied!"
}

#===============================================================================
# Install SuperClaude
#===============================================================================

install_superclaude() {
    log_step "Step 2/7: Installing SuperClaude Framework"

    # Create directories
    mkdir -p "$COMMANDS_DIR"

    # Check if already installed
    if [ -d "$COMMANDS_DIR/sc" ]; then
        log_warning "SuperClaude already installed. Updating..."
        rm -rf "$COMMANDS_DIR/sc"
    fi

    # Clone SuperClaude
    log_info "Cloning SuperClaude Framework..."
    TEMP_DIR=$(mktemp -d)
    git clone --depth 1 "$SUPERCLAUDE_REPO" "$TEMP_DIR/superclaude" 2>/dev/null || {
        log_error "Failed to clone SuperClaude. Trying alternative method..."
        # Alternative: Download from release
        curl -sL "https://github.com/SuperClaude-Org/SuperClaude_Framework/archive/refs/heads/master.zip" -o "$TEMP_DIR/sc.zip"
        unzip -q "$TEMP_DIR/sc.zip" -d "$TEMP_DIR"
        mv "$TEMP_DIR/SuperClaude_Framework-master" "$TEMP_DIR/superclaude"
    }

    # Find and copy commands
    if [ -d "$TEMP_DIR/superclaude/src/superclaude/commands" ]; then
        cp -r "$TEMP_DIR/superclaude/src/superclaude/commands" "$COMMANDS_DIR/sc"
    elif [ -d "$TEMP_DIR/superclaude/commands" ]; then
        cp -r "$TEMP_DIR/superclaude/commands" "$COMMANDS_DIR/sc"
    else
        # Fallback: copy from our backup
        log_warning "Using bundled SuperClaude commands..."
        mkdir -p "$COMMANDS_DIR/sc"
        curl -sL "$ZUPPACLAUDE_REPO/commands/sc.tar.gz" | tar -xzf - -C "$COMMANDS_DIR/sc" 2>/dev/null || {
            log_error "Failed to download SuperClaude commands"
            exit 1
        }
    fi

    # Cleanup
    rm -rf "$TEMP_DIR"

    # Count installed commands
    CMD_COUNT=$(find "$COMMANDS_DIR/sc" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    log_success "SuperClaude installed: $CMD_COUNT commands"
}

#===============================================================================
# Install Spec Kit
#===============================================================================

install_speckit() {
    log_step "Step 3/7: Installing Spec Kit (specify-cli)"

    case "$PACKAGE_MANAGER" in
        uv)
            log_info "Installing with uv..."
            uv tool install specify-cli 2>/dev/null || uv pip install specify-cli --system 2>/dev/null || {
                log_warning "uv tool install failed, trying pip..."
                pip3 install specify-cli --user 2>/dev/null || pip install specify-cli --user
            }
            ;;
        pipx)
            log_info "Installing with pipx..."
            pipx install specify-cli
            ;;
        pip3|pip)
            log_info "Installing with $PACKAGE_MANAGER..."
            $PACKAGE_MANAGER install specify-cli --user
            ;;
    esac

    # Verify installation
    if command_exists specify; then
        log_success "Spec Kit installed: $(specify --version 2>&1 | head -1)"
    else
        # Add common paths
        export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
        if command_exists specify; then
            log_success "Spec Kit installed (added to PATH)"
        else
            log_warning "Spec Kit installed but 'specify' not in PATH"
            log_info "Add to your shell config: export PATH=\"\$HOME/.local/bin:\$PATH\""
        fi
    fi
}

#===============================================================================
# Install CLAUDE.md Configuration
#===============================================================================

install_config() {
    log_step "Step 4/7: Installing Configuration"

    CLAUDE_MD="$CLAUDE_DIR/CLAUDE.md"

    # Backup existing config
    if [ -f "$CLAUDE_MD" ]; then
        BACKUP_FILE="$CLAUDE_DIR/CLAUDE.md.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$CLAUDE_MD" "$BACKUP_FILE"
        log_info "Existing config backed up to: $BACKUP_FILE"
    fi

    # Download or create CLAUDE.md
    log_info "Installing CLAUDE.md configuration..."

    curl -sL "$ZUPPACLAUDE_REPO/CLAUDE.md" -o "$CLAUDE_MD" 2>/dev/null || {
        # Fallback: Create default config
        cat > "$CLAUDE_MD" << 'CLAUDEMD'
# Claude Code - Enhanced System Instructions

## General Behavior
- Be proactive: After analysis ask "Should I implement?" or "Let's start?"
- Provide summary report when done (commit hash, changes, line count)
- Don't ask open-ended questions, suggest the best option

## SuperClaude Framework (Active)
SuperClaude slash commands are loaded. Use them proactively:

### Planning & Design
- `/sc:brainstorm` - Idea development and brainstorming
- `/sc:design` - Architectural design
- `/sc:estimate` - Time/resource estimation
- `/sc:spec-panel` - Specification panel

### Development
- `/sc:implement` - Code implementation
- `/sc:build` - Build and compile
- `/sc:improve` - Code improvement
- `/sc:explain` - Code explanation

### Testing & Quality
- `/sc:test` - Test creation
- `/sc:analyze` - Code analysis
- `/sc:troubleshoot` - Debugging
- `/sc:reflect` - Retrospective

### Documentation
- `/sc:document` - Documentation creation
- `/sc:help` - Command help

### Research
- `/sc:research` - Deep web research
- `/sc:business-panel` - Business analysis

### Project Management
- `/sc:task` - Task management
- `/sc:workflow` - Workflow
- `/sc:pm` - Project management

## Spec Kit (Active)
Spec-driven development with `specify` CLI:

```bash
specify init         # Initialize project
specify constitution # Project rules
specify spec         # Functional requirements
specify plan         # Technical implementation plan
specify tasks        # Task breakdown
```

## Response Format
- Short and concise answers
- Use Markdown formatting
- Specify language for code blocks
- Status: ✅ success, ❌ error, ⚠️ warning
CLAUDEMD
    }

    log_success "Configuration installed: $CLAUDE_MD"
}

#===============================================================================
# Install Claude-Z (z.ai backend)
#===============================================================================

install_claude_z() {
    log_step "Step 5/7: Installing Claude-Z (z.ai backend)"

    if [ "$INSTALL_CLAUDE_Z" = false ]; then
        log_info "Skipping Claude-Z installation (no API key provided)"
        return
    fi

    # Create directories
    mkdir -p "$ZAI_CONFIG_DIR"
    mkdir -p "$HOME/.local/bin"

    # Save API key
    echo "$ZAI_API_KEY" > "$ZAI_CONFIG_DIR/api_key"
    chmod 600 "$ZAI_CONFIG_DIR/api_key"
    log_success "API key saved to $ZAI_CONFIG_DIR/api_key"

    # Create MCP servers config
    cat > "$ZAI_CONFIG_DIR/mcp-servers.json" << MCPEOF
{
  "mcpServers": {
    "web-search-prime": {
      "type": "http",
      "url": "https://api.z.ai/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer $ZAI_API_KEY"
      }
    },
    "web-reader": {
      "type": "http",
      "url": "https://api.z.ai/api/mcp/web_reader/mcp",
      "headers": {
        "Authorization": "Bearer $ZAI_API_KEY"
      }
    },
    "zread": {
      "type": "http",
      "url": "https://api.z.ai/api/mcp/zread/mcp",
      "headers": {
        "Authorization": "Bearer $ZAI_API_KEY"
      }
    },
    "zai-mcp-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@z_ai/mcp-server"],
      "env": {
        "Z_AI_API_KEY": "$ZAI_API_KEY",
        "Z_AI_MODE": "ZAI"
      }
    }
  }
}
MCPEOF
    log_success "MCP servers config created"

    # Create claude-z script
    cat > "$HOME/.local/bin/claude-z" << 'CLAUDEZEOF'
#!/bin/bash
# claude-z - Claude Code with z.ai backend + MCP servers

# Colors
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for API key
if [ -z "$ZAI_API_KEY" ]; then
  if [ -f ~/.config/zai/api_key ]; then
    export ZAI_API_KEY=$(cat ~/.config/zai/api_key)
  else
    echo -e "${PURPLE}❌ ZAI_API_KEY not set${NC}"
    echo "Set: export ZAI_API_KEY='your-api-key'"
    exit 1
  fi
fi

# Show claude-z banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗            ║"
echo "║  ██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝            ║"
echo "║  ██║     ██║     ███████║██║   ██║██║  ██║█████╗              ║"
echo "║  ██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝              ║"
echo "║  ╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗            ║"
echo "║   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝  ${CYAN}Z${PURPLE}        ║"
echo "║                                                               ║"
echo -e "║   ${CYAN}z.ai Backend${PURPLE} · ${YELLOW}MCP Servers Enabled${PURPLE}                       ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Set z.ai environment
export ANTHROPIC_AUTH_TOKEN="$ZAI_API_KEY"
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export API_TIMEOUT_MS="3000000"

# Run Claude Code with z.ai MCP servers
exec claude --mcp-config ~/.config/zai/mcp-servers.json "$@"
CLAUDEZEOF

    chmod +x "$HOME/.local/bin/claude-z"
    log_success "claude-z command installed to ~/.local/bin/claude-z"

    # Add to PATH hint
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        log_info "Add to your shell config: export PATH=\"\$HOME/.local/bin:\$PATH\""
    fi
}

#===============================================================================
# Install Claude HUD (Status Display Plugin)
#===============================================================================

install_claude_hud() {
    log_step "Step 6/7: Installing Claude HUD (Status Display)"

    if [ "$INSTALL_CLAUDE_HUD" = false ]; then
        log_info "Skipping Claude HUD installation"
        return
    fi

    # Check Claude Code version
    if ! command_exists claude; then
        log_warning "Claude Code not found - Claude HUD requires Claude Code"
        log_info "Install Claude Code first, then run: claude /plugin install claude-hud"
        return
    fi

    # Check Claude Code version >= 1.0.80
    local claude_version
    claude_version=$(claude --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    if [ -n "$claude_version" ]; then
        local major minor patch
        major=$(echo "$claude_version" | cut -d. -f1)
        minor=$(echo "$claude_version" | cut -d. -f2)
        patch=$(echo "$claude_version" | cut -d. -f3)

        # Check if version >= 1.0.80
        if [ "$major" -lt 1 ] || ([ "$major" -eq 1 ] && [ "$minor" -eq 0 ] && [ "$patch" -lt 80 ]); then
            log_warning "Claude Code version $claude_version detected"
            log_warning "Claude HUD requires Claude Code v1.0.80 or later"
            log_info "Update with: npm update -g @anthropic-ai/claude-code"
            return
        fi
    fi

    log_info "Installing Claude HUD plugin..."
    log_info "This will add a status display showing context usage, tools, and progress"
    echo ""

    # Install via Claude Code plugin system
    # Note: This creates a setup script that user runs inside Claude Code
    local hud_setup_script="$HOME/.local/bin/setup-claude-hud"
    mkdir -p "$HOME/.local/bin"

    cat > "$hud_setup_script" << 'HUDEOF'
#!/bin/bash
# Claude HUD Setup Script
# Run this script, then execute the commands inside Claude Code

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║   Claude HUD Setup                                                ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Run these commands inside Claude Code to install Claude HUD:"
echo ""
echo "  1. /plugin marketplace add jarrodwatts/claude-hud"
echo "  2. /plugin install claude-hud"
echo "  3. /claude-hud:setup"
echo ""
echo "Claude HUD provides:"
echo "  • Real-time context usage meter"
echo "  • Active tool tracking"
echo "  • Running agent status"
echo "  • Todo progress display"
echo ""
HUDEOF

    chmod +x "$hud_setup_script"

    log_success "Claude HUD setup script created"
    log_info "After installation, run: setup-claude-hud"
    log_info "Then follow the instructions to complete setup inside Claude Code"
}

#===============================================================================
# Verify Installation
#===============================================================================

verify_installation() {
    log_step "Step 7/7: Verifying Installation"

    # Refresh PATH to find newly installed commands
    export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

    # Also check common npm global locations
    if command_exists npm; then
        local npm_bin
        npm_bin=$(npm config get prefix 2>/dev/null)/bin
        if [ -d "$npm_bin" ]; then
            export PATH="$npm_bin:$PATH"
        fi
    fi

    local all_good=true

    # Check SuperClaude
    if [ -d "$COMMANDS_DIR/sc" ]; then
        CMD_COUNT=$(find "$COMMANDS_DIR/sc" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$CMD_COUNT" -gt 0 ]; then
            log_success "SuperClaude: $CMD_COUNT commands installed"
        else
            log_error "SuperClaude: No commands found"
            all_good=false
        fi
    else
        log_error "SuperClaude: Not installed"
        all_good=false
    fi

    # Check Spec Kit
    if command_exists specify; then
        log_success "Spec Kit: $(specify --version 2>&1 | head -1 || echo 'installed')"
    else
        log_warning "Spec Kit: Not in PATH (may need shell restart)"
    fi

    # Check CLAUDE.md
    if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
        log_success "Configuration: CLAUDE.md installed"
    else
        log_error "Configuration: CLAUDE.md not found"
        all_good=false
    fi

    # Check Claude Code
    local claude_found=false
    if command_exists claude; then
        log_success "Claude Code: Ready"
        claude_found=true
    else
        # Check npm global bin directly
        local npm_bin
        npm_bin=$(npm config get prefix 2>/dev/null)/bin/claude
        if [ -x "$npm_bin" ]; then
            log_success "Claude Code: Installed (add npm bin to PATH)"
            claude_found=true
        else
            log_warning "Claude Code: Not installed"
        fi
    fi

    # Check Claude-Z
    local claudez_needs_path=false
    if [ "$INSTALL_CLAUDE_Z" = true ]; then
        if [ -f "$HOME/.local/bin/claude-z" ]; then
            if command_exists claude-z; then
                log_success "Claude-Z: Ready"
            else
                log_success "Claude-Z: Installed (add ~/.local/bin to PATH)"
                claudez_needs_path=true
            fi
        else
            log_error "Claude-Z: Not installed"
            all_good=false
        fi
        if [ -f "$ZAI_CONFIG_DIR/api_key" ]; then
            log_success "Z.AI API Key: Configured"
        else
            log_error "Z.AI API Key: Not configured"
            all_good=false
        fi
    fi

    # Check Claude HUD
    if [ "$INSTALL_CLAUDE_HUD" = true ]; then
        if [ -f "$HOME/.local/bin/setup-claude-hud" ]; then
            log_success "Claude HUD: Setup script ready"
            log_info "Run 'setup-claude-hud' for installation instructions"
        else
            log_warning "Claude HUD: Setup script not found"
        fi
    fi

    echo ""

    if [ "$all_good" = true ]; then
        echo -e "${GREEN}"
        echo "╔═══════════════════════════════════════════════════════════════════╗"
        echo "║                                                                   ║"
        echo "║   ✅ INSTALLATION COMPLETE!                                       ║"
        echo "║                                                                   ║"
        echo "║   Restart Claude Code to activate all features.                   ║"
        echo "║                                                                   ║"
        echo "║   Quick Start:                                                    ║"
        echo "║   • Type /sc:help in Claude Code to see all commands              ║"
        echo "║   • Run 'specify --help' for Spec Kit commands                    ║"
        if [ "$INSTALL_CLAUDE_Z" = true ]; then
        echo "║   • Run 'claude-z' to use Claude with z.ai backend                ║"
        fi
        if [ "$INSTALL_CLAUDE_HUD" = true ]; then
        echo "║   • Run 'setup-claude-hud' for HUD installation steps             ║"
        fi
        echo "║                                                                   ║"
        echo "╚═══════════════════════════════════════════════════════════════════╝"
        echo -e "${NC}"

        # Show PATH setup instructions if needed
        if [ "$claudez_needs_path" = true ] || ! command_exists claude; then
            echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${YELLOW}  PATH Setup Required${NC}"
            echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo "  Add this to your ~/.bashrc or ~/.zshrc:"
            echo ""
            echo -e "  ${CYAN}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
            if command_exists npm; then
                local npm_prefix
                npm_prefix=$(npm config get prefix 2>/dev/null)
                if [ -n "$npm_prefix" ] && [ -d "$npm_prefix/bin" ]; then
                    echo -e "  ${CYAN}export PATH=\"$npm_prefix/bin:\$PATH\"${NC}"
                fi
            fi
            echo ""
            echo "  Then run: ${CYAN}source ~/.bashrc${NC}"
            echo ""
        fi
    else
        echo -e "${YELLOW}"
        echo "╔═══════════════════════════════════════════════════════════════════╗"
        echo "║   ⚠️  Installation completed with warnings                         ║"
        echo "║   Please check the messages above and fix any issues.             ║"
        echo "╚═══════════════════════════════════════════════════════════════════╝"
        echo -e "${NC}"
    fi
}

#===============================================================================
# Main
#===============================================================================

main() {
    print_banner

    echo -e "${CYAN}This script will install:${NC}"
    echo "  • SuperClaude Framework (30+ slash commands)"
    echo "  • Spec Kit CLI (spec-driven development)"
    echo "  • Custom CLAUDE.md configuration"
    echo "  • Claude-Z (optional - z.ai backend)"
    echo "  • Claude HUD (optional - status display plugin)"
    echo ""

    # Ask to continue (read from /dev/tty to support curl | bash)
    echo -n "Continue with installation? [Y/n] "
    read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="y"
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "Installation cancelled."
        exit 0
    fi

    # Ask about Claude-Z / z.ai
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Claude-Z Setup (Optional)${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Claude-Z allows you to use Claude Code with z.ai backend."
    echo "This provides additional MCP servers and features."
    echo ""
    echo -n "Do you want to install Claude-Z? [y/N] "
    read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="n"
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Enter your Z.AI API key (get it from https://z.ai):"
        echo -n "API Key: "
        read -s ZAI_API_KEY < /dev/tty 2>/dev/null || ZAI_API_KEY=""
        echo ""

        if [ -n "$ZAI_API_KEY" ]; then
            INSTALL_CLAUDE_Z=true
            log_success "Z.AI API key received"
        else
            log_warning "No API key provided, skipping Claude-Z"
            INSTALL_CLAUDE_Z=false
        fi
    else
        log_info "Skipping Claude-Z installation"
    fi

    # Ask about Claude HUD
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Claude HUD Setup (Optional)${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Claude HUD adds a real-time status display to Claude Code showing:"
    echo "  • Context window usage meter"
    echo "  • Active tools and file operations"
    echo "  • Running agents and their duration"
    echo "  • Todo/task progress"
    echo ""
    echo "Requires: Claude Code v1.0.80+, Node.js 18+"
    echo "Source: https://github.com/jarrodwatts/claude-hud"
    echo ""
    echo -n "Do you want to install Claude HUD? [y/N] "
    read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="n"
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        INSTALL_CLAUDE_HUD=true
        log_success "Claude HUD will be installed"
    else
        log_info "Skipping Claude HUD installation"
    fi

    check_dependencies
    install_superclaude
    install_speckit
    install_config
    install_claude_z
    install_claude_hud
    verify_installation
}

# Run
main "$@"
