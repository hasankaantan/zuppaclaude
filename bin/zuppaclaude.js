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

/**
 * Extract --cloud <remote> argument
 */
function getCloudArg(args) {
  const cloudIndex = args.indexOf('--cloud');
  if (cloudIndex !== -1 && args[cloudIndex + 1]) {
    return args[cloudIndex + 1];
  }
  return null;
}

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

      case 'backup':
        const { BackupManager } = require('../lib/components/backup');
        const backupMgr = new BackupManager();
        const cloudArg = getCloudArg(args);
        await backupMgr.backup({ cloud: cloudArg });
        break;

      case 'restore':
        const { BackupManager: RestoreBackupManager } = require('../lib/components/backup');
        const restoreMgr = new RestoreBackupManager();
        const restoreId = args[1];
        const restoreCloud = getCloudArg(args);

        if (!restoreId || restoreId.startsWith('--')) {
          logger.error('Please specify backup ID');
          logger.info('Usage: zuppaclaude restore <backup-id> [--cloud <remote>]');
          logger.info('Run "zuppaclaude backup list" to see available backups');
          process.exit(1);
        }

        await restoreMgr.restore(restoreId, { cloud: restoreCloud });
        break;

      case 'cloud':
        const { CloudManager } = require('../lib/components/cloud');
        const cloudMgr = new CloudManager();
        const cloudCmd = args[1] || 'remotes';
        const cloudRemote = args[2];

        switch (cloudCmd) {
          case 'setup':
            cloudMgr.showSetupInstructions();
            break;
          case 'remotes':
          case 'list':
            cloudMgr.listRemotes();
            break;
          case 'upload':
            if (!cloudRemote) {
              logger.error('Please specify remote');
              logger.info('Usage: zuppaclaude cloud upload <remote> [backup-id]');
              process.exit(1);
            }
            await cloudMgr.upload(cloudRemote, args[3]);
            break;
          case 'download':
            if (!cloudRemote) {
              logger.error('Please specify remote');
              logger.info('Usage: zuppaclaude cloud download <remote> [backup-id]');
              process.exit(1);
            }
            await cloudMgr.download(cloudRemote, args[3]);
            break;
          case 'backups':
            if (!cloudRemote) {
              logger.error('Please specify remote');
              logger.info('Usage: zuppaclaude cloud backups <remote>');
              process.exit(1);
            }
            await cloudMgr.listCloudBackups(cloudRemote);
            break;
          default:
            logger.error(`Unknown cloud command: ${cloudCmd}`);
            showCloudHelp();
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
  backup              Full backup (sessions + settings) with cloud support
  restore             Restore from backup
  settings, s         Manage settings
  session             Manage Claude Code sessions
  cloud               Manage cloud remotes (rclone)
  version, v          Show version
  help, h             Show this help

Backup Commands:
  backup                         Local backup (sessions + settings)
  backup --cloud <remote>        Backup and upload to cloud
  restore <id>                   Restore from local backup
  restore <id> --cloud <remote>  Download and restore from cloud

Cloud Commands:
  cloud setup          Show rclone setup instructions
  cloud remotes        List configured remotes
  cloud upload <r>     Upload backups to remote
  cloud download <r>   Download backups from remote
  cloud backups <r>    List cloud backups

Session Commands:
  session list         List all sessions
  session backup       Backup sessions only
  session backups      List available backups
  session restore      Restore sessions only
  session export       Export a specific session

Examples:
  npx zuppaclaude                              # Install
  npx zuppaclaude backup                       # Full local backup
  npx zuppaclaude backup --cloud gdrive        # Backup to Google Drive
  npx zuppaclaude restore 2026-01-05T12-00-00  # Restore from backup
  npx zuppaclaude cloud setup                  # Configure cloud
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

function showCloudHelp() {
  console.log(`
Cloud Commands (requires rclone):
  setup      Show rclone installation and configuration instructions
  remotes    List configured cloud remotes
  upload     Upload backups to a cloud remote
  download   Download backups from a cloud remote
  backups    List backups stored on a cloud remote

Examples:
  zuppaclaude cloud setup                    # Setup instructions
  zuppaclaude cloud remotes                  # List remotes
  zuppaclaude cloud upload gdrive            # Upload all backups
  zuppaclaude cloud download gdrive          # Download all backups
  zuppaclaude cloud backups gdrive           # List cloud backups

Supported providers (via rclone):
  Google Drive, Dropbox, OneDrive, S3, SFTP, FTP, and 40+ more
`);
}

main();
