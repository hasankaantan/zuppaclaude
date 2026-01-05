/**
 * Component installers index
 */

const { SuperClaudeInstaller } = require('./superclaude');
const { SpecKitInstaller } = require('./speckit');
const { ConfigInstaller } = require('./config');
const { ClaudeZInstaller } = require('./claudez');
const { ClaudeHUDInstaller } = require('./claudehud');
const { SessionManager } = require('./session');

module.exports = {
  SuperClaudeInstaller,
  SpecKitInstaller,
  ConfigInstaller,
  ClaudeZInstaller,
  ClaudeHUDInstaller,
  SessionManager
};
