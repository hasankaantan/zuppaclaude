/**
 * Claude-Z component installer
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

class ClaudeZInstaller {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.configDir = this.platform.zaiConfigDir;
    this.binPath = path.join(this.platform.localBin, this.platform.isWindows ? 'claude-z.cmd' : 'claude-z');
  }

  /**
   * Check if Claude-Z is installed
   */
  isInstalled() {
    return fs.existsSync(this.binPath);
  }

  /**
   * Install Claude-Z
   */
  async install(apiKey) {
    this.logger.step('Step 5/7: Installing Claude-Z (z.ai backend)');

    if (!apiKey) {
      this.logger.info('Skipping Claude-Z installation (no API key provided)');
      return false;
    }

    try {
      // Ensure directories exist
      this.platform.ensureDir(this.configDir);
      this.platform.ensureDir(this.platform.localBin);

      // Save API key
      const apiKeyPath = path.join(this.configDir, 'api_key');
      fs.writeFileSync(apiKeyPath, apiKey, 'utf8');
      fs.chmodSync(apiKeyPath, 0o600);
      this.logger.success('Z.AI API key saved');

      // Create claude-z script
      if (this.platform.isWindows) {
        await this.createWindowsScript();
      } else {
        await this.createUnixScript();
      }

      this.logger.success('Claude-Z installed');
      return true;
    } catch (error) {
      this.logger.error(`Failed to install Claude-Z: ${error.message}`);
      return false;
    }
  }

  /**
   * Create Unix claude-z script
   */
  async createUnixScript() {
    const script = `#!/bin/bash
#===============================================================================
#   Claude-Z - Claude Code with z.ai backend
#===============================================================================

ZAI_CONFIG_DIR="$HOME/.config/zai"
API_KEY_FILE="$ZAI_CONFIG_DIR/api_key"

# Banner
echo ""
echo -e "\\033[0;35m╔═══════════════════════════════════════════════════════════════════╗\\033[0m"
echo -e "\\033[0;35m║   🚀 Claude-Z - Claude Code with z.ai backend                     ║\\033[0m"
echo -e "\\033[0;35m╚═══════════════════════════════════════════════════════════════════╝\\033[0m"
echo ""

# Check for API key
if [ ! -f "$API_KEY_FILE" ]; then
    echo -e "\\033[0;31m[✗] Z.AI API key not found\\033[0m"
    echo "Run the installer again to configure Claude-Z"
    exit 1
fi

ZAI_API_KEY=$(cat "$API_KEY_FILE")

# Handle auth conflict - backup and remove claude.ai credentials
CLAUDE_AUTH_FILE="$HOME/.claude/.credentials.json"
CLAUDE_AUTH_BACKUP="$HOME/.claude/.credentials.json.bak"

if [ -f "$CLAUDE_AUTH_FILE" ]; then
    echo -e "\\033[0;33m[!]\\033[0m Temporarily disabling claude.ai session for z.ai..."
    mv "$CLAUDE_AUTH_FILE" "$CLAUDE_AUTH_BACKUP"
fi

# Export environment for z.ai
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_API_KEY="$ZAI_API_KEY"

echo -e "\\033[0;32m[✓]\\033[0m Using z.ai backend"
echo -e "\\033[0;34m[i]\\033[0m Starting Claude Code..."
echo ""

# Run claude and restore credentials on exit
claude "$@"
EXIT_CODE=$?

# Restore claude.ai credentials
if [ -f "$CLAUDE_AUTH_BACKUP" ]; then
    mv "$CLAUDE_AUTH_BACKUP" "$CLAUDE_AUTH_FILE"
    echo -e "\\033[0;32m[✓]\\033[0m claude.ai session restored"
fi

exit $EXIT_CODE
`;

    fs.writeFileSync(this.binPath, script, 'utf8');
    fs.chmodSync(this.binPath, 0o755);
  }

  /**
   * Create Windows claude-z script
   */
  async createWindowsScript() {
    const ps1Path = this.binPath.replace('.cmd', '.ps1');

    const ps1Script = `#===============================================================================
#   Claude-Z - Claude Code with z.ai backend
#===============================================================================

$ZAI_CONFIG_DIR = "$env:USERPROFILE\\.config\\zai"
$API_KEY_FILE = "$ZAI_CONFIG_DIR\\api_key"

# Banner
Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Magenta
Write-Host "   Claude-Z - Claude Code with z.ai backend" -ForegroundColor Magenta
Write-Host "=======================================================================" -ForegroundColor Magenta
Write-Host ""

# Check for API key
if (-not (Test-Path $API_KEY_FILE)) {
    Write-Host "[X] Z.AI API key not found" -ForegroundColor Red
    Write-Host "Run the installer again to configure Claude-Z"
    exit 1
}

$ZAI_API_KEY = Get-Content $API_KEY_FILE -Raw

# Set environment and run Claude
$env:ANTHROPIC_BASE_URL = "https://api.z.ai/api/anthropic"
$env:ANTHROPIC_API_KEY = $ZAI_API_KEY.Trim()

Write-Host "[OK] Using z.ai backend" -ForegroundColor Green
Write-Host "[i] Starting Claude Code..." -ForegroundColor Blue
Write-Host ""

& claude $args
`;

    const cmdScript = `@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0claude-z.ps1" %*
`;

    fs.writeFileSync(ps1Path, ps1Script, 'utf8');
    fs.writeFileSync(this.binPath, cmdScript, 'utf8');
  }

  /**
   * Uninstall Claude-Z
   */
  uninstall() {
    let success = true;

    // Remove script
    if (fs.existsSync(this.binPath)) {
      fs.unlinkSync(this.binPath);
      this.logger.success('Claude-Z script removed');
    }

    // Remove PS1 on Windows
    if (this.platform.isWindows) {
      const ps1Path = this.binPath.replace('.cmd', '.ps1');
      if (fs.existsSync(ps1Path)) {
        fs.unlinkSync(ps1Path);
      }
    }

    // Remove config
    if (fs.existsSync(this.configDir)) {
      fs.rmSync(this.configDir, { recursive: true });
      this.logger.success('Z.AI configuration removed');
    }

    return success;
  }

  /**
   * Verify installation
   */
  verify() {
    const apiKeyPath = path.join(this.configDir, 'api_key');

    if (this.isInstalled()) {
      this.logger.success('Claude-Z: Installed');
    } else {
      this.logger.warning('Claude-Z: Not installed');
      return false;
    }

    if (fs.existsSync(apiKeyPath)) {
      this.logger.success('Z.AI API Key: Configured');
      return true;
    } else {
      this.logger.warning('Z.AI API Key: Not configured');
      return false;
    }
  }
}

module.exports = { ClaudeZInstaller };
