/**
 * Auto-Update Manager
 * Checks for updates and auto-updates if enabled
 */

const { execSync } = require('child_process');
const https = require('https');
const { Logger } = require('../utils/logger');
const { Settings } = require('../settings');

class UpdateManager {
  constructor() {
    this.logger = new Logger();
    this.settings = new Settings();
    this.packageName = 'zuppaclaude';
    this.currentVersion = require('../../package.json').version;
  }

  /**
   * Get latest version from npm
   */
  async getLatestVersion() {
    return new Promise((resolve, reject) => {
      const url = `https://registry.npmjs.org/${this.packageName}/latest`;

      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Compare versions (returns true if latest > current)
   */
  isNewerVersion(latest, current) {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (latestParts[i] > currentParts[i]) return true;
      if (latestParts[i] < currentParts[i]) return false;
    }
    return false;
  }

  /**
   * Check for updates
   */
  async checkForUpdates(silent = false) {
    try {
      const latestVersion = await this.getLatestVersion();
      const hasUpdate = this.isNewerVersion(latestVersion, this.currentVersion);

      if (hasUpdate && !silent) {
        console.log('');
        console.log('\x1b[33m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
        console.log('\x1b[33m║   Update Available!                                               ║\x1b[0m');
        console.log('\x1b[33m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m');
        console.log('');
        console.log(`  Current version: \x1b[31m${this.currentVersion}\x1b[0m`);
        console.log(`  Latest version:  \x1b[32m${latestVersion}\x1b[0m`);
        console.log('');
      }

      return {
        hasUpdate,
        currentVersion: this.currentVersion,
        latestVersion
      };
    } catch (error) {
      // Silently fail - don't interrupt user workflow
      return {
        hasUpdate: false,
        currentVersion: this.currentVersion,
        latestVersion: null,
        error: error.message
      };
    }
  }

  /**
   * Update to latest version
   */
  async update() {
    try {
      this.logger.step('Updating ZuppaClaude...');

      // Use npm to update globally
      execSync(`npm install -g ${this.packageName}@latest`, {
        stdio: 'inherit'
      });

      // Verify update
      const newVersion = await this.getLatestVersion();
      this.logger.success(`Updated to v${newVersion}`);

      return true;
    } catch (error) {
      this.logger.error(`Update failed: ${error.message}`);
      this.logger.info(`Manual update: npm install -g ${this.packageName}@latest`);
      return false;
    }
  }

  /**
   * Check and auto-update if enabled
   * Called at startup
   */
  async checkAndUpdate() {
    const userSettings = this.settings.load() || {};
    const autoUpdate = userSettings.autoUpdate !== false; // Default true

    const result = await this.checkForUpdates(true);

    if (result.hasUpdate) {
      if (autoUpdate) {
        console.log('');
        console.log(`\x1b[36m[i]\x1b[0m New version available: v${result.latestVersion}`);
        console.log('\x1b[36m[i]\x1b[0m Auto-updating...');
        console.log('');

        const updated = await this.update();

        if (updated) {
          console.log('');
          console.log('\x1b[32m[✓]\x1b[0m Update complete! Please restart to use the new version.');
          console.log('');
          return { updated: true, version: result.latestVersion };
        }
      } else {
        // Just notify
        console.log('');
        console.log(`\x1b[33m[!]\x1b[0m Update available: v${this.currentVersion} → v${result.latestVersion}`);
        console.log(`\x1b[33m[!]\x1b[0m Run: npm install -g ${this.packageName}@latest`);
        console.log('');
        return { updated: false, version: result.latestVersion };
      }
    }

    return { updated: false, version: this.currentVersion };
  }

  /**
   * Enable auto-update
   */
  enableAutoUpdate() {
    const userSettings = this.settings.load() || {};
    userSettings.autoUpdate = true;
    this.settings.save(userSettings);
    this.logger.success('Auto-update enabled');
  }

  /**
   * Disable auto-update
   */
  disableAutoUpdate() {
    const userSettings = this.settings.load() || {};
    userSettings.autoUpdate = false;
    this.settings.save(userSettings);
    this.logger.success('Auto-update disabled');
  }

  /**
   * Show update status
   */
  async status() {
    const userSettings = this.settings.load() || {};
    const autoUpdate = userSettings.autoUpdate !== false;

    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    Update Status\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');
    console.log(`  Current version: \x1b[36m${this.currentVersion}\x1b[0m`);
    console.log(`  Auto-update:     ${autoUpdate ? '\x1b[32menabled\x1b[0m' : '\x1b[31mdisabled\x1b[0m'}`);
    console.log('');

    this.logger.info('Checking for updates...');
    const result = await this.checkForUpdates(true);

    if (result.latestVersion) {
      console.log(`  Latest version:  \x1b[36m${result.latestVersion}\x1b[0m`);

      if (result.hasUpdate) {
        console.log('');
        console.log('  \x1b[33mUpdate available!\x1b[0m');
        console.log(`  Run: \x1b[36mnpm install -g ${this.packageName}@latest\x1b[0m`);
      } else {
        console.log('');
        console.log('  \x1b[32mYou are up to date!\x1b[0m');
      }
    } else {
      console.log('  \x1b[31mCould not check for updates\x1b[0m');
    }

    console.log('');
  }
}

module.exports = { UpdateManager };
