---
name: zc:cloud
description: "Cloud backup management with rclone integration"
category: utility
---

# /zc:cloud - Cloud Backup Management

Manage cloud backups using rclone. Supports 40+ cloud providers.

## Usage

```
/zc:cloud <action> [remote] [backup-id]
```

## Actions

| Action | Description |
|--------|-------------|
| `setup` | Show rclone installation and configuration |
| `remotes` | List configured cloud remotes |
| `upload` | Upload backups to cloud |
| `download` | Download backups from cloud |
| `backups` | List backups on cloud |

## Examples

```
/zc:cloud setup                    # Setup instructions
/zc:cloud remotes                  # List remotes
/zc:cloud upload gdrive            # Upload all backups
/zc:cloud download gdrive          # Download all backups
/zc:cloud backups gdrive           # List cloud backups
```

## Execution

### Setup
```bash
npx zuppaclaude cloud setup
```

### List Remotes
```bash
npx zuppaclaude cloud remotes
```

### Upload
```bash
npx zuppaclaude cloud upload <remote> [backup-id]
```

### Download
```bash
npx zuppaclaude cloud download <remote> [backup-id]
```

### List Cloud Backups
```bash
npx zuppaclaude cloud backups <remote>
```

## Supported Providers

| Provider | Remote Name |
|----------|-------------|
| Google Drive | gdrive |
| Dropbox | dropbox |
| OneDrive | onedrive |
| Amazon S3 | s3 |
| SFTP | sftp |
| FTP | ftp |
| + 40 more | See rclone docs |

## First Time Setup

1. Install rclone: `brew install rclone`
2. Configure remote: `rclone config`
3. Use with ZuppaClaude: `/zc:backup --cloud <remote>`
