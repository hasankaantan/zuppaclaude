---
name: zc:restore
description: "Restore Claude Code sessions and settings from backup"
category: utility
---

# /zc:restore - Restore from Backup

Restore your Claude Code sessions and settings from a previous backup.

## Usage

```
/zc:restore [backup-id] [--cloud <remote>]
```

## Options

| Option | Description |
|--------|-------------|
| `backup-id` | Specific backup to restore (e.g., 2026-01-05T12-00-00) |
| `--cloud <remote>` | Download backup from cloud first |

## Examples

```
/zc:restore                              # Show available backups
/zc:restore 2026-01-05T12-00-00          # Restore specific backup
/zc:restore latest                       # Restore most recent backup
/zc:restore latest --cloud gdrive        # Restore from Google Drive
```

## Execution Flow

### Step 1: List Available Backups

If no backup-id provided, first run:

```bash
npx zuppaclaude session backups
```

Show the list and ask user to select a backup.

### Step 2: Restore

```bash
npx zuppaclaude restore <backup-id>
```

If `--cloud` flag is provided:

```bash
npx zuppaclaude restore <backup-id> --cloud <remote>
```

## Safety

- Existing sessions are NOT overwritten
- Restored sessions get `.restored` suffix
- User can manually merge if needed

## After Restore

Remind user: "Restart Claude Code to see restored sessions."
