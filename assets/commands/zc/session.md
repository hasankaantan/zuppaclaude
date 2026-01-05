---
name: zc:session
description: "Session management - list, backup, restore, export"
---

Execute based on subcommand:

**List sessions (default):**
```bash
npx zuppaclaude session list
```

**Backup sessions:**
```bash
npx zuppaclaude session backup
```

**List backups:**
```bash
npx zuppaclaude session backups
```

**Restore:**
```bash
npx zuppaclaude session restore <backup-id>
```

**Export session:**
```bash
npx zuppaclaude session export <session-id> [output-file]
```

Run the appropriate command immediately based on user input.
