---
name: zc:backup
description: "Full backup of Claude Code sessions, settings, and history with cloud support"
category: utility
---

# /zc:backup - Full Backup

Create a complete backup of your Claude Code sessions, settings, and command history.

## Usage

```
/zc:backup [--cloud <remote>]
```

## Options

| Option | Description |
|--------|-------------|
| `--cloud <remote>` | Upload backup to cloud (requires rclone) |

## Examples

```
/zc:backup                    # Local backup only
/zc:backup --cloud gdrive     # Backup + upload to Google Drive
/zc:backup --cloud dropbox    # Backup + upload to Dropbox
```

## What Gets Backed Up

- All Claude Code sessions (conversations)
- Agent sessions
- Command history
- ZuppaClaude settings
- API keys (encoded)

## Execution

When this command is invoked, execute the following:

```bash
npx zuppaclaude backup
```

If `--cloud` flag is provided:

```bash
npx zuppaclaude backup --cloud <remote>
```

## After Backup

Show the user:
1. Backup ID (timestamp)
2. Number of sessions backed up
3. Total size
4. Location
5. Cloud upload status (if applicable)

Suggest: "Run `/zc:restore <backup-id>` to restore this backup later."
