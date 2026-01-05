/**
 * ZuppaClaude Commands Installer
 * Installs /zc:* slash commands for Claude Code
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

class CommandsInstaller {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.commandsDir = path.join(this.platform.claudeDir, 'commands', 'zc');
    this.sourceDir = path.join(__dirname, '..', '..', 'assets', 'commands', 'zc');
  }

  /**
   * Check if commands are installed
   */
  isInstalled() {
    return fs.existsSync(this.commandsDir) &&
           fs.existsSync(path.join(this.commandsDir, 'help.md'));
  }

  /**
   * Install ZuppaClaude commands
   */
  async install() {
    this.logger.step('Installing ZuppaClaude Slash Commands');

    try {
      // Ensure commands directory exists
      this.platform.ensureDir(this.commandsDir);

      // Get list of command files
      const files = fs.readdirSync(this.sourceDir);

      let installed = 0;
      for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const srcPath = path.join(this.sourceDir, file);
        const destPath = path.join(this.commandsDir, file);

        try {
          fs.copyFileSync(srcPath, destPath);
          installed++;
        } catch (error) {
          this.logger.warning(`Failed to install ${file}: ${error.message}`);
        }
      }

      this.logger.success(`Installed ${installed} slash commands`);
      this.logger.info('Commands available: /zc:backup, /zc:restore, /zc:cloud, /zc:session, /zc:settings, /zc:help');

      return true;
    } catch (error) {
      this.logger.error(`Failed to install commands: ${error.message}`);
      return false;
    }
  }

  /**
   * Uninstall commands
   */
  uninstall() {
    if (!fs.existsSync(this.commandsDir)) {
      this.logger.info('ZuppaClaude commands not found');
      return true;
    }

    try {
      fs.rmSync(this.commandsDir, { recursive: true });
      this.logger.success('ZuppaClaude commands removed');
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove commands: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify installation
   */
  verify() {
    if (this.isInstalled()) {
      this.logger.success('ZuppaClaude Commands: Installed');

      // Count installed commands
      try {
        const files = fs.readdirSync(this.commandsDir)
          .filter(f => f.endsWith('.md') && f !== 'README.md');
        this.logger.info(`Available: /zc:${files.map(f => f.replace('.md', '')).join(', /zc:')}`);
      } catch (e) {
        // Ignore
      }

      return true;
    } else {
      this.logger.warning('ZuppaClaude Commands: Not installed');
      return false;
    }
  }

  /**
   * List available commands
   */
  list() {
    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    ZuppaClaude Commands\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    const commands = [
      { cmd: '/zc:backup', desc: 'Full backup (sessions + settings + cloud)' },
      { cmd: '/zc:restore', desc: 'Restore from backup' },
      { cmd: '/zc:cloud', desc: 'Cloud backup management' },
      { cmd: '/zc:session', desc: 'Session management' },
      { cmd: '/zc:settings', desc: 'Settings management' },
      { cmd: '/zc:help', desc: 'Show help' }
    ];

    for (const { cmd, desc } of commands) {
      console.log(`  \x1b[36m${cmd.padEnd(18)}\x1b[0m ${desc}`);
    }

    console.log('');
    console.log('Usage:');
    console.log('  Type the command in Claude Code chat, e.g., /zc:backup');
    console.log('');

    return commands;
  }
}

module.exports = { CommandsInstaller };
