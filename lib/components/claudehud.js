/**
 * Claude HUD component installer
 * Auto-installs and configures the statusline HUD
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

const HUD_REPO = 'https://github.com/jarrodwatts/claude-hud.git';

class ClaudeHUDInstaller {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.hudDir = path.join(this.platform.claudeDir, 'plugins', 'claude-hud');
    this.settingsPath = path.join(this.platform.claudeDir, 'settings.json');
  }

  /**
   * Check if Claude HUD is installed
   */
  isInstalled() {
    const distPath = path.join(this.hudDir, 'dist', 'index.js');
    return fs.existsSync(distPath);
  }

  /**
   * Check if statusline is configured
   */
  isConfigured() {
    if (!fs.existsSync(this.settingsPath)) {
      return false;
    }
    try {
      const settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
      return settings.statusLine?.command?.includes('claude-hud');
    } catch {
      return false;
    }
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
   * Install Claude HUD
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

    // Check if git is available
    if (!this.platform.commandExists('git')) {
      this.logger.warning('Git not found, skipping Claude HUD');
      return false;
    }

    try {
      // Create plugins directory
      const pluginsDir = path.join(this.platform.claudeDir, 'plugins');
      this.platform.ensureDir(pluginsDir);

      // Clone or update repository
      if (fs.existsSync(this.hudDir)) {
        this.logger.info('Updating Claude HUD...');
        this.platform.exec(`cd "${this.hudDir}" && git pull`, { silent: true });
      } else {
        this.logger.info('Cloning Claude HUD...');
        this.platform.exec(`git clone "${HUD_REPO}" "${this.hudDir}"`, { silent: true });
      }

      // Install dependencies
      this.logger.info('Installing dependencies...');
      this.platform.exec(`cd "${this.hudDir}" && npm install --silent`, { silent: true });

      // Build
      this.logger.info('Building Claude HUD...');
      this.platform.exec(`cd "${this.hudDir}" && npm run build`, { silent: true });

      // Verify build
      const distPath = path.join(this.hudDir, 'dist', 'index.js');
      if (!fs.existsSync(distPath)) {
        throw new Error('Build failed - dist/index.js not found');
      }

      // Configure statusline
      this.configureStatusLine();

      this.logger.success('Claude HUD installed and activated');
      return true;
    } catch (error) {
      this.logger.error(`Failed to install Claude HUD: ${error.message}`);
      return false;
    }
  }

  /**
   * Configure statusline in settings.json
   */
  configureStatusLine() {
    let settings = {};

    // Load existing settings
    if (fs.existsSync(this.settingsPath)) {
      try {
        settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
      } catch {
        settings = {};
      }
    }

    // Configure statusLine
    const hudScript = path.join(this.hudDir, 'dist', 'index.js');
    settings.statusLine = {
      type: 'command',
      command: `node "${hudScript}"`,
      padding: 0
    };

    // Write settings
    fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    this.logger.success('Statusline configured in settings.json');
  }

  /**
   * Uninstall Claude HUD
   */
  uninstall() {
    let success = true;

    // Remove HUD directory
    if (fs.existsSync(this.hudDir)) {
      try {
        fs.rmSync(this.hudDir, { recursive: true });
        this.logger.success('Claude HUD removed');
      } catch (error) {
        this.logger.warning(`Could not remove HUD directory: ${error.message}`);
        success = false;
      }
    }

    // Remove statusline from settings
    if (fs.existsSync(this.settingsPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
        if (settings.statusLine?.command?.includes('claude-hud')) {
          delete settings.statusLine;
          fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2), 'utf8');
          this.logger.success('Statusline configuration removed');
        }
      } catch {
        // Ignore errors
      }
    }

    return success;
  }

  /**
   * Verify installation
   */
  verify() {
    if (this.isInstalled()) {
      this.logger.success('Claude HUD: Installed');
      if (this.isConfigured()) {
        this.logger.success('Statusline: Configured');
      } else {
        this.logger.warning('Statusline: Not configured');
      }
      return true;
    } else {
      this.logger.warning('Claude HUD: Not installed');
      return false;
    }
  }
}

module.exports = { ClaudeHUDInstaller };
