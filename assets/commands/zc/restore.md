---
name: zc:restore
description: "Restore from backup"
---

If no backup ID provided, first list available backups:

```bash
npx zuppaclaude session backups
```

Then ask user which backup to restore.

To restore, execute:

```bash
npx zuppaclaude restore <backup-id>
```

For cloud restore:

```bash
npx zuppaclaude restore <backup-id> --cloud <remote>
```
