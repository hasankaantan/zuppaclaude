/**
 * Unified Backup Manager - Sessions + Settings + Cloud
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');
const { SessionManager } = require('./session');
const { CloudManager } = require('./cloud');
const { Settings } = require('../settings');

class BackupManager {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.sessionManager = new SessionManager();
    this.cloudManager = new CloudManager();
    this.settings = new Settings();
    this.backupDir = path.join(this.platform.zuppaconfigDir, 'backups');
  }

  /**
   * Full backup - sessions + settings
   */
  async backup(options = {}) {
    const { cloud } = options;

    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    ZuppaClaude Full Backup\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    // Step 1: Backup sessions
    this.logger.step('Step 1/3: Backing up Claude Code sessions...');
    const sessionResult = this.sessionManager.backup();

    if (!sessionResult) {
      this.logger.warning('No sessions to backup');
    }

    // Step 2: Backup settings to the same directory
    this.logger.step('Step 2/3: Backing up ZuppaClaude settings...');

    if (sessionResult) {
      const settingsBackupPath = path.join(sessionResult.path, 'zc-settings.json');
      const currentSettings = this.settings.load();

      if (currentSettings) {
        fs.writeFileSync(settingsBackupPath, JSON.stringify(currentSettings, null, 2));
        this.logger.success('Settings backed up');
      } else {
        this.logger.info('No settings to backup');
      }

      // Update manifest with settings info
      const manifestPath = path.join(sessionResult.path, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.settings = currentSettings ? true : false;
        manifest.backupType = 'full';
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      }
    }

    // Step 3: Upload to cloud if specified
    if (cloud) {
      this.logger.step('Step 3/3: Uploading to cloud...');

      if (!this.cloudManager.isRcloneInstalled()) {
        this.logger.warning('rclone not installed, skipping cloud upload');
        this.cloudManager.showSetupInstructions();
      } else if (!this.cloudManager.remoteExists(cloud)) {
        this.logger.error(`Remote not found: ${cloud}`);
        this.cloudManager.listRemotes();
      } else {
        await this.cloudManager.upload(cloud, sessionResult?.timestamp);
      }
    } else {
      this.logger.step('Step 3/3: Cloud upload skipped (use --cloud <remote>)');
    }

    // Summary
    this.printBackupSummary(sessionResult, cloud);

    return sessionResult;
  }

  /**
   * Full restore - sessions + settings
   */
  async restore(backupId, options = {}) {
    const { cloud, settingsOnly, sessionsOnly } = options;

    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    ZuppaClaude Restore\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    // Step 1: Download from cloud if specified
    if (cloud) {
      this.logger.step('Step 1/3: Downloading from cloud...');

      if (!this.cloudManager.isRcloneInstalled()) {
        this.logger.error('rclone not installed');
        this.cloudManager.showSetupInstructions();
        return false;
      }

      if (!this.cloudManager.remoteExists(cloud)) {
        this.logger.error(`Remote not found: ${cloud}`);
        return false;
      }

      await this.cloudManager.download(cloud, backupId);
    } else {
      this.logger.info('Step 1/3: Using local backup');
    }

    const backupPath = path.join(this.backupDir, backupId);

    if (!fs.existsSync(backupPath)) {
      this.logger.error(`Backup not found: ${backupId}`);
      this.logger.info('Run "npx zuppaclaude backup list" to see available backups');
      return false;
    }

    let sessionsRestored = false;
    let settingsRestored = false;

    // Step 2: Restore sessions
    if (!settingsOnly) {
      this.logger.step('Step 2/3: Restoring sessions...');
      sessionsRestored = this.sessionManager.restore(backupId);
    } else {
      this.logger.info('Step 2/3: Sessions restore skipped');
    }

    // Step 3: Restore settings
    if (!sessionsOnly) {
      this.logger.step('Step 3/3: Restoring settings...');

      const settingsBackupPath = path.join(backupPath, 'zc-settings.json');

      if (fs.existsSync(settingsBackupPath)) {
        try {
          const backupSettings = JSON.parse(fs.readFileSync(settingsBackupPath, 'utf8'));
          this.settings.save(backupSettings);
          this.logger.success('Settings restored');
          settingsRestored = true;
        } catch (error) {
          this.logger.warning(`Failed to restore settings: ${error.message}`);
        }
      } else {
        this.logger.info('No settings in backup');
      }
    } else {
      this.logger.info('Step 3/3: Settings restore skipped');
    }

    // Summary
    console.log('');
    console.log('\x1b[32m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[32m                    Restore Complete\x1b[0m');
    console.log('\x1b[32m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');
    console.log(`  Sessions: ${sessionsRestored ? '✅ Restored' : '⏭️ Skipped'}`);
    console.log(`  Settings: ${settingsRestored ? '✅ Restored' : '⏭️ Skipped'}`);
    console.log('');
    console.log('  Restart Claude Code to see restored sessions');
    console.log('');

    return true;
  }

  /**
   * List all backups (local + cloud)
   */
  async list(options = {}) {
    const { cloud } = options;

    // List local backups
    this.sessionManager.listBackups();

    // List cloud backups if remote specified
    if (cloud) {
      await this.cloudManager.listCloudBackups(cloud);
    }
  }

  /**
   * Print backup summary
   */
  printBackupSummary(result, cloud) {
    console.log('');
    console.log('\x1b[32m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[32m                    Backup Complete\x1b[0m');
    console.log('\x1b[32m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    if (result) {
      console.log(`  📦 Backup ID: ${result.timestamp}`);
      console.log(`  📁 Sessions: ${result.sessions}`);
      console.log(`  💾 Size: ${this.formatSize(result.size)}`);
      console.log(`  📍 Location: ${result.path}`);

      if (cloud) {
        console.log(`  ☁️ Cloud: ${cloud}:zuppaclaude-backups/${result.timestamp}`);
      }
    }

    console.log('');
    console.log('  Restore with:');
    if (result) {
      console.log(`  \x1b[36mnpx zuppaclaude restore ${result.timestamp}\x1b[0m`);
      if (cloud) {
        console.log(`  \x1b[36mnpx zuppaclaude restore ${result.timestamp} --cloud ${cloud}\x1b[0m`);
      }
    }
    console.log('');
  }

  /**
   * Format file size
   */
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

module.exports = { BackupManager };
