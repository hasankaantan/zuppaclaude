/**
 * ZuppaClaude - Claude Code Enhancement Installer
 */

const { Installer } = require('./installer');
const { Uninstaller } = require('./uninstaller');
const { Settings } = require('./settings');
const { Logger } = require('./utils/logger');
const { Platform } = require('./utils/platform');

module.exports = {
  Installer,
  Uninstaller,
  Settings,
  Logger,
  Platform
};
