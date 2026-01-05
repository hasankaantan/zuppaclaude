/**
 * SuperClaude component installer
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

const SUPERCLAUDE_REPO = 'https://github.com/SuperClaude-Org/SuperClaude_Framework.git';
const SUPERCLAUDE_ZIP = 'https://github.com/SuperClaude-Org/SuperClaude_Framework/archive/refs/heads/master.zip';

class SuperClaudeInstaller {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.installPath = path.join(this.platform.commandsDir, 'sc');
  }

  /**
   * Check if SuperClaude is already installed
   */
  isInstalled() {
    return fs.existsSync(this.installPath);
  }

  /**
   * Install SuperClaude
   */
  async install() {
    this.logger.step('Step 2/7: Installing SuperClaude Framework');

    // Ensure directories exist
    this.platform.ensureDir(this.platform.commandsDir);

    // Backup existing installation
    if (this.isInstalled()) {
      const backupPath = `${this.installPath}.backup.${Date.now()}`;
      fs.renameSync(this.installPath, backupPath);
      this.logger.info(`Existing installation backed up to: ${backupPath}`);
    }

    // Try git clone first
    if (this.platform.commandExists('git')) {
      try {
        this.logger.info('Cloning SuperClaude repository...');
        this.platform.exec(`git clone --depth 1 ${SUPERCLAUDE_REPO} "${this.installPath}"`, { silent: true });

        // Remove .git folder to save space
        const gitDir = path.join(this.installPath, '.git');
        if (fs.existsSync(gitDir)) {
          fs.rmSync(gitDir, { recursive: true });
        }

        this.logger.success('SuperClaude installed via git');
        return true;
      } catch (error) {
        this.logger.warning('Git clone failed, trying ZIP download...');
      }
    }

    // Fallback to ZIP download
    try {
      const tempZip = path.join(require('os').tmpdir(), 'superclaude.zip');
      const tempDir = path.join(require('os').tmpdir(), 'superclaude-extract');

      this.logger.info('Downloading SuperClaude ZIP...');
      await this.platform.download(SUPERCLAUDE_ZIP, tempZip);

      // Extract ZIP
      this.logger.info('Extracting...');
      if (this.platform.isWindows) {
        this.platform.exec(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${tempDir}' -Force"`, { silent: true });
      } else {
        this.platform.exec(`unzip -q -o "${tempZip}" -d "${tempDir}"`, { silent: true });
      }

      // Move extracted content to install path
      const extracted = fs.readdirSync(tempDir)[0];
      const extractedPath = path.join(tempDir, extracted);

      this.platform.ensureDir(path.dirname(this.installPath));
      fs.renameSync(extractedPath, this.installPath);

      // Cleanup
      fs.rmSync(tempZip, { force: true });
      fs.rmSync(tempDir, { recursive: true, force: true });

      this.logger.success('SuperClaude installed via ZIP');
      return true;
    } catch (error) {
      this.logger.error(`Failed to install SuperClaude: ${error.message}`);
      return false;
    }
  }

  /**
   * Uninstall SuperClaude
   */
  uninstall() {
    if (!this.isInstalled()) {
      this.logger.warning('SuperClaude not found');
      return true;
    }

    try {
      fs.rmSync(this.installPath, { recursive: true });
      this.logger.success('SuperClaude removed');
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove SuperClaude: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify installation
   */
  verify() {
    if (this.isInstalled()) {
      this.logger.success('SuperClaude: Installed');
      return true;
    } else {
      this.logger.error('SuperClaude: Not installed');
      return false;
    }
  }
}

module.exports = { SuperClaudeInstaller };
