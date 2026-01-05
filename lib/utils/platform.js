/**
 * Platform detection and utilities
 */

const os = require('os');
const path = require('path');
const { execSync, spawn } = require('child_process');
const fs = require('fs');

class Platform {
  constructor() {
    this.platform = os.platform();
    this.homedir = os.homedir();
    this._hostname = null;
    this._username = null;
  }

  /**
   * Get sanitized hostname (computer name)
   * Works on macOS, Linux, and Windows
   */
  get hostname() {
    if (this._hostname) return this._hostname;

    let name = os.hostname();

    // Remove .local suffix on macOS
    name = name.replace(/\.local$/, '');

    // Sanitize: lowercase, replace spaces/special chars with dash
    name = name.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    this._hostname = name || 'unknown-host';
    return this._hostname;
  }

  /**
   * Get current username
   * Works on macOS, Linux, and Windows
   */
  get username() {
    if (this._username) return this._username;

    let name = os.userInfo().username;

    // Sanitize: lowercase, replace spaces/special chars with dash
    name = name.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    this._username = name || 'unknown-user';
    return this._username;
  }

  /**
   * Get backup base path: backups/{hostname}/{username}
   */
  get backupBasePath() {
    return path.join(this.zuppaconfigDir, 'backups', this.hostname, this.username);
  }

  get isWindows() {
    return this.platform === 'win32';
  }

  get isMac() {
    return this.platform === 'darwin';
  }

  get isLinux() {
    return this.platform === 'linux';
  }

  get claudeDir() {
    return path.join(this.homedir, '.claude');
  }

  get commandsDir() {
    return path.join(this.claudeDir, 'commands');
  }

  get localBin() {
    return path.join(this.homedir, '.local', 'bin');
  }

  get configDir() {
    return path.join(this.homedir, '.config');
  }

  get zaiConfigDir() {
    return path.join(this.configDir, 'zai');
  }

  get zuppaconfigDir() {
    return path.join(this.configDir, 'zuppaclaude');
  }

  /**
   * Check if a command exists
   */
  commandExists(command) {
    try {
      if (this.isWindows) {
        execSync(`where ${command}`, { stdio: 'ignore' });
      } else {
        execSync(`which ${command}`, { stdio: 'ignore' });
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute a command and return output
   */
  exec(command, options = {}) {
    try {
      return execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options,
      });
    } catch (error) {
      if (options.throwOnError !== false) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Execute a command asynchronously
   */
  execAsync(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        stdio: options.silent ? 'pipe' : 'inherit',
        shell: true,
        ...options,
      });

      let stdout = '';
      let stderr = '';

      if (proc.stdout) {
        proc.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }

      if (proc.stderr) {
        proc.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
        }
      });

      proc.on('error', reject);
    });
  }

  /**
   * Ensure directory exists
   */
  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Get Python command (python3 or python)
   */
  getPythonCommand() {
    if (this.commandExists('python3')) return 'python3';
    if (this.commandExists('python')) return 'python';
    return null;
  }

  /**
   * Get pip command (pip3, pip, or via python -m pip)
   */
  getPipCommand() {
    if (this.commandExists('uv')) return 'uv tool install';
    if (this.commandExists('pipx')) return 'pipx install';
    if (this.commandExists('pip3')) return 'pip3 install --user';
    if (this.commandExists('pip')) return 'pip install --user';
    const python = this.getPythonCommand();
    if (python) return `${python} -m pip install --user`;
    return null;
  }

  /**
   * Get pip uninstall command
   */
  getPipUninstallCommand() {
    if (this.commandExists('uv')) return 'uv tool uninstall';
    if (this.commandExists('pipx')) return 'pipx uninstall';
    if (this.commandExists('pip3')) return 'pip3 uninstall -y';
    if (this.commandExists('pip')) return 'pip uninstall -y';
    const python = this.getPythonCommand();
    if (python) return `${python} -m pip uninstall -y`;
    return null;
  }

  /**
   * Download a file
   */
  async download(url, destPath) {
    const https = require('https');
    const http = require('http');

    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(destPath);

      const request = protocol.get(url, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close();
          fs.unlinkSync(destPath);
          this.download(response.headers.location, destPath)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(destPath);
        });
      });

      request.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });

      file.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });
  }
}

module.exports = { Platform };
