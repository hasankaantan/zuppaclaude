# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.24] - 2025-01-10

### Added
- Windows winget installation option in README

### Changed
- Updated Windows installation instructions to recommend winget

## [1.3.23] - 2025-01-10

### Added
- Windows Package Manager (winget) support for Claude Code installation
- Platform-aware installation suggestions in dependency checker

## [1.3.22] - 2025-01-10

### Changed
- Updated Node.js requirement from 16+ to 18+ (Claude Code v2.x requirement)
- Added Homebrew and curl installation options for macOS
- Added PowerShell script option for Windows
- Updated README requirements tables (TR/EN)

## [1.3.21] - 2025-01-05

### Added
- Multi-device backup support with hostname/username paths
- Backups now stored under `backups/{hostname}/{username}/`

### Changed
- Updated CLAUDE.md with current architecture documentation

## [1.3.20] - 2025-01-05

### Fixed
- Made /zc: commands more directive with IMMEDIATELY keyword
- Simplified /zc: commands to direct execution

## [1.3.19] - 2025-01-05

### Added
- Claude HUD auto-installation and activation
- Improved HUD setup and prompt defaults

### Fixed
- Settings structure for components
- Uninstall confirmation now defaults to Yes
- Claude-Z auto-handles auth conflict

## [1.3.18] - 2025-01-04

### Fixed
- Uses bundled CLAUDE.md instead of downloading from GitHub
- Added missing CLAUDE.md to assets folder
- Settings deletion in uninstaller now works correctly
- Closes readline interface after install/uninstall
- Corrected cloud backup path display in summary

## [1.3.6] - 2025-01-04

### Added
- Cloud backup delete command

## [1.3.5] - 2025-01-04

### Added
- Improved backup system with readable dates
- Zip compression for backups

## [1.3.4] - 2025-01-03

### Added
- Auto-update feature with startup check

## [1.3.3] - 2025-01-03

### Added
- Cloud provider configuration during install

## [1.3.2] - 2025-01-03

### Changed
- Made SuperClaude installation optional

## [1.3.1] - 2025-01-02

### Added
- rclone cloud backup integration
- Support for Google Drive, Dropbox, S3, and 40+ cloud services

## [1.3.0] - 2025-01-02

### Added
- ZuppaClaude slash commands (/zc:backup, /zc:restore, /zc:cloud, etc.)
- Session management features
- Full backup system (sessions + settings + history)

## [1.2.0] - 2025-01-01

### Added
- Claude HUD (real-time statusline) component
- Settings persistence system

## [1.1.0] - 2024-12-30

### Added
- Claude-Z (z.ai backend) integration
- MCP server configuration for z.ai

## [1.0.0] - 2024-12-28

### Added
- Initial release
- SuperClaude framework installer (30+ slash commands)
- Spec Kit installer (spec-driven development CLI)
- CLAUDE.md system instructions installer
- Cross-platform support (macOS, Linux, Windows)
