/**
 * ZuppaClaude Uninstaller
 */

const { Logger } = require('./utils/logger');
const { Prompts } = require('./utils/prompts');
const { Settings } = require('./settings');
const {
  SuperClaudeInstaller,
  SpecKitInstaller,
  ConfigInstaller,
  ClaudeZInstaller,
  ClaudeHUDInstaller,
  CommandsInstaller
} = require('./components');

class Uninstaller {
  constructor() {
    this.logger = new Logger();
    this.prompts = new Prompts();
    this.settings = new Settings();

    // Component installers
    this.superClaude = new SuperClaudeInstaller();
    this.specKit = new SpecKitInstaller();
    this.config = new ConfigInstaller();
    this.claudeZ = new ClaudeZInstaller();
    this.claudeHUD = new ClaudeHUDInstaller();
    this.commands = new CommandsInstaller();
  }

  /**
   * Run the uninstaller
   */
  async run() {
    console.log('');
    console.log('\x1b[35m╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[35m║   ZuppaClaude Uninstaller                                         ║\x1b[0m');
    console.log('\x1b[35m╚═══════════════════════════════════════════════════════════════════╝\x1b[0m');
    console.log('');

    // Confirm uninstallation
    const confirm = await this.prompts.confirm('Are you sure you want to uninstall ZuppaClaude?', false);
    if (!confirm) {
      this.logger.info('Uninstallation cancelled');
      this.prompts.close();
      return false;
    }

    // Ask about settings preservation
    const preserveSettings = await this.prompts.confirm('Preserve settings for future reinstall?', true);

    console.log('');
    this.logger.info('Removing components...');
    console.log('');

    // Uninstall components
    const results = {
      superClaude: this.superClaude.uninstall(),
      specKit: this.specKit.uninstall(),
      config: this.config.uninstall(),
      claudeZ: this.claudeZ.uninstall(),
      claudeHUD: this.claudeHUD.uninstall(),
      commands: this.commands.uninstall()
    };

    // Handle settings
    if (!preserveSettings) {
      if (this.settings.delete()) {
        this.logger.success('Settings removed');
      }
    } else {
      this.logger.info('Settings preserved for future reinstall');
    }

    // Print summary
    this.printSummary(results, preserveSettings);

    // Close readline interface
    this.prompts.close();

    return true;
  }

  /**
   * Print uninstallation summary
   */
  printSummary(results, settingsPreserved) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('                    Uninstallation Complete');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');

    const components = [
      { name: 'SuperClaude', removed: results.superClaude },
      { name: 'Spec Kit', removed: results.specKit },
      { name: 'CLAUDE.md', removed: results.config },
      { name: 'Claude-Z', removed: results.claudeZ },
      { name: 'Claude HUD', removed: results.claudeHUD },
      { name: 'ZC Commands', removed: results.commands }
    ];

    let removed = 0;
    for (const comp of components) {
      const status = comp.removed ? '✓' : '○';
      const color = comp.removed ? '\x1b[32m' : '\x1b[33m';
      console.log(`  ${color}[${status}]\x1b[0m ${comp.name}`);
      if (comp.removed) removed++;
    }

    console.log('');
    console.log(`  Components removed: ${removed}/${components.length}`);
    console.log('');

    if (settingsPreserved) {
      console.log('  Settings preserved. Run "zuppaclaude install" to restore.');
    } else {
      console.log('  All settings have been removed.');
    }

    console.log('');
    console.log('  To reinstall: npx zuppaclaude install');
    console.log('');
  }
}

module.exports = { Uninstaller };
