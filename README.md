# ZuppaClaude

> Claude Code Power-Up Installer - SuperClaude + Spec Kit + Custom Configuration

One command to supercharge your Claude Code experience.

## Quick Install

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/hktdevv/zuppaclaude/main/install.sh | bash
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/hktdevv/zuppaclaude/main/install.ps1 | iex
```

Or download and run:
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/hktdevv/zuppaclaude/main/install.ps1" -OutFile "install.ps1"
.\install.ps1
```

## What's Included

| Component | Description |
|-----------|-------------|
| **SuperClaude** | 30+ slash commands for enhanced workflows |
| **Spec Kit** | Spec-driven development CLI tool |
| **CLAUDE.md** | Optimized system instructions |
| **Claude-Z** | Optional z.ai backend with MCP servers |

## Requirements

The installer automatically checks and installs missing dependencies:

| Requirement | macOS/Linux | Windows |
|-------------|-------------|---------|
| **OS** | macOS, Linux | Windows 10+ |
| **Python** | 3.8+ | 3.8+ |
| **git** | Required | Required |
| **curl** | Required | - |
| **Package Manager** | uv/pipx/pip (auto-install) | uv/pipx/pip (auto-install) |

## After Installation

1. **Restart Claude Code** to activate all features

2. **Test SuperClaude:**
   ```
   /sc:help
   ```

3. **Test Spec Kit:**
   ```bash
   specify --help
   ```

## SuperClaude Commands

### Planning & Design
| Command | Description |
|---------|-------------|
| `/sc:brainstorm` | Idea development |
| `/sc:design` | Architectural design |
| `/sc:estimate` | Time/resource estimation |
| `/sc:spec-panel` | Specification panel |

### Development
| Command | Description |
|---------|-------------|
| `/sc:implement` | Code implementation |
| `/sc:build` | Build and compile |
| `/sc:improve` | Code improvement |
| `/sc:explain` | Code explanation |

### Testing & Quality
| Command | Description |
|---------|-------------|
| `/sc:test` | Test creation |
| `/sc:analyze` | Code analysis |
| `/sc:troubleshoot` | Debugging |
| `/sc:reflect` | Retrospective |

### Project Management
| Command | Description |
|---------|-------------|
| `/sc:task` | Task management |
| `/sc:workflow` | Workflow management |
| `/sc:pm` | Project management |

## Spec Kit Workflow

```bash
# Initialize project
specify init

# Define project constitution
specify constitution

# Create specifications
specify spec

# Generate implementation plan
specify plan

# Break down into tasks
specify tasks
```

## Claude-Z (z.ai Backend)

Claude-Z lets you use Claude Code with the z.ai backend, providing additional MCP servers.

### Setup
During installation, you'll be asked for your Z.AI API key (get it from https://z.ai).

### Usage
```bash
# Run Claude Code with z.ai backend
claude-z

# Pass arguments
claude-z --help
```

### What Claude-Z Provides
- **web-search-prime** - Enhanced web search
- **web-reader** - Web page reading
- **zread** - Document reading
- **zai-mcp-server** - Z.AI MCP integration

## Uninstall

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/hktdevv/zuppaclaude/main/uninstall.sh | bash
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/hktdevv/zuppaclaude/main/uninstall.ps1 | iex
```

### Manual Uninstall
```bash
# macOS/Linux
rm -rf ~/.claude/commands/sc
rm ~/.claude/CLAUDE.md
uv tool uninstall specify-cli

# Windows (PowerShell)
Remove-Item -Recurse ~\.claude\commands\sc
Remove-Item ~\.claude\CLAUDE.md
uv tool uninstall specify-cli
```

## File Locations

| File | macOS/Linux | Windows |
|------|-------------|---------|
| SuperClaude | `~/.claude/commands/sc/` | `%USERPROFILE%\.claude\commands\sc\` |
| Configuration | `~/.claude/CLAUDE.md` | `%USERPROFILE%\.claude\CLAUDE.md` |
| Spec Kit | `~/.local/bin/specify` | `%USERPROFILE%\.local\bin\specify` |

## Troubleshooting

### "specify" command not found

**macOS/Linux:** Add to `~/.zshrc` or `~/.bashrc`:
```bash
export PATH="$HOME/.local/bin:$PATH"
```

**Windows:** Restart PowerShell or add to PATH manually.

### SuperClaude commands not showing
Restart Claude Code completely (quit and reopen).

### Permission denied (macOS/Linux)
```bash
chmod +x install.sh
./install.sh
```

### Execution Policy Error (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Credits

- [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework)
- [GitHub Spec Kit](https://github.com/github/spec-kit)

## License

MIT
