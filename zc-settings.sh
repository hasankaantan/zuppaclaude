#!/bin/bash

#===============================================================================
#   ZuppaClaude Settings Manager
#   Export, Import, and Reset settings
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Config
ZUPPACLAUDE_CONFIG_DIR="$HOME/.config/zuppaclaude"
SETTINGS_FILE="$ZUPPACLAUDE_CONFIG_DIR/zc-settings.json"

log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_info() { echo -e "${BLUE}[i]${NC} $1"; }

show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║   ZuppaClaude Settings Manager                                    ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

show_usage() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  show              Display current settings"
    echo "  export <file>     Export settings to file"
    echo "  import <file>     Import settings from file"
    echo "  reset             Reset settings to default"
    echo "  path              Show settings file path"
    echo ""
    echo "Examples:"
    echo "  $0 show"
    echo "  $0 export ~/my-zc-settings.json"
    echo "  $0 import ~/backup/zc-settings.json"
    echo "  $0 reset"
    echo ""
}

cmd_show() {
    if [ ! -f "$SETTINGS_FILE" ]; then
        log_warning "No settings file found at: $SETTINGS_FILE"
        echo ""
        echo "Run the installer first to create settings."
        return 1
    fi

    echo ""
    echo -e "${CYAN}Settings file: $SETTINGS_FILE${NC}"
    echo ""

    if command -v python3 >/dev/null 2>&1; then
        python3 -c "
import json
with open('$SETTINGS_FILE', 'r') as f:
    s = json.load(f)
c = s.get('components', {})
print('Version:', s.get('version', 'unknown'))
print('Created:', s.get('created', 'unknown'))
print('Updated:', s.get('updated', 'unknown'))
print('')
print('Components:')
print('  SuperClaude:', 'Yes' if c.get('superclaude', {}).get('installed') else 'No')
print('  Spec Kit:', 'Yes' if c.get('speckit', {}).get('installed') else 'No')
print('  Claude-Z:', 'Yes' if c.get('claude_z', {}).get('installed') else 'No')
if c.get('claude_z', {}).get('api_key_encoded'):
    print('    API Key: [configured]')
print('  Claude HUD:', 'Yes' if c.get('claude_hud', {}).get('installed') else 'No')
print('')
p = s.get('preferences', {})
print('Preferences:')
print('  Auto-update check:', 'Yes' if p.get('auto_update_check') else 'No')
print('  Backup configs:', 'Yes' if p.get('backup_configs') else 'No')
" 2>/dev/null || cat "$SETTINGS_FILE"
    else
        cat "$SETTINGS_FILE"
    fi
    echo ""
}

cmd_export() {
    local export_file="$1"

    if [ -z "$export_file" ]; then
        log_error "Please specify export file path"
        echo "Usage: $0 export <file>"
        return 1
    fi

    if [ ! -f "$SETTINGS_FILE" ]; then
        log_error "No settings file found at: $SETTINGS_FILE"
        return 1
    fi

    # Create backup with metadata
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "
import json
import os
from datetime import datetime

with open('$SETTINGS_FILE', 'r') as f:
    settings = json.load(f)

# Add export metadata
settings['_export'] = {
    'exported_at': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
    'hostname': os.uname().nodename,
    'source_path': '$SETTINGS_FILE'
}

with open('$export_file', 'w') as f:
    json.dump(settings, f, indent=2)
" 2>/dev/null
    else
        cp "$SETTINGS_FILE" "$export_file"
    fi

    if [ -f "$export_file" ]; then
        log_success "Settings exported to: $export_file"
    else
        log_error "Failed to export settings"
        return 1
    fi
}

cmd_import() {
    local import_file="$1"

    if [ -z "$import_file" ]; then
        log_error "Please specify import file path"
        echo "Usage: $0 import <file>"
        return 1
    fi

    if [ ! -f "$import_file" ]; then
        log_error "Import file not found: $import_file"
        return 1
    fi

    # Validate JSON
    if command -v python3 >/dev/null 2>&1; then
        if ! python3 -c "import json; json.load(open('$import_file'))" 2>/dev/null; then
            log_error "Invalid JSON file: $import_file"
            return 1
        fi
    fi

    # Backup existing settings
    if [ -f "$SETTINGS_FILE" ]; then
        local backup="${SETTINGS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$SETTINGS_FILE" "$backup"
        log_info "Existing settings backed up to: $backup"
    fi

    # Create directory if needed
    mkdir -p "$ZUPPACLAUDE_CONFIG_DIR"

    # Import settings (remove export metadata)
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "
import json
from datetime import datetime

with open('$import_file', 'r') as f:
    settings = json.load(f)

# Remove export metadata
settings.pop('_export', None)

# Update timestamp
settings['updated'] = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

with open('$SETTINGS_FILE', 'w') as f:
    json.dump(settings, f, indent=2)
" 2>/dev/null
    else
        cp "$import_file" "$SETTINGS_FILE"
    fi

    chmod 600 "$SETTINGS_FILE"
    log_success "Settings imported from: $import_file"
    echo ""
    log_info "Run the installer again to apply imported settings"
}

cmd_reset() {
    if [ ! -f "$SETTINGS_FILE" ]; then
        log_warning "No settings file found"
        return 0
    fi

    echo -n "Are you sure you want to reset all settings? [y/N] "
    read -n 1 -r REPLY < /dev/tty 2>/dev/null || REPLY="n"
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Reset cancelled"
        return 0
    fi

    # Backup before reset
    local backup="${SETTINGS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$SETTINGS_FILE" "$backup"
    log_info "Settings backed up to: $backup"

    # Remove settings
    rm -f "$SETTINGS_FILE"
    log_success "Settings reset complete"
    echo ""
    log_info "Run the installer again to create new settings"
}

cmd_path() {
    echo "$SETTINGS_FILE"
}

# Main
show_banner

case "${1:-}" in
    show)
        cmd_show
        ;;
    export)
        cmd_export "$2"
        ;;
    import)
        cmd_import "$2"
        ;;
    reset)
        cmd_reset
        ;;
    path)
        cmd_path
        ;;
    -h|--help|help|"")
        show_usage
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
