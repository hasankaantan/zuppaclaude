---
name: zc:help
description: "ZuppaClaude help and documentation"
category: utility
---

# /zc:help - ZuppaClaude Help

Display ZuppaClaude commands and documentation.

## Available Commands

### Backup & Restore

| Command | Description |
|---------|-------------|
| `/zc:backup` | Full backup (sessions + settings) |
| `/zc:backup --cloud gdrive` | Backup and upload to cloud |
| `/zc:restore` | Restore from backup |
| `/zc:restore <id> --cloud gdrive` | Restore from cloud |

### Session Management

| Command | Description |
|---------|-------------|
| `/zc:session list` | List all sessions |
| `/zc:session backup` | Backup sessions only |
| `/zc:session backups` | List available backups |
| `/zc:session export <id>` | Export specific session |

### Cloud Management

| Command | Description |
|---------|-------------|
| `/zc:cloud setup` | Show rclone setup |
| `/zc:cloud remotes` | List cloud remotes |
| `/zc:cloud upload <r>` | Upload to cloud |
| `/zc:cloud download <r>` | Download from cloud |

### Settings

| Command | Description |
|---------|-------------|
| `/zc:settings show` | View settings |
| `/zc:settings export` | Export settings |
| `/zc:settings import` | Import settings |
| `/zc:settings reset` | Reset to defaults |

### Claude HUD

| Command | Description |
|---------|-------------|
| `/zc:hud` | Claude HUD setup instructions |

## Quick Start

```
# First time? Create a backup:
/zc:backup

# Set up cloud backup:
/zc:cloud setup

# Restore if needed:
/zc:restore
```

## CLI Commands

All commands also work from terminal:

```bash
npx zuppaclaude backup
npx zuppaclaude restore <id>
npx zuppaclaude session list
npx zuppaclaude cloud setup
npx zuppaclaude settings show
```

## Links

- GitHub: https://github.com/hasankaantan/zuppaclaude
- NPM: https://www.npmjs.com/package/zuppaclaude

## Execution

When this command is invoked, show this help information to the user.
