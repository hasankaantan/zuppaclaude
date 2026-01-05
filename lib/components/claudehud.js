/**
 * Claude HUD component installer
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

class ClaudeHUDInstaller {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.binPath = path.join(this.platform.localBin, this.platform.isWindows ? 'setup-claude-hud.cmd' : 'setup-claude-hud');
  }

  /**
   * Check if Claude HUD setup script is installed
   */
  isInstalled() {
    return fs.existsSync(this.binPath);
  }

  /**
   * Check Claude Code version
   */
  checkVersion() {
    if (!this.platform.commandExists('claude')) {
      return { ok: false, version: null, message: 'Claude Code not found' };
    }

    try {
      const output = this.platform.exec('claude --version', { silent: true });
      const match = output?.match(/(\d+)\.(\d+)\.(\d+)/);

      if (match) {
        const [, major, minor, patch] = match.map(Number);
        const version = `${major}.${minor}.${patch}`;

        // Check if version >= 1.0.80
        if (major < 1 || (major === 1 && minor === 0 && patch < 80)) {
          return { ok: false, version, message: `Version ${version} < 1.0.80` };
        }

        return { ok: true, version, message: null };
      }
    } catch {
      // Ignore errors
    }

    return { ok: true, version: 'unknown', message: null };
  }

  /**
   * Install Claude HUD setup script
   */
  async install() {
    this.logger.step('Step 6/7: Installing Claude HUD (Status Display)');

    // Check version
    const versionCheck = this.checkVersion();
    if (!versionCheck.ok) {
      this.logger.warning(versionCheck.message);
      if (versionCheck.version) {
        this.logger.info('Claude HUD requires Claude Code v1.0.80 or later');
        this.logger.info('Update with: npm update -g @anthropic-ai/claude-code');
      }
      return false;
    }

    try {
      this.platform.ensureDir(this.platform.localBin);

      if (this.platform.isWindows) {
        await this.createWindowsScript();
      } else {
        await this.createUnixScript();
      }

      this.logger.success('Claude HUD setup script created');

      // Show setup instructions directly
      console.log('');
      console.log('  \x1b[36m┌─────────────────────────────────────────────────────┐\x1b[0m');
      console.log('  \x1b[36m│\x1b[0m  Run these commands inside Claude Code:             \x1b[36m│\x1b[0m');
      console.log('  \x1b[36m│\x1b[0m                                                     \x1b[36m│\x1b[0m');
      console.log('  \x1b[36m│\x1b[0m  1. /plugin marketplace add jarrodwatts/claude-hud  \x1b[36m│\x1b[0m');
      console.log('  \x1b[36m│\x1b[0m  2. /plugin install claude-hud                      \x1b[36m│\x1b[0m');
      console.log('  \x1b[36m│\x1b[0m  3. /claude-hud:setup                               \x1b[36m│\x1b[0m');
      console.log('  \x1b[36m└─────────────────────────────────────────────────────┘\x1b[0m');
      console.log('');

      return true;
    } catch (error) {
      this.logger.error(`Failed to install Claude HUD: ${error.message}`);
      return false;
    }
  }

  /**
   * Create Unix setup script
   */
  async createUnixScript() {
    const script = `#!/bin/bash
# Claude HUD Setup Script
# Run this script, then execute the commands inside Claude Code

echo ""
echo -e "\\033[0;35m╔═══════════════════════════════════════════════════════════════════╗\\033[0m"
echo -e "\\033[0;35m║   Claude HUD Setup                                                ║\\033[0m"
echo -e "\\033[0;35m╚═══════════════════════════════════════════════════════════════════╝\\033[0m"
echo ""
echo "Run these commands inside Claude Code to install Claude HUD:"
echo ""
echo -e "  \\033[0;36m1. /plugin marketplace add jarrodwatts/claude-hud\\033[0m"
echo -e "  \\033[0;36m2. /plugin install claude-hud\\033[0m"
echo -e "  \\033[0;36m3. /claude-hud:setup\\033[0m"
echo ""
echo "Claude HUD provides:"
echo "  • Real-time context usage meter"
echo "  • Active tool tracking"
echo "  • Running agent status"
echo "  • Todo progress display"
echo ""
`;

    fs.writeFileSync(this.binPath, script, 'utf8');
    fs.chmodSync(this.binPath, 0o755);
  }

  /**
   * Create Windows setup script
   */
  async createWindowsScript() {
    const ps1Path = this.binPath.replace('.cmd', '.ps1');

    const ps1Script = `# Claude HUD Setup Script
# Run this script, then execute the commands inside Claude Code

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Magenta
Write-Host "   Claude HUD Setup" -ForegroundColor Magenta
Write-Host "=======================================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Run these commands inside Claude Code to install Claude HUD:"
Write-Host ""
Write-Host "  1. /plugin marketplace add jarrodwatts/claude-hud" -ForegroundColor Cyan
Write-Host "  2. /plugin install claude-hud" -ForegroundColor Cyan
Write-Host "  3. /claude-hud:setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "Claude HUD provides:"
Write-Host "  - Real-time context usage meter"
Write-Host "  - Active tool tracking"
Write-Host "  - Running agent status"
Write-Host "  - Todo progress display"
Write-Host ""
`;

    const cmdScript = `@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0setup-claude-hud.ps1" %*
`;

    fs.writeFileSync(ps1Path, ps1Script, 'utf8');
    fs.writeFileSync(this.binPath, cmdScript, 'utf8');
  }

  /**
   * Uninstall Claude HUD setup script
   */
  uninstall() {
    if (!this.isInstalled()) {
      this.logger.warning('Claude HUD setup script not found');
      return true;
    }

    try {
      fs.unlinkSync(this.binPath);

      if (this.platform.isWindows) {
        const ps1Path = this.binPath.replace('.cmd', '.ps1');
        if (fs.existsSync(ps1Path)) {
          fs.unlinkSync(ps1Path);
        }
      }

      this.logger.success('Claude HUD setup script removed');
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove Claude HUD: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify installation
   */
  verify() {
    if (this.isInstalled()) {
      this.logger.success('Claude HUD: Setup script ready');
      this.logger.info('Run \'setup-claude-hud\' for installation instructions');
      return true;
    } else {
      this.logger.warning('Claude HUD: Not installed');
      return false;
    }
  }
}

module.exports = { ClaudeHUDInstaller };
