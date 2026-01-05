# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZuppaClaude is a single-command installer that deploys Claude Code enhancement tools:
- **SuperClaude**: 30+ slash commands framework
- **Spec Kit**: spec-driven development CLI (`specify`)
- **Claude-Z**: z.ai backend integration (optional)
- **CLAUDE.md**: System instructions

This is an **installer package**, not a code library. It consists of bash/PowerShell scripts.

## Development Commands

**Testing installation locally:**
```bash
# macOS/Linux
bash install.sh

# Windows (PowerShell)
.\install.ps1
```

**Testing uninstallation:**
```bash
# macOS/Linux
bash uninstall.sh

# Windows (PowerShell)
.\uninstall.ps1
```

**No build/lint/test commands** - this is a script-based project.

## Architecture

### Install Flow (7 steps)
1. Dependency check (OS, Python 3.8+, git, Claude Code CLI)
2. SuperClaude installation (git clone from GitHub)
3. Spec Kit installation (pip3/pipx/uv)
4. CLAUDE.md configuration download
5. Claude-Z setup (optional, requires z.ai API key)
6. Claude HUD setup (optional, status display plugin)
7. Verification of all components

### Key Files
| File | Purpose |
|------|---------|
| `install.sh` | Main installer (bash, 671 lines) |
| `install.ps1` | Windows installer (PowerShell, 651 lines) |
| `uninstall.sh` | Removal script (bash) |
| `uninstall.ps1` | Windows removal (PowerShell) |

### Installation Targets
- **macOS/Linux**: `~/.claude/` (config), `~/.local/bin/` (executables)
- **Windows**: `%USERPROFILE%\.claude\`, `%USERPROFILE%\.local\bin\`

### Design Patterns
- **Graceful fallbacks**: Multiple installation methods (pip3 → pipx → uv)
- **Platform detection**: OS-specific logic for macOS/Linux/Windows
- **Interactive/non-interactive**: Supports piped `curl | bash` with defaults
- **Backup strategy**: Preserves existing configs before overwriting

## Git Commit Guidelines

Follow Conventional Commits with present tense:

```
<type>: <description>

[optional body with bullet points]
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore

**Rules**:
- Lowercase: `feat: adds feature` not `Feat: Adds Feature`
- Present tense: "adds" not "add" or "added"
- Max 72 chars first line
- Use hyphens (-) for bullet points

**Example**:
```
feat: adds user authentication system

- adds login and registration endpoints
- adds JWT token generation
```
