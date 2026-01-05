/**
 * Configuration (CLAUDE.md) installer
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

const CONFIG_URL = 'https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/assets/CLAUDE.md';

class ConfigInstaller {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.configPath = path.join(this.platform.claudeDir, 'CLAUDE.md');
  }

  /**
   * Check if config is installed
   */
  isInstalled() {
    return fs.existsSync(this.configPath);
  }

  /**
   * Install CLAUDE.md configuration
   */
  async install() {
    this.logger.step('Step 4/7: Installing Configuration');

    try {
      this.platform.ensureDir(this.platform.claudeDir);

      // Backup existing config
      if (this.isInstalled()) {
        const timestamp = Date.now();
        const backupPath = `${this.configPath}.backup.${timestamp}`;
        fs.copyFileSync(this.configPath, backupPath);
        this.logger.info(`Existing config backed up to: ${backupPath}`);
      }

      // Download CLAUDE.md
      this.logger.info('Downloading CLAUDE.md...');
      await this.platform.download(CONFIG_URL, this.configPath);

      this.logger.success('CLAUDE.md installed');
      return true;
    } catch (error) {
      this.logger.error(`Failed to install config: ${error.message}`);

      // Create a basic fallback config
      try {
        this.logger.info('Creating fallback configuration...');
        const fallbackConfig = this.getFallbackConfig();
        fs.writeFileSync(this.configPath, fallbackConfig, 'utf8');
        this.logger.success('Fallback CLAUDE.md created');
        return true;
      } catch (fallbackError) {
        this.logger.error(`Failed to create fallback config: ${fallbackError.message}`);
        return false;
      }
    }
  }

  /**
   * Get fallback configuration
   */
  getFallbackConfig() {
    return `# Claude Code - Enhanced System Instructions

## General Behavior
- Be proactive: After analysis ask "Should I implement?" or "Let's start?"
- Provide summary report when done (commit hash, changes, line count)
- Don't ask open-ended questions, suggest the best option

## SuperClaude Framework (Active)
SuperClaude slash commands are loaded. Use them proactively:

### Planning & Design
- \`/sc:brainstorm\` - Idea development and brainstorming
- \`/sc:design\` - Architectural design
- \`/sc:estimate\` - Time/resource estimation

### Development
- \`/sc:implement\` - Code implementation
- \`/sc:build\` - Build and compile
- \`/sc:improve\` - Code improvement
- \`/sc:explain\` - Code explanation

### Testing & Quality
- \`/sc:test\` - Test creation
- \`/sc:analyze\` - Code analysis
- \`/sc:troubleshoot\` - Debugging

### Project Management
- \`/sc:task\` - Task management
- \`/sc:workflow\` - Workflow management
- \`/sc:pm\` - Project management

## Response Format
- Short and concise answers
- Use Markdown formatting
- Specify language for code blocks
`;
  }

  /**
   * Uninstall config
   */
  uninstall() {
    if (!this.isInstalled()) {
      this.logger.warning('CLAUDE.md not found');
      return true;
    }

    try {
      const timestamp = Date.now();
      const backupPath = `${this.configPath}.uninstall.${timestamp}`;
      fs.renameSync(this.configPath, backupPath);
      this.logger.success(`CLAUDE.md backed up to: ${backupPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to backup CLAUDE.md: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify installation
   */
  verify() {
    if (this.isInstalled()) {
      this.logger.success('CLAUDE.md: Installed');
      return true;
    } else {
      this.logger.error('CLAUDE.md: Not installed');
      return false;
    }
  }
}

module.exports = { ConfigInstaller };
