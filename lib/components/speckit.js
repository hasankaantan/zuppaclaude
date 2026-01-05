/**
 * Spec Kit component installer
 */

const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

const PACKAGE_NAME = 'specify-cli';

class SpecKitInstaller {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
  }

  /**
   * Check if Spec Kit is installed
   */
  isInstalled() {
    return this.platform.commandExists('specify');
  }

  /**
   * Install Spec Kit
   */
  async install() {
    this.logger.step('Step 3/7: Installing Spec Kit (specify-cli)');

    const pipCommand = this.platform.getPipCommand();

    if (!pipCommand) {
      this.logger.error('No Python package manager found (pip, pipx, or uv)');
      this.logger.info('Please install Python 3.8+ with pip');
      return false;
    }

    try {
      this.logger.info(`Installing ${PACKAGE_NAME} using ${pipCommand.split(' ')[0]}...`);
      this.platform.exec(`${pipCommand} ${PACKAGE_NAME}`, { silent: true });
      this.logger.success('Spec Kit installed');
      return true;
    } catch (error) {
      this.logger.error(`Failed to install Spec Kit: ${error.message}`);

      // Try fallback methods
      const fallbacks = ['pipx install', 'pip3 install --user', 'pip install --user'];
      for (const fallback of fallbacks) {
        if (fallback === pipCommand) continue;
        try {
          this.logger.info(`Trying fallback: ${fallback}...`);
          this.platform.exec(`${fallback} ${PACKAGE_NAME}`, { silent: true });
          this.logger.success(`Spec Kit installed via ${fallback.split(' ')[0]}`);
          return true;
        } catch {
          continue;
        }
      }

      return false;
    }
  }

  /**
   * Uninstall Spec Kit
   */
  uninstall() {
    const pipCommand = this.platform.getPipUninstallCommand();

    if (!pipCommand) {
      this.logger.warning('No Python package manager found');
      return false;
    }

    try {
      this.platform.exec(`${pipCommand} ${PACKAGE_NAME}`, { silent: true });
      this.logger.success('Spec Kit removed');
      return true;
    } catch (error) {
      this.logger.warning(`Could not remove Spec Kit: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify installation
   */
  verify() {
    if (this.isInstalled()) {
      this.logger.success('Spec Kit: Installed');
      return true;
    } else {
      this.logger.warning('Spec Kit: Not found in PATH');
      this.logger.info('You may need to add ~/.local/bin to your PATH');
      return false;
    }
  }
}

module.exports = { SpecKitInstaller };
