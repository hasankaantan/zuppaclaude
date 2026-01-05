---
name: zc:restore
description: "Restore from backup"
---

If no backup ID argument, first run:
```bash
npx zuppaclaude session backups
```
Then ask which one to restore.

With backup ID argument, IMMEDIATELY run:
```bash
npx zuppaclaude restore {backup-id}
```
