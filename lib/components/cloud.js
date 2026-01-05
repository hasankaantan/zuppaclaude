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
   * Create zip file from directory
   */
  createZip(sourceDir, zipPath) {
    try {
      const parentDir = path.dirname(sourceDir);
      const folderName = path.basename(sourceDir);

      if (this.platform.isWindows) {
        // Use PowerShell on Windows
        this.platform.exec(
          `powershell -command "Compress-Archive -Path '${sourceDir}' -DestinationPath '${zipPath}' -Force"`,
          { silent: true }
        );
      } else {
        // Use zip on macOS/Linux
        this.platform.exec(
          `cd "${parentDir}" && zip -r "${zipPath}" "${folderName}"`,
          { silent: true }
        );
      }
      return true;
    } catch (error) {
      this.logger.warning(`Failed to create zip: ${error.message}`);
      return false;
    }
  }

  /**
   * Extract zip file
   */
  extractZip(zipPath, destDir) {
    try {
      this.platform.ensureDir(destDir);

      if (this.platform.isWindows) {
        this.platform.exec(
          `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`,
          { silent: true }
        );
      } else {
        this.platform.exec(`unzip -o "${zipPath}" -d "${destDir}"`, { silent: true });
      }
      return true;
    } catch (error) {
      this.logger.warning(`Failed to extract zip: ${error.message}`);
      return false;
    }
  }

  /**
   * Upload backup to cloud (as zip)
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

    // Upload specific backup or all backups
    if (backupId) {
      return await this.uploadSingleBackup(remote, backupId);
    }

    // Upload all backups (sessions and settings folders)
    const sessionsDir = path.join(this.backupDir, 'sessions');
    const settingsDir = path.join(this.backupDir, 'settings');

    if (!fs.existsSync(sessionsDir) && !fs.existsSync(settingsDir)) {
      this.logger.error('No backups to upload');
      this.logger.info('Run "npx zuppaclaude backup" first');
      return false;
    }

    console.log('');
    this.logger.step(`Uploading to ${remote}...`);
    console.log('');

    let uploaded = 0;

    // Get all backup timestamps from sessions folder
    if (fs.existsSync(sessionsDir)) {
      const backupFolders = fs.readdirSync(sessionsDir).filter(name => {
        return fs.statSync(path.join(sessionsDir, name)).isDirectory();
      });

      for (const folder of backupFolders) {
        const success = await this.uploadSingleBackup(remote, folder);
        if (success) uploaded++;
      }
    }

    console.log('');
    this.logger.success(`Uploaded ${uploaded} backup(s) to ${remote}:${this.cloudPath}/`);
    console.log('');
    return true;
  }

  /**
   * Upload a single backup as zip
   */
  async uploadSingleBackup(remote, backupId) {
    const sessionsPath = path.join(this.backupDir, 'sessions', backupId);
    const settingsPath = path.join(this.backupDir, 'settings', backupId);

    if (!fs.existsSync(sessionsPath)) {
      this.logger.error(`Backup not found: ${backupId}`);
      return false;
    }

    // Create temp directory for zip
    const tempDir = path.join(this.backupDir, '.temp');
    this.platform.ensureDir(tempDir);

    const zipFileName = `${backupId}.zip`;
    const zipPath = path.join(tempDir, zipFileName);

    this.logger.info(`Compressing ${backupId}...`);

    // Create a combined backup folder
    const combinedDir = path.join(tempDir, backupId);
    this.platform.ensureDir(combinedDir);

    // Copy sessions
    const sessionsDestDir = path.join(combinedDir, 'sessions');
    this.platform.ensureDir(sessionsDestDir);
    try {
      this.platform.exec(`cp -r "${sessionsPath}"/* "${sessionsDestDir}/"`, { silent: true });
    } catch (e) {
      // Fallback: copy the directory itself
      this.platform.exec(`cp -r "${sessionsPath}" "${combinedDir}/"`, { silent: true });
    }

    // Copy settings if exists and has content
    if (fs.existsSync(settingsPath)) {
      const settingsFiles = fs.readdirSync(settingsPath);
      if (settingsFiles.length > 0) {
        const settingsDestDir = path.join(combinedDir, 'settings');
        this.platform.ensureDir(settingsDestDir);
        try {
          this.platform.exec(`cp -r "${settingsPath}"/* "${settingsDestDir}/"`, { silent: true });
        } catch (e) {
          // Ignore if empty
        }
      }
    }

    // Create zip
    const zipCreated = this.createZip(combinedDir, zipPath);
    if (!zipCreated) {
      this.logger.error('Failed to create zip');
      return false;
    }

    const zipSize = fs.statSync(zipPath).size;
    this.logger.info(`Zip size: ${this.formatSize(zipSize)}`);

    // Upload zip
    const destPath = `${remote}:${this.cloudPath}/${zipFileName}`;

    try {
      this.logger.info(`Uploading ${zipFileName}...`);
      const cmd = `rclone copy "${zipPath}" "${remote}:${this.cloudPath}/" --progress`;
      this.platform.exec(cmd, { silent: false, stdio: 'inherit' });

      this.logger.success(`Uploaded ${zipFileName}`);

      // Cleanup: delete temp files
      try {
        fs.unlinkSync(zipPath);
        fs.rmSync(combinedDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }

      return true;
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);

      // Cleanup on error
      try {
        fs.unlinkSync(zipPath);
        fs.rmSync(combinedDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore
      }

      return false;
    }
  }

  /**
   * Format file size
   */
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Download backup from cloud (downloads and extracts zip)
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

    // Download specific backup or all backups
    if (backupId) {
      return await this.downloadSingleBackup(remote, backupId);
    }

    // Download all backups
    console.log('');
    this.logger.step(`Downloading from ${remote}...`);
    console.log('');

    try {
      // List all zip files in cloud
      const cmd = `rclone lsf "${remote}:${this.cloudPath}/" --files-only 2>/dev/null`;
      const output = this.platform.exec(cmd, { silent: true });

      if (!output) {
        this.logger.warning('No backups found on cloud');
        return false;
      }

      const zipFiles = output.split('\n').filter(f => f.endsWith('.zip'));

      if (zipFiles.length === 0) {
        this.logger.warning('No backup archives found on cloud');
        return false;
      }

      let downloaded = 0;
      for (const zipFile of zipFiles) {
        const backupName = zipFile.replace('.zip', '');
        const success = await this.downloadSingleBackup(remote, backupName);
        if (success) downloaded++;
      }

      console.log('');
      this.logger.success(`Downloaded ${downloaded} backup(s) from ${remote}`);
      console.log('');
      return true;
    } catch (error) {
      this.logger.error(`Download failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Download and extract a single backup
   */
  async downloadSingleBackup(remote, backupId) {
    const zipFileName = `${backupId}.zip`;
    const tempDir = path.join(this.backupDir, '.temp');
    this.platform.ensureDir(tempDir);
    const zipPath = path.join(tempDir, zipFileName);

    try {
      // Download zip
      this.logger.info(`Downloading ${zipFileName}...`);
      const cmd = `rclone copy "${remote}:${this.cloudPath}/${zipFileName}" "${tempDir}/" --progress`;
      this.platform.exec(cmd, { silent: false, stdio: 'inherit' });

      if (!fs.existsSync(zipPath)) {
        this.logger.error(`Backup not found: ${backupId}`);
        return false;
      }

      // Extract zip
      this.logger.info(`Extracting ${zipFileName}...`);
      const extractDir = path.join(tempDir, 'extract');
      this.platform.ensureDir(extractDir);
      this.extractZip(zipPath, extractDir);

      // Move sessions and settings to proper locations
      const extractedBackup = path.join(extractDir, backupId);

      if (fs.existsSync(path.join(extractedBackup, 'sessions'))) {
        const sessionsDir = path.join(this.backupDir, 'sessions', backupId);
        this.platform.ensureDir(path.dirname(sessionsDir));
        if (fs.existsSync(sessionsDir)) {
          fs.rmSync(sessionsDir, { recursive: true, force: true });
        }
        fs.renameSync(path.join(extractedBackup, 'sessions'), sessionsDir);
      }

      if (fs.existsSync(path.join(extractedBackup, 'settings'))) {
        const settingsDir = path.join(this.backupDir, 'settings', backupId);
        this.platform.ensureDir(path.dirname(settingsDir));
        if (fs.existsSync(settingsDir)) {
          fs.rmSync(settingsDir, { recursive: true, force: true });
        }
        fs.renameSync(path.join(extractedBackup, 'settings'), settingsDir);
      }

      // Cleanup
      try {
        fs.unlinkSync(zipPath);
        fs.rmSync(extractDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }

      this.logger.success(`Downloaded ${backupId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to download ${backupId}: ${error.message}`);

      // Cleanup on error
      try {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      } catch (e) {
        // Ignore
      }

      return false;
    }
  }

  /**
   * List cloud backups (zip files)
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
      const cmd = `rclone lsf "${remote}:${this.cloudPath}/" --files-only 2>/dev/null`;
      const output = this.platform.exec(cmd, { silent: true });

      console.log('');
      console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
      console.log(`\x1b[35m                    Cloud Backups (${remote})\x1b[0m`);
      console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
      console.log('');

      if (!output) {
        console.log('  No backups found');
        console.log('');
        return [];
      }

      const backups = output
        .split('\n')
        .filter(f => f.endsWith('.zip'))
        .map(f => f.replace('.zip', ''));

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
