---
name: zc:settings
description: "ZuppaClaude settings management - view, export, import, reset"
category: utility
---

# /zc:settings - Settings Management

Manage ZuppaClaude configuration and preferences.

## Usage

```
/zc:settings <action> [file]
```

## Actions

| Action | Description |
|--------|-------------|
| `show` | Display current settings |
| `export` | Export settings to file |
| `import` | Import settings from file |
| `reset` | Reset to defaults |
| `path` | Show settings file path |

## Examples

```
/zc:settings show                    # View settings
/zc:settings export ~/backup.json    # Export settings
/zc:settings import ~/backup.json    # Import settings
/zc:settings reset                   # Reset to defaults
/zc:settings path                    # Show file path
```

## Execution

### Show Settings
```bash
npx zuppaclaude settings show
```

### Export Settings
```bash
npx zuppaclaude settings export <file>
```

### Import Settings
```bash
npx zuppaclaude settings import <file>
```

### Reset Settings
```bash
npx zuppaclaude settings reset
```

### Show Path
```bash
npx zuppaclaude settings path
```

## What's Stored

| Setting | Description |
|---------|-------------|
| `specKit` | Spec Kit installation preference |
| `claudeZ` | Claude-Z installation preference |
| `claudeHUD` | Claude HUD installation preference |
| `zaiApiKey` | Z.AI API key (encoded) |
| `installedAt` | Installation timestamp |
| `version` | ZuppaClaude version |

## Settings Location

```
~/.config/zuppaclaude/zc-settings.json
```

## Tips

- Settings are automatically saved after installation
- Previous settings are used on reinstall
- Use `/zc:backup` to backup settings with sessions
