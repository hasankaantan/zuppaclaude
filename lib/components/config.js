/**
 * Configuration (CLAUDE.md) installer
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

// Bundled CLAUDE.md path (in npm package)
const BUNDLED_CONFIG = path.join(__dirname, '../../assets/CLAUDE.md');

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

      // Copy bundled CLAUDE.md
      if (fs.existsSync(BUNDLED_CONFIG)) {
        fs.copyFileSync(BUNDLED_CONFIG, this.configPath);
        this.logger.success('CLAUDE.md installed');
        return true;
      }

      // Fallback if bundled file not found
      this.logger.warning('Bundled config not found, creating fallback...');
      const fallbackConfig = this.getFallbackConfig();
      fs.writeFileSync(this.configPath, fallbackConfig, 'utf8');
      this.logger.success('Fallback CLAUDE.md created');
      return true;
    } catch (error) {
      this.logger.error(`Failed to install config: ${error.message}`);
      return false;
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
