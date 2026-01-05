/**
 * Cloud Backup Manager - rclone integration for cloud sync
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');
const { Prompts } = require('../utils/prompts');

class CloudManager {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.prompts = new Prompts();
    this.backupDir = path.join(this.platform.zuppaconfigDir, 'backups');
    this.cloudPath = 'zuppaclaude-backups';

    // Supported providers
    this.providers = [
      { name: 'Google Drive', type: 'drive', remoteName: 'gdrive' },
      { name: 'Dropbox', type: 'dropbox', remoteName: 'dropbox' },
      { name: 'OneDrive', type: 'onedrive', remoteName: 'onedrive' },
      { name: 'Amazon S3', type: 's3', remoteName: 's3' },
      { name: 'SFTP', type: 'sftp', remoteName: 'sftp' },
      { name: 'Skip (configure later)', type: null, remoteName: null }
    ];
  }

  /**
   * Check if rclone is installed
   */
  isRcloneInstalled() {
    return this.platform.commandExists('rclone');
  }

  /**
   * Install rclone
   */
  async installRclone() {
    if (this.isRcloneInstalled()) {
      this.logger.success('rclone is already installed');
      return true;
    }

    this.logger.step('Installing rclone...');

    try {
      if (this.platform.isMac) {
        if (this.platform.commandExists('brew')) {
          this.platform.exec('brew install rclone', { silent: false, stdio: 'inherit' });
        } else {
          this.logger.warning('Homebrew not found, using curl installer');
          this.platform.exec('curl https://rclone.org/install.sh | sudo bash', { silent: false, stdio: 'inherit' });
        }
      } else if (this.platform.isLinux) {
        if (this.platform.commandExists('apt')) {
          this.platform.exec('sudo apt update && sudo apt install -y rclone', { silent: false, stdio: 'inherit' });
        } else if (this.platform.commandExists('dnf')) {
          this.platform.exec('sudo dnf install -y rclone', { silent: false, stdio: 'inherit' });
        } else if (this.platform.commandExists('pacman')) {
          this.platform.exec('sudo pacman -S --noconfirm rclone', { silent: false, stdio: 'inherit' });
        } else {
          this.platform.exec('curl https://rclone.org/install.sh | sudo bash', { silent: false, stdio: 'inherit' });
        }
      } else if (this.platform.isWindows) {
        if (this.platform.commandExists('winget')) {
          this.platform.exec('winget install -e --id Rclone.Rclone', { silent: false, stdio: 'inherit' });
        } else if (this.platform.commandExists('choco')) {
          this.platform.exec('choco install rclone -y', { silent: false, stdio: 'inherit' });
        } else {
          this.logger.error('Please install rclone manually: https://rclone.org/install/');
          return false;
        }
      }

      if (this.isRcloneInstalled()) {
        this.logger.success('rclone installed successfully');
        return true;
      } else {
        this.logger.warning('rclone installation may require terminal restart');
        return true;
      }
    } catch (error) {
      this.logger.error(`Failed to install rclone: ${error.message}`);
      this.logger.info('Install manually: https://rclone.org/install/');
      return false;
    }
  }

  /**
   * Configure a cloud provider
   */
  async configureProvider() {
    if (!this.isRcloneInstalled()) {
      this.logger.error('rclone is not installed');
      return null;
    }

    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    Cloud Provider Setup\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    // Show provider options
    const providerNames = this.providers.map(p => p.name);
    const selectedIndex = await this.prompts.select('Select a cloud provider:', providerNames);
    const provider = this.providers[selectedIndex];

    if (!provider.type) {
      this.logger.info('Skipping cloud provider configuration');
      this.logger.info('Run "rclone config" later to set up manually');
      return null;
    }

    console.log('');
    this.logger.step(`Configuring ${provider.name}...`);

    // Check if remote already exists
    const existingRemotes = this.getRemotes();
    if (existingRemotes.includes(provider.remoteName)) {
      this.logger.warning(`Remote "${provider.remoteName}" already exists`);
      const overwrite = await this.prompts.confirm('Overwrite existing configuration?', false);
      if (!overwrite) {
        return provider.remoteName;
      }
      // Delete existing remote
      try {
        this.platform.exec(`rclone config delete ${provider.remoteName}`, { silent: true });
      } catch (e) {
        // Ignore
      }
    }

    // Run rclone config create
    try {
      await this.runProviderAuth(provider);

      // Verify configuration
      if (this.getRemotes().includes(provider.remoteName)) {
        this.logger.success(`${provider.name} configured successfully`);
        console.log('');
        console.log('  Backup path: \x1b[36m' + provider.remoteName + ':zuppaclaude-backups/\x1b[0m');
        console.log('    ├── sessions/');
        console.log('    └── settings/');
        console.log('');
        return provider.remoteName;
      } else {
        this.logger.error('Configuration failed');
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to configure ${provider.name}: ${error.message}`);
      return null;
    }
  }

  /**
   * Run provider-specific authentication
   */
  async runProviderAuth(provider) {
    return new Promise((resolve, reject) => {
      console.log('');

      if (provider.type === 'drive' || provider.type === 'dropbox' || provider.type === 'onedrive') {
        // OAuth providers - need browser auth
        this.logger.info('A browser window will open for authentication...');
        this.logger.info('Please authorize ZuppaClaude to access your ' + provider.name);
        console.log('');
      }

      // Use spawn for interactive rclone config
      const args = ['config', 'create', provider.remoteName, provider.type];

      // Add provider-specific defaults
      if (provider.type === 'drive') {
        args.push('scope', 'drive');
      }

      const rclone = spawn('rclone', args, {
        stdio: 'inherit',
        shell: true
      });

      rclone.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`rclone exited with code ${code}`));
        }
      });

      rclone.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Verify rclone installation
   */
  verify() {
    if (this.isRcloneInstalled()) {
      try {
        const version = this.platform.exec('rclone version', { silent: true });
        const versionMatch = version?.match(/rclone v([\d.]+)/);
        if (versionMatch) {
          this.logger.success(`rclone: v${versionMatch[1]}`);
        } else {
          this.logger.success('rclone: Installed');
        }
      } catch {
        this.logger.success('rclone: Installed');
      }

      const remotes = this.getRemotes();
      if (remotes.length > 0) {
        this.logger.info(`Remotes: ${remotes.join(', ')}`);
      } else {
        this.logger.info('No remotes configured (run: rclone config)');
      }
      return true;
    } else {
      this.logger.warning('rclone: Not installed');
      return false;
    }
  }

  /**
   * Get available rclone remotes
   */
  getRemotes() {
    if (!this.isRcloneInstalled()) {
      return [];
    }

    try {
      const output = this.platform.exec('rclone listremotes', { silent: true });
      if (!output) return [];

      return output
        .split('\n')
        .map(r => r.trim().replace(/:$/, ''))
        .filter(r => r.length > 0);
    } catch (error) {
      return [];
    }
  }

  /**
   * Check remote exists
   */
  remoteExists(remote) {
    const remotes = this.getRemotes();
    return remotes.includes(remote);
  }

  /**
   * Show rclone setup instructions
   */
  showSetupInstructions() {
    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    Cloud Backup Setup\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    if (!this.isRcloneInstalled()) {
      console.log('\x1b[33m[!]\x1b[0m rclone is not installed.');
      console.log('');
      console.log('Install rclone:');
      console.log('');
      if (this.platform.isMac) {
        console.log('  \x1b[36mbrew install rclone\x1b[0m');
      } else if (this.platform.isLinux) {
        console.log('  \x1b[36mcurl https://rclone.org/install.sh | sudo bash\x1b[0m');
      } else {
        console.log('  \x1b[36mwinget install Rclone.Rclone\x1b[0m');
      }
      console.log('');
      console.log('Or visit: https://rclone.org/install/');
      console.log('');
      return false;
    }

    console.log('\x1b[32m[✓]\x1b[0m rclone is installed');
    console.log('');

    const remotes = this.getRemotes();

    if (remotes.length === 0) {
      console.log('\x1b[33m[!]\x1b[0m No cloud remotes configured.');
      console.log('');
      console.log('Configure a remote:');
      console.log('');
      console.log('  \x1b[36mrclone config\x1b[0m');
      console.log('');
      console.log('Popular options:');
      console.log('  • Google Drive: Choose "drive"');
      console.log('  • Dropbox: Choose "dropbox"');
      console.log('  • OneDrive: Choose "onedrive"');
      console.log('  • S3/Minio: Choose "s3"');
      console.log('  • SFTP: Choose "sftp"');
      console.log('  • FTP: Choose "ftp"');
      console.log('');
      return false;
    }

    console.log('Available remotes:');
    console.log('');
    for (const remote of remotes) {
      console.log(`  \x1b[36m${remote}\x1b[0m`);
    }
    console.log('');
    console.log('Usage:');
    console.log('');
    console.log(`  \x1b[36mnpx zuppaclaude backup --cloud ${remotes[0]}\x1b[0m`);
    console.log(`  \x1b[36mnpx zuppaclaude restore --cloud ${remotes[0]}\x1b[0m`);
    console.log('');

    return true;
  }

  /**
   * List remotes
   */
  listRemotes() {
    if (!this.isRcloneInstalled()) {
      this.logger.error('rclone is not installed');
      this.showSetupInstructions();
      return [];
    }

    const remotes = this.getRemotes();

    if (remotes.length === 0) {
      this.logger.warning('No remotes configured');
      this.showSetupInstructions();
      return [];
    }

    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    Available Cloud Remotes\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    for (const remote of remotes) {
      // Try to get remote type
      let type = 'unknown';
      try {
        const config = this.platform.exec(`rclone config show ${remote}`, { silent: true });
        const typeMatch = config?.match(/type\s*=\s*(\w+)/);
        if (typeMatch) type = typeMatch[1];
      } catch (e) {
        // Ignore
      }

      const icon = this.getRemoteIcon(type);
      console.log(`  ${icon} \x1b[36m${remote}\x1b[0m (${type})`);
    }

    console.log('');
    return remotes;
  }

  /**
   * Get icon for remote type
   */
  getRemoteIcon(type) {
    const icons = {
      'drive': '📁',
      'dropbox': '📦',
      'onedrive': '☁️',
      's3': '🪣',
      'sftp': '🔐',
      'ftp': '📡',
      'b2': '🅱️',
      'box': '📥',
      'mega': '🔷',
      'pcloud': '☁️'
    };
    return icons[type] || '☁️';
  }

  /**
   * Upload backup to cloud
   */
  async upload(remote, backupId = null) {
    if (!this.isRcloneInstalled()) {
      this.logger.error('rclone is not installed');
      this.showSetupInstructions();
      return false;
    }

    if (!this.remoteExists(remote)) {
      this.logger.error(`Remote not found: ${remote}`);
      this.logger.info('Run "npx zuppaclaude cloud remotes" to see available remotes');
      return false;
    }

    // Determine what to upload
    let sourcePath = this.backupDir;
    let destPath = `${remote}:${this.cloudPath}`;

    if (backupId) {
      sourcePath = path.join(this.backupDir, backupId);
      if (!fs.existsSync(sourcePath)) {
        this.logger.error(`Backup not found: ${backupId}`);
        return false;
      }
      destPath = `${remote}:${this.cloudPath}/${backupId}`;
    }

    if (!fs.existsSync(sourcePath)) {
      this.logger.error('No backups to upload');
      this.logger.info('Run "npx zuppaclaude backup" first');
      return false;
    }

    console.log('');
    this.logger.step(`Uploading to ${remote}...`);
    console.log('');

    try {
      // Use rclone sync for efficiency
      const cmd = `rclone sync "${sourcePath}" "${destPath}" --progress`;
      this.platform.exec(cmd, { silent: false, stdio: 'inherit' });

      console.log('');
      this.logger.success(`Backup uploaded to ${remote}:${this.cloudPath}`);
      console.log('');
      return true;
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Download backup from cloud
   */
  async download(remote, backupId = null) {
    if (!this.isRcloneInstalled()) {
      this.logger.error('rclone is not installed');
      this.showSetupInstructions();
      return false;
    }

    if (!this.remoteExists(remote)) {
      this.logger.error(`Remote not found: ${remote}`);
      return false;
    }

    let sourcePath = `${remote}:${this.cloudPath}`;
    let destPath = this.backupDir;

    if (backupId) {
      sourcePath = `${remote}:${this.cloudPath}/${backupId}`;
      destPath = path.join(this.backupDir, backupId);
    }

    this.platform.ensureDir(destPath);

    console.log('');
    this.logger.step(`Downloading from ${remote}...`);
    console.log('');

    try {
      const cmd = `rclone sync "${sourcePath}" "${destPath}" --progress`;
      this.platform.exec(cmd, { silent: false, stdio: 'inherit' });

      console.log('');
      this.logger.success(`Backup downloaded from ${remote}`);
      console.log('');
      return true;
    } catch (error) {
      this.logger.error(`Download failed: ${error.message}`);
      return false;
    }
  }

  /**
   * List cloud backups
   */
  async listCloudBackups(remote) {
    if (!this.isRcloneInstalled()) {
      this.logger.error('rclone is not installed');
      return [];
    }

    if (!this.remoteExists(remote)) {
      this.logger.error(`Remote not found: ${remote}`);
      return [];
    }

    try {
      const cmd = `rclone lsd "${remote}:${this.cloudPath}" 2>/dev/null`;
      const output = this.platform.exec(cmd, { silent: true });

      if (!output) {
        this.logger.warning('No cloud backups found');
        return [];
      }

      const backups = output
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.trim().split(/\s+/);
          const name = parts[parts.length - 1];
          return name;
        })
        .filter(name => name && name.match(/^\d{4}-\d{2}-\d{2}T/));

      console.log('');
      console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
      console.log(`\x1b[35m                    Cloud Backups (${remote})\x1b[0m`);
      console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
      console.log('');

      if (backups.length === 0) {
        console.log('  No backups found');
      } else {
        for (const backup of backups) {
          console.log(`  📦 ${backup}`);
        }
      }

      console.log('');
      return backups;
    } catch (error) {
      this.logger.warning('Could not list cloud backups');
      return [];
    }
  }
}

module.exports = { CloudManager };
