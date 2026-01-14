/**
 * Doctor - System Health Check
 * Diagnoses ZuppaClaude installation and Claude Code environment
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');
const { Settings } = require('../settings');

class DoctorManager {
  constructor() {
    this.logger = new Logger();
    this.platform = new Platform();
    this.settings = new Settings();
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Run all health checks
   */
  async run() {
    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    ZuppaClaude Doctor\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    // System checks
    console.log('\x1b[36m[System]\x1b[0m');
    this.checkOS();
    this.checkNodeVersion();
    this.checkDiskSpace();
    console.log('');

    // Claude Code checks
    console.log('\x1b[36m[Claude Code]\x1b[0m');
    await this.checkClaudeCode();
    console.log('');

    // ZuppaClaude checks
    console.log('\x1b[36m[ZuppaClaude]\x1b[0m');
    await this.checkZuppaClaude();
    console.log('');

    // Components checks
    console.log('\x1b[36m[Components]\x1b[0m');
    await this.checkSuperClaude();
    this.checkSpecKit();
    this.checkClaudeZ();
    this.checkClaudeHUD();
    this.checkRclone();
    this.checkZCCommands();
    console.log('');

    // Dependencies
    console.log('\x1b[36m[Dependencies]\x1b[0m');
    this.checkGit();
    this.checkPython();
    console.log('');

    // Environment
    console.log('\x1b[36m[Environment]\x1b[0m');
    this.checkEnvVariables();
    console.log('');

    // Summary
    this.printSummary();
  }

  /**
   * Check OS information
   */
  checkOS() {
    const osName = this.platform.isMac ? 'macOS' : this.platform.isWindows ? 'Windows' : 'Linux';
    const arch = os.arch();
    const release = os.release();
    this.pass(`OS: ${osName} ${release} (${arch})`);
  }

  /**
   * Check Node.js version
   */
  checkNodeVersion() {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);

    if (major >= 18) {
      this.pass(`Node.js: ${version}`);
    } else {
      this.fail(`Node.js: ${version} (requires 18+)`);
    }
  }

  /**
   * Check disk space
   */
  checkDiskSpace() {
    try {
      const homeDir = os.homedir();
      let freeGB;

      if (this.platform.isWindows) {
        const drive = homeDir.charAt(0);
        const output = execSync(`wmic logicaldisk where "DeviceID='${drive}:'" get freespace`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        });
        const bytes = parseInt(output.split('\n')[1].trim());
        freeGB = (bytes / (1024 ** 3)).toFixed(1);
      } else {
        const output = execSync('df -k "$HOME" | tail -1 | awk \'{print $4}\'', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        });
        const kb = parseInt(output.trim());
        freeGB = (kb / (1024 ** 2)).toFixed(1);
      }

      if (parseFloat(freeGB) > 1) {
        this.pass(`Disk Space: ${freeGB} GB free`);
      } else {
        this.warn(`Disk Space: ${freeGB} GB free (low)`);
      }
    } catch {
      this.warn('Disk Space: Unable to check');
    }
  }

  /**
   * Check Claude Code installation and version
   */
  async checkClaudeCode() {
    if (!this.platform.commandExists('claude')) {
      this.fail('Claude Code: Not installed');
      return;
    }

    try {
      const version = execSync('claude --version', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim();

      // Extract version number
      const match = version.match(/(\d+\.\d+\.\d+)/);
      const currentVersion = match ? match[1] : version;

      // Check for updates
      const latestVersion = await this.getLatestClaudeVersion();

      if (latestVersion && this.isNewerVersion(latestVersion, currentVersion)) {
        this.warn(`Claude Code: v${currentVersion} (update available: v${latestVersion})`);
      } else {
        this.pass(`Claude Code: v${currentVersion}`);
      }

      // Check Claude directory
      if (fs.existsSync(this.platform.claudeDir)) {
        this.pass(`Claude Directory: ${this.platform.claudeDir}`);
      } else {
        this.warn('Claude Directory: Not found');
      }
    } catch {
      this.warn('Claude Code: Unable to get version');
    }
  }

  /**
   * Get latest Claude Code version from npm
   */
  async getLatestClaudeVersion() {
    return new Promise((resolve) => {
      const url = 'https://registry.npmjs.org/@anthropic-ai/claude-code/latest';

      const req = https.get(url, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version);
          } catch {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  /**
   * Check ZuppaClaude installation
   */
  async checkZuppaClaude() {
    const pkg = require('../../package.json');
    const currentVersion = pkg.version;

    // Check for updates
    const latestVersion = await this.getLatestZuppaClaude();

    if (latestVersion && this.isNewerVersion(latestVersion, currentVersion)) {
      this.warn(`ZuppaClaude: v${currentVersion} (update available: v${latestVersion})`);
    } else {
      this.pass(`ZuppaClaude: v${currentVersion}`);
    }

    // Check settings
    const settings = this.settings.load();
    if (settings) {
      this.pass('Settings: Configured');
    } else {
      this.info('Settings: Not configured');
    }
  }

  /**
   * Get latest ZuppaClaude version from npm
   */
  async getLatestZuppaClaude() {
    return new Promise((resolve) => {
      const url = 'https://registry.npmjs.org/zuppaclaude/latest';

      const req = https.get(url, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version);
          } catch {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  /**
   * Check SuperClaude installation
   */
  async checkSuperClaude() {
    const scDir = path.join(this.platform.commandsDir, 'sc');

    if (!fs.existsSync(scDir)) {
      this.info('SuperClaude: Not installed');
      return;
    }

    // Get installed version from package.json
    let installedVersion = null;
    const packageJsonPath = path.join(scDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        installedVersion = pkg.version;
      } catch {
        // Ignore
      }
    }

    // Count commands
    let commandCount = 0;
    try {
      const commandsDir = path.join(scDir, 'src', 'superclaude', 'commands');
      if (fs.existsSync(commandsDir)) {
        commandCount = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md')).length;
      }
    } catch {
      // Ignore
    }

    // Check for updates from npm
    const latestVersion = await this.getLatestSuperClaude();

    if (installedVersion && latestVersion && this.isNewerVersion(latestVersion, installedVersion)) {
      this.warn(`SuperClaude: v${installedVersion} (update available: v${latestVersion})`);
    } else if (installedVersion) {
      this.pass(`SuperClaude: v${installedVersion}${commandCount ? ` (${commandCount} commands)` : ''}`);
    } else if (commandCount) {
      this.pass(`SuperClaude: ${commandCount} commands`);
    } else {
      this.pass('SuperClaude: Installed');
    }
  }

  /**
   * Get latest SuperClaude version from npm
   */
  async getLatestSuperClaude() {
    return new Promise((resolve) => {
      const url = 'https://registry.npmjs.org/@bifrost_inc/superclaude/latest';

      const req = https.get(url, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version);
          } catch {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  /**
   * Check Spec Kit installation
   */
  checkSpecKit() {
    if (this.platform.commandExists('specify')) {
      try {
        const version = execSync('specify --version 2>/dev/null || echo "installed"', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        this.pass(`Spec Kit: ${version}`);
      } catch {
        this.pass('Spec Kit: Installed');
      }
    } else {
      this.info('Spec Kit: Not installed');
    }
  }

  /**
   * Check Claude-Z installation
   */
  checkClaudeZ() {
    const claudeZPath = path.join(this.platform.localBin, 'claude-z');

    if (fs.existsSync(claudeZPath)) {
      this.pass('Claude-Z: Installed');

      // Check API key config
      const configPath = path.join(this.platform.zaiConfigDir, 'config.json');
      if (fs.existsSync(configPath)) {
        this.pass('Claude-Z Config: Configured');
      } else {
        this.warn('Claude-Z Config: Not configured');
      }
    } else {
      this.info('Claude-Z: Not installed');
    }
  }

  /**
   * Check Claude HUD installation
   */
  checkClaudeHUD() {
    const hudDir = path.join(this.platform.configDir, 'claude-hud');

    if (fs.existsSync(hudDir)) {
      this.pass('Claude HUD: Installed');

      // Check if configured in Claude settings
      const claudeSettingsPath = path.join(this.platform.claudeDir, 'settings.json');
      if (fs.existsSync(claudeSettingsPath)) {
        try {
          const settings = JSON.parse(fs.readFileSync(claudeSettingsPath, 'utf8'));
          if (settings.env?.CLAUDE_CODE_ENABLE_STATUSLINE === 'true') {
            this.pass('Claude HUD: Enabled in settings');
          } else {
            this.warn('Claude HUD: Not enabled in settings');
          }
        } catch {
          this.info('Claude HUD: Settings check failed');
        }
      }
    } else {
      this.info('Claude HUD: Not installed');
    }
  }

  /**
   * Check rclone installation
   */
  checkRclone() {
    if (this.platform.commandExists('rclone')) {
      try {
        const version = execSync('rclone --version 2>/dev/null | head -1', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        this.pass(`rclone: ${version}`);

        // Check configured remotes
        const remotes = execSync('rclone listremotes 2>/dev/null', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();

        if (remotes) {
          const count = remotes.split('\n').filter(r => r.trim()).length;
          this.pass(`rclone Remotes: ${count} configured`);
        } else {
          this.info('rclone Remotes: None configured');
        }
      } catch {
        this.pass('rclone: Installed');
      }
    } else {
      this.info('rclone: Not installed');
    }
  }

  /**
   * Check ZC Commands installation
   */
  checkZCCommands() {
    const zcDir = path.join(this.platform.commandsDir, 'zc');

    if (fs.existsSync(zcDir)) {
      try {
        const files = fs.readdirSync(zcDir).filter(f => f.endsWith('.md'));
        this.pass(`ZC Commands: ${files.length} commands`);
      } catch {
        this.pass('ZC Commands: Installed');
      }
    } else {
      this.info('ZC Commands: Not installed');
    }
  }

  /**
   * Check Git installation
   */
  checkGit() {
    if (this.platform.commandExists('git')) {
      try {
        const version = execSync('git --version', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        this.pass(`Git: ${version.replace('git version ', 'v')}`);
      } catch {
        this.pass('Git: Installed');
      }
    } else {
      this.warn('Git: Not installed (some features may not work)');
    }
  }

  /**
   * Check Python installation
   */
  checkPython() {
    const pythonCmd = this.platform.getPythonCommand();

    if (pythonCmd) {
      try {
        const version = execSync(`${pythonCmd} --version`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        this.pass(`Python: ${version.replace('Python ', 'v')}`);
      } catch {
        this.pass(`Python: Installed (${pythonCmd})`);
      }
    } else {
      this.info('Python: Not installed (Spec Kit requires Python)');
    }

    // Check pip
    const pipCmd = this.platform.getPipCommand();
    if (pipCmd) {
      this.pass(`Pip: ${pipCmd.split(' ')[0]}`);
    }
  }

  /**
   * Check environment variables
   */
  checkEnvVariables() {
    const envVars = [
      { name: 'ANTHROPIC_API_KEY', sensitive: true },
      { name: 'CLAUDE_CODE_TMPDIR', sensitive: false },
      { name: 'CLAUDE_CODE_DISABLE_BACKGROUND_TASKS', sensitive: false }
    ];

    for (const env of envVars) {
      const value = process.env[env.name];
      if (value) {
        if (env.sensitive) {
          this.pass(`${env.name}: Set (***)`);
        } else {
          this.pass(`${env.name}: ${value}`);
        }
      } else {
        this.info(`${env.name}: Not set`);
      }
    }
  }

  /**
   * Compare versions (returns true if latest > current)
   */
  isNewerVersion(latest, current) {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if ((latestParts[i] || 0) > (currentParts[i] || 0)) return true;
      if ((latestParts[i] || 0) < (currentParts[i] || 0)) return false;
    }
    return false;
  }

  /**
   * Log pass
   */
  pass(message) {
    console.log(`  \x1b[32m✓\x1b[0m ${message}`);
    this.checks.push({ status: 'pass', message });
  }

  /**
   * Log warning
   */
  warn(message) {
    console.log(`  \x1b[33m!\x1b[0m ${message}`);
    this.warnings.push(message);
    this.checks.push({ status: 'warn', message });
  }

  /**
   * Log failure
   */
  fail(message) {
    console.log(`  \x1b[31m✗\x1b[0m ${message}`);
    this.errors.push(message);
    this.checks.push({ status: 'fail', message });
  }

  /**
   * Log info
   */
  info(message) {
    console.log(`  \x1b[90m-\x1b[0m ${message}`);
    this.checks.push({ status: 'info', message });
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                         Summary\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    const passed = this.checks.filter(c => c.status === 'pass').length;
    const warned = this.warnings.length;
    const failed = this.errors.length;

    console.log(`  \x1b[32mPassed:\x1b[0m   ${passed}`);
    console.log(`  \x1b[33mWarnings:\x1b[0m ${warned}`);
    console.log(`  \x1b[31mFailed:\x1b[0m   ${failed}`);
    console.log('');

    if (failed > 0) {
      console.log('  \x1b[31mIssues found:\x1b[0m');
      for (const error of this.errors) {
        console.log(`    - ${error}`);
      }
      console.log('');
    }

    if (warned > 0) {
      console.log('  \x1b[33mWarnings:\x1b[0m');
      for (const warning of this.warnings) {
        console.log(`    - ${warning}`);
      }
      console.log('');
    }

    if (failed === 0 && warned === 0) {
      console.log('  \x1b[32mAll checks passed! Your system is healthy.\x1b[0m');
      console.log('');
    } else if (failed === 0) {
      console.log('  \x1b[33mSystem is functional with minor warnings.\x1b[0m');
      console.log('');
    } else {
      console.log('  \x1b[31mSome issues need attention.\x1b[0m');
      console.log('');
    }
  }
}

module.exports = { DoctorManager };
