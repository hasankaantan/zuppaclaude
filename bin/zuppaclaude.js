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

      case 'session':
      case 'sessions':
        const { SessionManager } = require('../lib/components/session');
        const sessionManager = new SessionManager();
        const sessionCmd = args[1] || 'list';
        const sessionArg = args[2];

        switch (sessionCmd) {
          case 'list':
          case 'ls':
            sessionManager.list();
            break;
          case 'backup':
          case 'save':
            sessionManager.backup();
            break;
          case 'backups':
            sessionManager.listBackups();
            break;
          case 'restore':
            if (!sessionArg) {
              logger.error('Please specify backup ID');
              logger.info('Usage: zuppaclaude session restore <backup-id>');
              logger.info('Run "zuppaclaude session backups" to see available backups');
              process.exit(1);
            }
            sessionManager.restore(sessionArg);
            break;
          case 'export':
            if (!sessionArg) {
              logger.error('Please specify session ID');
              logger.info('Usage: zuppaclaude session export <session-id> [output-file]');
              logger.info('Run "zuppaclaude session list" to see session IDs');
              process.exit(1);
            }
            sessionManager.export(sessionArg, args[3]);
            break;
          default:
            logger.error(`Unknown session command: ${sessionCmd}`);
            showSessionHelp();
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
  session             Manage Claude Code sessions
  version, v          Show version
  help, h             Show this help

Settings Commands:
  settings show       Display current settings
  settings export     Export settings to file
  settings import     Import settings from file
  settings reset      Reset settings to default
  settings path       Show settings file path

Session Commands:
  session list        List all sessions
  session backup      Backup all sessions
  session backups     List available backups
  session restore     Restore from backup
  session export      Export a specific session

Examples:
  npx zuppaclaude                    # Install
  npx zuppaclaude install            # Install
  npx zuppaclaude uninstall          # Uninstall
  npx zuppaclaude settings show      # View settings
  npx zuppaclaude session backup     # Backup sessions
  npx zuppaclaude session restore 2026-01-05T12-00-00
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

function showSessionHelp() {
  console.log(`
Session Commands:
  list       List all Claude Code sessions
  backup     Backup all sessions to ~/.config/zuppaclaude/backups/
  backups    List available backups
  restore    Restore sessions from a backup
  export     Export a specific session to a file

Examples:
  zuppaclaude session list
  zuppaclaude session backup
  zuppaclaude session backups
  zuppaclaude session restore 2026-01-05T12-00-00
  zuppaclaude session export abc123 ./my-session.jsonl
`);
}

main();
