#!/usr/bin/env node

/**
 * ZuppaClaude CLI
 * Claude Code power-up installer
 */

const { Installer } = require('../lib/installer');
const { Settings } = require('../lib/settings');
const { Logger } = require('../lib/utils/logger');

const args = process.argv.slice(2);
const command = args[0] || 'install';

async function main() {
  const logger = new Logger();

  logger.banner();

  try {
    switch (command) {
      case 'install':
      case 'i':
        const installer = new Installer();
        await installer.run();
        break;

      case 'uninstall':
      case 'remove':
      case 'u':
        const { Uninstaller } = require('../lib/uninstaller');
        const uninstaller = new Uninstaller();
        await uninstaller.run();
        break;

      case 'settings':
      case 's':
        const settings = new Settings();
        const subCommand = args[1] || 'show';
        const filePath = args[2];

        switch (subCommand) {
          case 'show':
            settings.show();
            break;
          case 'export':
            if (!filePath) {
              logger.error('Please specify export file path');
              logger.info('Usage: zuppaclaude settings export <file>');
              process.exit(1);
            }
            settings.export(filePath);
            break;
          case 'import':
            if (!filePath) {
              logger.error('Please specify import file path');
              logger.info('Usage: zuppaclaude settings import <file>');
              process.exit(1);
            }
            settings.import(filePath);
            break;
          case 'reset':
            await settings.reset();
            break;
          case 'path':
            console.log(settings.filePath);
            break;
          default:
            logger.error(`Unknown settings command: ${subCommand}`);
            showSettingsHelp();
        }
        break;

      case 'version':
      case 'v':
      case '-v':
      case '--version':
        const pkg = require('../package.json');
        console.log(`zuppaclaude v${pkg.version}`);
        break;

      case 'help':
      case 'h':
      case '-h':
      case '--help':
        showHelp();
        break;

      default:
        logger.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Usage: zuppaclaude [command] [options]

Commands:
  install, i          Install ZuppaClaude components (default)
  uninstall, u        Uninstall ZuppaClaude components
  settings, s         Manage settings
  version, v          Show version
  help, h             Show this help

Settings Commands:
  settings show       Display current settings
  settings export     Export settings to file
  settings import     Import settings from file
  settings reset      Reset settings to default
  settings path       Show settings file path

Examples:
  npx zuppaclaude                    # Install
  npx zuppaclaude install            # Install
  npx zuppaclaude uninstall          # Uninstall
  npx zuppaclaude settings show      # View settings
  npx zuppaclaude settings export ~/backup.json
`);
}

function showSettingsHelp() {
  console.log(`
Settings Commands:
  show       Display current settings
  export     Export settings to file
  import     Import settings from file
  reset      Reset settings to default
  path       Show settings file path

Examples:
  zuppaclaude settings show
  zuppaclaude settings export ~/backup.json
  zuppaclaude settings import ~/backup.json
  zuppaclaude settings reset
`);
}

main();
