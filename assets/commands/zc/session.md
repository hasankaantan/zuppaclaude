---
name: zc:session
description: "Claude Code session management - list, backup, restore, export"
category: utility
---

# /zc:session - Session Management

Manage your Claude Code conversation sessions.

## Usage

```
/zc:session <action> [args]
```

## Actions

| Action | Description |
|--------|-------------|
| `list` | List all sessions with details |
| `backup` | Backup sessions only (not settings) |
| `backups` | List available backups |
| `restore` | Restore sessions from backup |
| `export` | Export a specific session to file |

## Examples

```
/zc:session list                              # List all sessions
/zc:session backup                            # Backup sessions
/zc:session backups                           # List backups
/zc:session restore 2026-01-05T12-00-00       # Restore from backup
/zc:session export abc123 ./my-session.jsonl  # Export session
```

## Execution

### List Sessions
```bash
npx zuppaclaude session list
```

Shows:
- Project paths
- Session IDs
- Session types (main vs agent)
- Size and last modified

### Backup Sessions
```bash
npx zuppaclaude session backup
```

### List Backups
```bash
npx zuppaclaude session backups
```

### Restore Sessions
```bash
npx zuppaclaude session restore <backup-id>
```

### Export Session
```bash
npx zuppaclaude session export <session-id> [output-file]
```

## Session Types

| Icon | Type | Description |
|------|------|-------------|
| 💬 | Main | Primary conversation sessions |
| 🤖 | Agent | Sub-agent sessions |

## Tips

- Use `/zc:backup` for full backup (sessions + settings)
- Sessions are stored in `~/.claude/projects/`
- Backups are stored in `~/.config/zuppaclaude/backups/`
