/**
 * Component installers index
 */

const { SuperClaudeInstaller } = require('./superclaude');
const { SpecKitInstaller } = require('./speckit');
const { ConfigInstaller } = require('./config');
const { ClaudeZInstaller } = require('./claudez');
const { ClaudeHUDInstaller } = require('./claudehud');
const { SessionManager } = require('./session');
const { CloudManager } = require('./cloud');
const { BackupManager } = require('./backup');
const { CommandsInstaller } = require('./commands');
const { UpdateManager } = require('./updater');
const { RalphManager } = require('./ralph');

module.exports = {
  SuperClaudeInstaller,
  SpecKitInstaller,
  ConfigInstaller,
  ClaudeZInstaller,
  ClaudeHUDInstaller,
  SessionManager,
  CloudManager,
  BackupManager,
  CommandsInstaller,
  UpdateManager,
  RalphManager
};
