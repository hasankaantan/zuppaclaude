# ZuppaClaude Commands

ZuppaClaude slash commands for Claude Code session and backup management.

## Available Commands

| Command | Description |
|---------|-------------|
| `/zc:backup` | Full backup (sessions + settings + cloud) |
| `/zc:restore` | Restore from backup |
| `/zc:cloud` | Cloud backup management |
| `/zc:session` | Session management |
| `/zc:settings` | Settings management |
| `/zc:help` | Show help and documentation |

## Quick Start

```
/zc:backup              # Create full backup
/zc:backup --cloud      # Backup to cloud
/zc:restore             # Restore from latest backup
/zc:session list        # List all sessions
```

## Installation

These commands are installed automatically with ZuppaClaude:

```bash
npx zuppaclaude install
```
