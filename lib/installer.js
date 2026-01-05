/**
 * ZuppaClaude Main Installer
 */

const { Logger } = require('./utils/logger');
const { Platform } = require('./utils/platform');
const { Prompts } = require('./utils/prompts');
const { Settings } = require('./settings');
const {
  SuperClaudeInstaller,
  SpecKitInstaller,
  ConfigInstaller,
  ClaudeZInstaller,
  ClaudeHUDInstaller
} = require('./components');

class Installer {
  constructor() {
    this.logger = new Logger();
    this.platform = new Platform();
    this.prompts = new Prompts();
    this.settings = new Settings();

    // Component installers
    this.superClaude = new SuperClaudeInstaller();
    this.specKit = new SpecKitInstaller();
    this.config = new ConfigInstaller();
    this.claudeZ = new ClaudeZInstaller();
    this.claudeHUD = new ClaudeHUDInstaller();
  }

  /**
   * Run the installer
   */
  async run() {
    this.logger.banner();

    // Step 1: Check dependencies
    this.logger.step('Step 1/7: Checking Dependencies');
    const depsOk = await this.checkDependencies();
    if (!depsOk) {
      this.logger.error('Dependency check failed. Please install required dependencies.');
      return false;
    }

    // Load existing settings
    const existingSettings = this.settings.load();
    let useExisting = false;

    if (existingSettings) {
      this.logger.info('Found existing settings from previous installation');
      useExisting = await this.prompts.confirm('Use previous settings?', true);
    }

    // Step 2: Install SuperClaude
    const scInstalled = await this.superClaude.install();

    // Step 3: Install Spec Kit
    let installSpecKit = true;
    if (useExisting && existingSettings.specKit !== undefined) {
      installSpecKit = existingSettings.specKit;
    } else {
      installSpecKit = await this.prompts.confirm('Install Spec Kit (specify-cli)?', true);
    }

    let skInstalled = false;
    if (installSpecKit) {
      skInstalled = await this.specKit.install();
    } else {
      this.logger.info('Skipping Spec Kit installation');
    }

    // Step 4: Install Configuration
    const cfgInstalled = await this.config.install();

    // Step 5: Install Claude-Z (optional)
    let installClaudeZ = false;
    let zaiApiKey = null;

    if (useExisting && existingSettings.claudeZ) {
      installClaudeZ = true;
      zaiApiKey = this.settings.decodeApiKey(existingSettings.zaiApiKey);
      this.logger.info('Using saved Z.AI API key');
    } else {
      installClaudeZ = await this.prompts.confirm('Install Claude-Z (z.ai backend)?', false);
      if (installClaudeZ) {
        zaiApiKey = await this.prompts.password('Enter your Z.AI API key:');
      }
    }

    let czInstalled = false;
    if (installClaudeZ && zaiApiKey) {
      czInstalled = await this.claudeZ.install(zaiApiKey);
    } else {
      this.logger.info('Skipping Claude-Z installation');
    }

    // Step 6: Install Claude HUD (optional)
    let installClaudeHUD = true;
    if (useExisting && existingSettings.claudeHUD !== undefined) {
      installClaudeHUD = existingSettings.claudeHUD;
    } else {
      installClaudeHUD = await this.prompts.confirm('Install Claude HUD (status display)?', true);
    }

    let hudInstalled = false;
    if (installClaudeHUD) {
      hudInstalled = await this.claudeHUD.install();
    } else {
      this.logger.info('Skipping Claude HUD installation');
    }

    // Step 7: Verification
    this.logger.step('Step 7/7: Verifying Installation');
    console.log('');

    this.superClaude.verify();
    if (installSpecKit) this.specKit.verify();
    this.config.verify();
    if (installClaudeZ) this.claudeZ.verify();
    if (installClaudeHUD) this.claudeHUD.verify();

    // Save settings
    const newSettings = {
      specKit: installSpecKit,
      claudeZ: installClaudeZ,
      claudeHUD: installClaudeHUD,
      zaiApiKey: zaiApiKey ? this.settings.encodeApiKey(zaiApiKey) : null,
      installedAt: new Date().toISOString(),
      version: require('../package.json').version
    };

    this.settings.save(newSettings);
    this.logger.success('Settings saved');

    // Print summary
    this.printSummary({
      superClaude: scInstalled,
      specKit: skInstalled,
      config: cfgInstalled,
      claudeZ: czInstalled,
      claudeHUD: hudInstalled
    });

    return true;
  }

  /**
   * Check dependencies
   */
  async checkDependencies() {
    let allOk = true;

    // Check Node.js version
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (major >= 16) {
      this.logger.success(`Node.js: ${nodeVersion}`);
    } else {
      this.logger.error(`Node.js: ${nodeVersion} (requires 16+)`);
      allOk = false;
    }

    // Check Claude Code
    if (this.platform.commandExists('claude')) {
      const version = this.platform.exec('claude --version', { silent: true });
      this.logger.success(`Claude Code: ${version?.trim() || 'installed'}`);
    } else {
      this.logger.error('Claude Code: Not found');
      this.logger.info('Install with: npm install -g @anthropic-ai/claude-code');
      allOk = false;
    }

    // Check git (optional but recommended)
    if (this.platform.commandExists('git')) {
      this.logger.success('Git: Available');
    } else {
      this.logger.warning('Git: Not found (will use ZIP fallback)');
    }

    // Check Python (for Spec Kit)
    const pipCmd = this.platform.getPipCommand();
    if (pipCmd) {
      this.logger.success(`Python: Available (${pipCmd.split(' ')[0]})`);
    } else {
      this.logger.warning('Python: Not found (Spec Kit will be skipped)');
    }

    console.log('');
    return allOk;
  }

  /**
   * Print installation summary
   */
  printSummary(results) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('                    Installation Complete');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');

    const components = [
      { name: 'SuperClaude', installed: results.superClaude },
      { name: 'Spec Kit', installed: results.specKit },
      { name: 'CLAUDE.md', installed: results.config },
      { name: 'Claude-Z', installed: results.claudeZ },
      { name: 'Claude HUD', installed: results.claudeHUD }
    ];

    let installed = 0;
    for (const comp of components) {
      const status = comp.installed ? '✓' : '✗';
      const color = comp.installed ? '\x1b[32m' : '\x1b[31m';
      console.log(`  ${color}[${status}]\x1b[0m ${comp.name}`);
      if (comp.installed) installed++;
    }

    console.log('');
    console.log(`  Components installed: ${installed}/${components.length}`);
    console.log('');

    console.log('  Next steps:');
    console.log('  1. Restart your terminal or run: source ~/.bashrc');
    console.log('  2. Start Claude Code: claude');
    console.log('  3. Try: /sc:help');
    console.log('');

    if (results.claudeZ) {
      console.log('  For z.ai backend: claude-z');
      console.log('');
    }

    if (results.claudeHUD) {
      console.log('  For Claude HUD: run setup-claude-hud');
      console.log('');
    }
  }
}

module.exports = { Installer };
