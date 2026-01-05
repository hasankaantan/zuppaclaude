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

module.exports = {
  SuperClaudeInstaller,
  SpecKitInstaller,
  ConfigInstaller,
  ClaudeZInstaller,
  ClaudeHUDInstaller,
  SessionManager,
  CloudManager,
  BackupManager
};
