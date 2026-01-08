# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### CLI Entry Point
`bin/zuppaclaude.js` - Command router that dispatches to appropriate managers:
- `install` → `Installer.run()`
- `backup/restore` → `BackupManager`
- `session` → `SessionManager`
- `cloud` → `CloudManager`
- `settings` → `Settings`
- `update` → `UpdateManager`

### Component Classes (lib/components/)
Each component follows install/verify pattern:
- `SuperClaudeInstaller` - Git clones framework to `~/.claude/commands/sc/`
- `SpecKitInstaller` - Pip installs `specify` CLI via uv/pipx/pip
- `ConfigInstaller` - Copies bundled CLAUDE.md to `~/.claude/`
- `ClaudeZInstaller` - Creates `claude-z` wrapper script with MCP config
- `ClaudeHUDInstaller` - Clones, builds, and configures statusline in Claude settings
- `CommandsInstaller` - Copies `/zc:*` slash commands to `~/.claude/commands/zc/`
- `SessionManager` - Lists/backups/exports Claude conversation sessions
- `BackupManager` - Full backup orchestrator (sessions + settings + history)
- `CloudManager` - rclone integration for remote backup sync
- `UpdateManager` - Auto-update checker with npm registry polling

### Shared Utilities (lib/utils/)
- `Platform` - OS detection, path resolution, command existence checks
- `Logger` - Styled console output with colored status indicators
- `Prompts` - Interactive readline interface for user input

### Key Design Patterns
- **Zero external npm dependencies** - Uses only Node.js built-ins
- **Component isolation** - Each installer is independent and testable
- **Settings persistence** - JSON config at `~/.config/zuppaclaude/zc-settings.json`
- **Multi-device backups** - Stored under `backups/{hostname}/{username}/`

### Install Flow (9 steps)
1. Dependency check (Node 18+, Claude Code v2.x)
2. SuperClaude (git clone)
3. Spec Kit (pip3/pipx/uv)
4. CLAUDE.md (bundled copy)
5. Claude-Z (z.ai backend script)
6. Claude HUD (auto-clone, build, configure statusline)
7. rclone (cloud backup)
8. ZC Commands (slash command skills)
9. Settings save

## Development

```bash
node bin/zuppaclaude.js              # Run full installer locally
node bin/zuppaclaude.js uninstall    # Test uninstaller
node bin/zuppaclaude.js backup       # Test backup flow
DEBUG=1 node bin/zuppaclaude.js      # Enable stack traces on errors
```

### Publishing
```bash
npm version patch                # Bump version (updates package.json)
npm publish --access public      # Publish to npm registry
```

### Adding New Components
1. Create class in `lib/components/newfeature.js` with `install()` and `verify()` methods
2. Export from `lib/components/index.js`
3. Import and instantiate in `lib/installer.js`
4. Add step to `run()` method following existing pattern

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
