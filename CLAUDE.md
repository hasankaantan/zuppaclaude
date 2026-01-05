# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

ZuppaClaude is an npm package that installs Claude Code enhancement tools:
- **SuperClaude**: 30+ slash commands framework
- **Spec Kit**: spec-driven development CLI (`specify`)
- **Claude-Z**: z.ai backend integration
- **Claude HUD**: real-time statusline display (auto-configured)
- **rclone**: cloud backup support (Google Drive, Dropbox, S3, etc.)
- **CLAUDE.md**: system instructions

## CLI Commands

```bash
npx zuppaclaude              # Install all components
npx zuppaclaude uninstall    # Remove components
npx zuppaclaude backup       # Backup sessions + settings
npx zuppaclaude backup --cloud gdrive  # Backup to cloud
npx zuppaclaude restore <id> # Restore from backup
npx zuppaclaude cloud remotes # List cloud remotes
npx zuppaclaude settings show # View settings
npx zuppaclaude update now   # Update to latest
npx zuppaclaude help         # Show all commands
```

## Architecture

### Key Directories
```
bin/                  # CLI entry point
lib/
  components/         # Feature installers
    backup.js         # Unified backup manager
    claudehud.js      # HUD auto-installer
    claudez.js        # z.ai backend
    cloud.js          # rclone cloud sync
    session.js        # Session management
    superclaude.js    # SuperClaude installer
    speckit.js        # Spec Kit installer
  utils/              # Shared utilities
    logger.js         # Console output
    platform.js       # OS detection
    prompts.js        # User input
  installer.js        # Main install flow
  uninstaller.js      # Removal flow
  settings.js         # Settings management
assets/
  CLAUDE.md           # Bundled config for users
  commands/zc/        # Slash command skills
```

### Install Flow (9 steps)
1. Dependency check (Node 16+, Claude Code CLI)
2. SuperClaude (git clone)
3. Spec Kit (pip3/pipx/uv)
4. CLAUDE.md (bundled copy)
5. Claude-Z (z.ai backend script)
6. Claude HUD (auto-clone, build, configure statusline)
7. rclone (cloud backup)
8. ZC Commands (slash command skills)
9. Settings save

### Settings Location
- Config: `~/.config/zuppaclaude/zc-settings.json`
- Backups: `~/.config/zuppaclaude/backups/`
- Claude HUD: `~/.claude/plugins/claude-hud/`
- Statusline: `~/.claude/settings.json`

## Development

```bash
node bin/zuppaclaude.js          # Run locally
npm version patch                # Bump version
npm publish --access public      # Publish to npm
```

## Git Commit Guidelines

Conventional Commits with present tense:

```
<type>: <description>

- bullet points with details
```

**Types**: feat, fix, docs, refactor, chore

**Rules**:
- Lowercase: `feat: adds feature`
- Present tense: "adds" not "added"
- Max 72 chars first line
