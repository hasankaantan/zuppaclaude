/**
 * Settings management for ZuppaClaude
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('./utils/logger');
const { Platform } = require('./utils/platform');
const { Prompts } = require('./utils/prompts');

const SETTINGS_VERSION = '1.0';

class Settings {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.prompts = new Prompts();
    this.configDir = this.platform.zuppaconfigDir;
    this.filePath = path.join(this.configDir, 'zc-settings.json');
  }

  /**
   * Check if settings file exists
   */
  exists() {
    return fs.existsSync(this.filePath);
  }

  /**
   * Load settings from file
   */
  load() {
    if (!this.exists()) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.logger.warning(`Could not parse settings file: ${error.message}`);
      return null;
    }
  }

  /**
   * Save settings to file
   */
  save(settings) {
    this.platform.ensureDir(this.configDir);

    const timestamp = new Date().toISOString();
    const existing = this.load();

    const data = {
      version: SETTINGS_VERSION,
      created: existing?.created || timestamp,
      updated: timestamp,
      components: settings.components || {},
      preferences: settings.preferences || {
        auto_update_check: true,
        backup_configs: true,
      },
    };

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    fs.chmodSync(this.filePath, 0o600);

    this.logger.success(`Settings saved to ${this.filePath}`);
    return data;
  }

  /**
   * Get component settings
   */
  getComponents() {
    const settings = this.load();
    return settings?.components || {};
  }

  /**
   * Update component settings
   */
  updateComponents(components) {
    const settings = this.load() || { components: {}, preferences: {} };
    settings.components = { ...settings.components, ...components };
    return this.save(settings);
  }

  /**
   * Encode API key to base64
   */
  encodeApiKey(key) {
    return Buffer.from(key).toString('base64');
  }

  /**
   * Decode API key from base64
   */
  decodeApiKey(encoded) {
    try {
      return Buffer.from(encoded, 'base64').toString('utf8');
    } catch {
      return '';
    }
  }

  /**
   * Show current settings
   */
  show() {
    if (!this.exists()) {
      this.logger.warning(`No settings file found at: ${this.filePath}`);
      console.log('\nRun the installer first to create settings.');
      return;
    }

    const settings = this.load();
    if (!settings) return;

    const c = settings.components || {};

    console.log(`\nSettings file: ${this.filePath}\n`);
    console.log(`Version: ${settings.version}`);
    console.log(`Created: ${settings.created}`);
    console.log(`Updated: ${settings.updated}`);
    console.log('\nComponents:');
    console.log(`  SuperClaude: ${c.superclaude?.installed ? 'Yes' : 'No'}`);
    console.log(`  Spec Kit: ${c.speckit?.installed ? 'Yes' : 'No'}`);
    console.log(`  Claude-Z: ${c.claude_z?.installed ? 'Yes' : 'No'}`);
    if (c.claude_z?.api_key_encoded) {
      console.log('    API Key: [configured]');
    }
    console.log(`  Claude HUD: ${c.claude_hud?.installed ? 'Yes' : 'No'}`);
    console.log(`  rclone: ${c.rclone?.installed ? 'Yes' : 'No'}`);
    if (c.rclone?.remote) {
      console.log(`    Remote: ${c.rclone.remote}`);
    }

    const p = settings.preferences || {};
    console.log('\nPreferences:');
    console.log(`  Auto-update check: ${p.auto_update_check ? 'Yes' : 'No'}`);
    console.log(`  Backup configs: ${p.backup_configs ? 'Yes' : 'No'}`);
    console.log('');
  }

  /**
   * Export settings to file
   */
  export(exportPath) {
    if (!this.exists()) {
      this.logger.error(`No settings file found at: ${this.filePath}`);
      return false;
    }

    const settings = this.load();
    if (!settings) return false;

    // Add export metadata
    settings._export = {
      exported_at: new Date().toISOString(),
      hostname: require('os').hostname(),
      source_path: this.filePath,
    };

    const resolvedPath = path.resolve(exportPath.replace(/^~/, this.platform.homedir));
    fs.writeFileSync(resolvedPath, JSON.stringify(settings, null, 2), 'utf8');

    this.logger.success(`Settings exported to: ${resolvedPath}`);
    return true;
  }

  /**
   * Import settings from file
   */
  import(importPath) {
    const resolvedPath = path.resolve(importPath.replace(/^~/, this.platform.homedir));

    if (!fs.existsSync(resolvedPath)) {
      this.logger.error(`Import file not found: ${resolvedPath}`);
      return false;
    }

    let settings;
    try {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      settings = JSON.parse(content);
    } catch (error) {
      this.logger.error(`Invalid JSON file: ${error.message}`);
      return false;
    }

    // Backup existing settings
    if (this.exists()) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${this.filePath}.backup.${timestamp}`;
      fs.copyFileSync(this.filePath, backupPath);
      this.logger.info(`Existing settings backed up to: ${backupPath}`);
    }

    // Remove export metadata
    delete settings._export;

    // Update timestamp
    settings.updated = new Date().toISOString();

    this.platform.ensureDir(this.configDir);
    fs.writeFileSync(this.filePath, JSON.stringify(settings, null, 2), 'utf8');
    fs.chmodSync(this.filePath, 0o600);

    this.logger.success(`Settings imported from: ${resolvedPath}`);
    this.logger.info('Run the installer again to apply imported settings');
    return true;
  }

  /**
   * Reset settings (with confirmation prompt)
   */
  async reset() {
    if (!this.exists()) {
      this.logger.warning('No settings file found');
      return true;
    }

    const confirmed = await this.prompts.confirm('Are you sure you want to reset all settings?', false);
    this.prompts.close();

    if (!confirmed) {
      this.logger.info('Reset cancelled');
      return false;
    }

    return this.delete();
  }

  /**
   * Delete settings file (no confirmation)
   */
  delete() {
    if (!this.exists()) {
      return true;
    }

    try {
      fs.unlinkSync(this.filePath);
      return true;
    } catch (error) {
      this.logger.warning(`Could not delete settings: ${error.message}`);
      return false;
    }
  }
}

module.exports = { Settings, SETTINGS_VERSION };
