#===============================================================================
#
#   ███████╗██╗   ██╗██████╗ ██████╗  █████╗  ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗
#   ╚══███╔╝██║   ██║██╔══██╗██╔══██╗██╔══██╗██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝
#     ███╔╝ ██║   ██║██████╔╝██████╔╝███████║██║     ██║     ███████║██║   ██║██║  ██║█████╗
#    ███╔╝  ██║   ██║██╔═══╝ ██╔═══╝ ██╔══██║██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝
#   ███████╗╚██████╔╝██║     ██║     ██║  ██║╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗
#   ╚══════╝ ╚═════╝ ╚═╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
#
#   Claude Code Power-Up Installer (Windows)
#   SuperClaude + Spec Kit + Claude-Z + Custom Configuration
#
#===============================================================================

$ErrorActionPreference = "Stop"

# Config
$CLAUDE_DIR = "$env:USERPROFILE\.claude"
$COMMANDS_DIR = "$CLAUDE_DIR\commands"
$ZAI_CONFIG_DIR = "$env:USERPROFILE\.config\zai"
$SUPERCLAUDE_REPO = "https://github.com/SuperClaude-Org/SuperClaude_Framework/archive/refs/heads/master.zip"
$ZUPPACLAUDE_REPO = "https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main"

# Global flags
$script:INSTALL_CLAUDE_Z = $false
$script:ZAI_API_KEY = ""

#===============================================================================
# Helper Functions
#===============================================================================

function Write-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                                                                   ║" -ForegroundColor Magenta
    Write-Host "║   ███████╗██╗   ██╗██████╗ ██████╗  █████╗                        ║" -ForegroundColor Magenta
    Write-Host "║   ╚══███╔╝██║   ██║██╔══██╗██╔══██╗██╔══██╗                       ║" -ForegroundColor Magenta
    Write-Host "║     ███╔╝ ██║   ██║██████╔╝██████╔╝███████║                       ║" -ForegroundColor Magenta
    Write-Host "║    ███╔╝  ██║   ██║██╔═══╝ ██╔═══╝ ██╔══██║                       ║" -ForegroundColor Magenta
    Write-Host "║   ███████╗╚██████╔╝██║     ██║     ██║  ██║                       ║" -ForegroundColor Magenta
    Write-Host "║   ╚══════╝ ╚═════╝ ╚═╝     ╚═╝     ╚═╝  ╚═╝  CLAUDE              ║" -ForegroundColor Magenta
    Write-Host "║                                                                   ║" -ForegroundColor Magenta
    Write-Host "║   Claude Code Power-Up Installer (Windows)                        ║" -ForegroundColor Magenta
    Write-Host "║                                                                   ║" -ForegroundColor Magenta
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[X] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor Blue
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

#===============================================================================
# Dependency Checks
#===============================================================================

function Test-Dependencies {
    Write-Step "Step 1/6: Checking Dependencies"

    $missing = @()

    # Check Windows version
    $osVersion = [Environment]::OSVersion.Version
    if ($osVersion.Major -ge 10) {
        Write-Success "Windows $($osVersion.Major) detected"
    } else {
        Write-Warning "Windows $($osVersion.Major) - Windows 10+ recommended"
    }

    # Check Git
    if (Test-Command "git") {
        $gitVersion = git --version
        Write-Success "Git found: $gitVersion"
    } else {
        $missing += "git"
    }

    # Check Python
    $pythonCmd = $null
    if (Test-Command "python") {
        $pythonCmd = "python"
    } elseif (Test-Command "python3") {
        $pythonCmd = "python3"
    }

    if ($pythonCmd) {
        $pythonVersion = & $pythonCmd --version 2>&1
        Write-Success "Python found: $pythonVersion"
        $script:PYTHON_CMD = $pythonCmd
    } else {
        $missing += "python"
    }

    # Check for uv, pipx, or pip
    $script:PACKAGE_MANAGER = $null
    if (Test-Command "uv") {
        Write-Success "uv found"
        $script:PACKAGE_MANAGER = "uv"
    } elseif (Test-Command "pipx") {
        Write-Success "pipx found"
        $script:PACKAGE_MANAGER = "pipx"
    } elseif (Test-Command "pip") {
        Write-Success "pip found"
        $script:PACKAGE_MANAGER = "pip"
    } elseif (Test-Command "pip3") {
        Write-Success "pip3 found"
        $script:PACKAGE_MANAGER = "pip3"
    }

    # Check npm (needed for Claude Code)
    $hasNpm = Test-Command "npm"
    if ($hasNpm) {
        $npmVersion = npm --version 2>&1
        Write-Success "npm found: v$npmVersion"
    } else {
        Write-Warning "npm not found - required for Claude Code installation"
    }

    # Check Claude Code
    if (Test-Command "claude") {
        $claudeVersion = claude --version 2>&1 | Select-Object -First 1
        Write-Success "Claude Code found: $claudeVersion"

        # Offer to update
        if ($hasNpm) {
            $response = Read-Host "Update Claude Code to latest? [y/N]"
            if ($response -eq 'y' -or $response -eq 'Y') {
                Write-Info "Updating Claude Code..."
                try {
                    npm update -g @anthropic-ai/claude-code 2>&1 | Out-Null
                    Write-Success "Claude Code updated"
                } catch {
                    Write-Warning "Update failed, continuing..."
                }
            }
        }
    } else {
        Write-Warning "Claude Code not found"

        # Try to install Claude Code
        if ($hasNpm) {
            $response = Read-Host "Install Claude Code via npm? [Y/n]"
            if ($response -ne 'n' -and $response -ne 'N') {
                Write-Info "Installing Claude Code..."
                try {
                    npm install -g @anthropic-ai/claude-code 2>&1 | Out-Null
                    if (Test-Command "claude") {
                        Write-Success "Claude Code installed successfully"
                    } else {
                        Write-Warning "Installation completed but 'claude' not in PATH. Restart PowerShell."
                    }
                } catch {
                    Write-Error "Failed to install Claude Code: $_"
                }
            }
        } else {
            Write-Info "Install manually: https://claude.com/code"
            Write-Info "Or install Node.js/npm first, then run: npm install -g @anthropic-ai/claude-code"
        }
    }

    # Check winget (for installing missing deps)
    $hasWinget = Test-Command "winget"
    if ($hasWinget) {
        Write-Success "winget found"
    }

    # Handle missing dependencies
    if ($missing.Count -gt 0) {
        Write-Host ""
        Write-Error "Missing required dependencies:"
        foreach ($dep in $missing) {
            Write-Host "  - $dep" -ForegroundColor Red
        }
        Write-Host ""

        if ($hasWinget) {
            $response = Read-Host "Install missing dependencies with winget? [y/N]"
            if ($response -eq 'y' -or $response -eq 'Y') {
                foreach ($dep in $missing) {
                    Write-Info "Installing $dep..."
                    switch ($dep) {
                        "git" { winget install --id Git.Git -e --silent }
                        "python" { winget install --id Python.Python.3.11 -e --silent }
                    }
                }
                Write-Warning "Please restart PowerShell and run installer again."
                exit 0
            }
        }
        Write-Error "Please install missing dependencies and run again."
        exit 1
    }

    # Install uv if no package manager
    if (-not $script:PACKAGE_MANAGER) {
        Write-Warning "No Python package manager found. Installing uv..."
        try {
            Invoke-WebRequest -Uri "https://astral.sh/uv/install.ps1" -OutFile "$env:TEMP\install-uv.ps1"
            & "$env:TEMP\install-uv.ps1"
            $env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
            if (Test-Command "uv") {
                Write-Success "uv installed successfully"
                $script:PACKAGE_MANAGER = "uv"
            }
        } catch {
            Write-Error "Failed to install uv. Please install manually."
            exit 1
        }
    }

    Write-Success "All dependencies satisfied!"
}

#===============================================================================
# Install SuperClaude
#===============================================================================

function Install-SuperClaude {
    Write-Step "Step 2/6: Installing SuperClaude Framework"

    # Create directories
    if (-not (Test-Path $COMMANDS_DIR)) {
        New-Item -ItemType Directory -Path $COMMANDS_DIR -Force | Out-Null
    }

    $scDir = "$COMMANDS_DIR\sc"

    # Remove existing
    if (Test-Path $scDir) {
        Write-Warning "SuperClaude already installed. Updating..."
        Remove-Item -Recurse -Force $scDir
    }

    # Download and extract
    Write-Info "Downloading SuperClaude Framework..."
    $tempZip = "$env:TEMP\superclaude.zip"
    $tempDir = "$env:TEMP\superclaude_extract"

    try {
        Invoke-WebRequest -Uri $SUPERCLAUDE_REPO -OutFile $tempZip

        if (Test-Path $tempDir) {
            Remove-Item -Recurse -Force $tempDir
        }
        Expand-Archive -Path $tempZip -DestinationPath $tempDir -Force

        # Find commands directory
        $sourceDir = $null
        $possiblePaths = @(
            "$tempDir\SuperClaude_Framework-master\src\superclaude\commands",
            "$tempDir\SuperClaude_Framework-master\commands",
            "$tempDir\SuperClaude_Framework-main\src\superclaude\commands"
        )

        foreach ($path in $possiblePaths) {
            if (Test-Path $path) {
                $sourceDir = $path
                break
            }
        }

        if ($sourceDir) {
            Copy-Item -Recurse -Force $sourceDir $scDir
        } else {
            # Fallback: download from zuppaclaude
            Write-Warning "Using bundled SuperClaude commands..."
            New-Item -ItemType Directory -Path $scDir -Force | Out-Null
            Invoke-WebRequest -Uri "$ZUPPACLAUDE_REPO/commands/sc.zip" -OutFile "$env:TEMP\sc.zip"
            Expand-Archive -Path "$env:TEMP\sc.zip" -DestinationPath $scDir -Force
        }

        # Cleanup
        Remove-Item -Force $tempZip -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

        $cmdCount = (Get-ChildItem -Path $scDir -Filter "*.md" -ErrorAction SilentlyContinue).Count
        Write-Success "SuperClaude installed: $cmdCount commands"

    } catch {
        Write-Error "Failed to install SuperClaude: $_"
        exit 1
    }
}

#===============================================================================
# Install Spec Kit
#===============================================================================

function Install-SpecKit {
    Write-Step "Step 3/6: Installing Spec Kit (specify-cli)"

    try {
        switch ($script:PACKAGE_MANAGER) {
            "uv" {
                Write-Info "Installing with uv..."
                & uv tool install specify-cli 2>$null
                if ($LASTEXITCODE -ne 0) {
                    & uv pip install specify-cli --system
                }
            }
            "pipx" {
                Write-Info "Installing with pipx..."
                & pipx install specify-cli
            }
            default {
                Write-Info "Installing with $($script:PACKAGE_MANAGER)..."
                & $script:PACKAGE_MANAGER install specify-cli --user
            }
        }

        # Verify
        if (Test-Command "specify") {
            $specVersion = specify --version 2>&1 | Select-Object -First 1
            Write-Success "Spec Kit installed: $specVersion"
        } else {
            Write-Warning "Spec Kit installed but 'specify' not in PATH"
            Write-Info "You may need to restart PowerShell or add to PATH"
        }

    } catch {
        Write-Warning "Spec Kit installation had issues: $_"
    }
}

#===============================================================================
# Install Configuration
#===============================================================================

function Install-Config {
    Write-Step "Step 4/6: Installing Configuration"

    $claudeMd = "$CLAUDE_DIR\CLAUDE.md"

    # Backup existing
    if (Test-Path $claudeMd) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backup = "$CLAUDE_DIR\CLAUDE.md.backup.$timestamp"
        Copy-Item $claudeMd $backup
        Write-Info "Existing config backed up to: $backup"
    }

    # Download CLAUDE.md
    Write-Info "Installing CLAUDE.md configuration..."
    try {
        Invoke-WebRequest -Uri "$ZUPPACLAUDE_REPO/CLAUDE.md" -OutFile $claudeMd
        Write-Success "Configuration installed: $claudeMd"
    } catch {
        Write-Warning "Could not download CLAUDE.md, creating default..."
        @"
# Claude Code - Enhanced System Instructions

## SuperClaude Framework (Active)
SuperClaude slash commands are loaded. Use /sc:help to see all commands.

## Spec Kit (Active)
Spec-driven development with ``specify`` CLI.

## Response Format
- Short and concise answers
- Use Markdown formatting
- Status: OK = success, ERR = error, WARN = warning
"@ | Out-File -FilePath $claudeMd -Encoding UTF8
        Write-Success "Default configuration created"
    }
}

#===============================================================================
# Install Claude-Z (z.ai backend)
#===============================================================================

function Install-ClaudeZ {
    Write-Step "Step 5/6: Installing Claude-Z (z.ai backend)"

    if (-not $script:INSTALL_CLAUDE_Z) {
        Write-Info "Skipping Claude-Z installation (no API key provided)"
        return
    }

    # Create directories
    if (-not (Test-Path $ZAI_CONFIG_DIR)) {
        New-Item -ItemType Directory -Path $ZAI_CONFIG_DIR -Force | Out-Null
    }

    $localBin = "$env:USERPROFILE\.local\bin"
    if (-not (Test-Path $localBin)) {
        New-Item -ItemType Directory -Path $localBin -Force | Out-Null
    }

    # Save API key
    $script:ZAI_API_KEY | Out-File -FilePath "$ZAI_CONFIG_DIR\api_key" -Encoding UTF8 -NoNewline
    Write-Success "API key saved to $ZAI_CONFIG_DIR\api_key"

    # Create MCP servers config
    $mcpConfig = @"
{
  "mcpServers": {
    "web-search-prime": {
      "type": "http",
      "url": "https://api.z.ai/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer $($script:ZAI_API_KEY)"
      }
    },
    "web-reader": {
      "type": "http",
      "url": "https://api.z.ai/api/mcp/web_reader/mcp",
      "headers": {
        "Authorization": "Bearer $($script:ZAI_API_KEY)"
      }
    },
    "zread": {
      "type": "http",
      "url": "https://api.z.ai/api/mcp/zread/mcp",
      "headers": {
        "Authorization": "Bearer $($script:ZAI_API_KEY)"
      }
    },
    "zai-mcp-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@z_ai/mcp-server"],
      "env": {
        "Z_AI_API_KEY": "$($script:ZAI_API_KEY)",
        "Z_AI_MODE": "ZAI"
      }
    }
  }
}
"@
    $mcpConfig | Out-File -FilePath "$ZAI_CONFIG_DIR\mcp-servers.json" -Encoding UTF8
    Write-Success "MCP servers config created"

    # Create claude-z.ps1 script
    $claudeZScript = @'
# claude-z - Claude Code with z.ai backend + MCP servers

# Check for API key
if (-not $env:ZAI_API_KEY) {
    $apiKeyFile = "$env:USERPROFILE\.config\zai\api_key"
    if (Test-Path $apiKeyFile) {
        $env:ZAI_API_KEY = Get-Content $apiKeyFile -Raw
    } else {
        Write-Host "X ZAI_API_KEY not set" -ForegroundColor Red
        Write-Host "Set: `$env:ZAI_API_KEY='your-api-key'"
        exit 1
    }
}

# Set z.ai environment
$env:ANTHROPIC_AUTH_TOKEN = $env:ZAI_API_KEY
$env:ANTHROPIC_BASE_URL = "https://api.z.ai/api/anthropic"
$env:API_TIMEOUT_MS = "3000000"

# Run Claude Code with z.ai MCP servers
& claude --mcp-config "$env:USERPROFILE\.config\zai\mcp-servers.json" $args
'@
    $claudeZScript | Out-File -FilePath "$localBin\claude-z.ps1" -Encoding UTF8
    Write-Success "claude-z.ps1 script installed to $localBin\claude-z.ps1"

    # Create batch file wrapper for easier command line use
    $batchWrapper = @"
@echo off
powershell -ExecutionPolicy Bypass -File "%USERPROFILE%\.local\bin\claude-z.ps1" %*
"@
    $batchWrapper | Out-File -FilePath "$localBin\claude-z.cmd" -Encoding ASCII
    Write-Success "claude-z.cmd wrapper created"

    # Add to PATH hint
    if ($env:Path -notlike "*$localBin*") {
        Write-Info "Add to your PATH: $localBin"
        Write-Info "Or run: `$env:Path += `";$localBin`""
    }
}

#===============================================================================
# Verify Installation
#===============================================================================

function Test-Installation {
    Write-Step "Step 6/6: Verifying Installation"

    $allGood = $true

    # Check SuperClaude
    $scDir = "$COMMANDS_DIR\sc"
    if (Test-Path $scDir) {
        $cmdCount = (Get-ChildItem -Path $scDir -Filter "*.md" -ErrorAction SilentlyContinue).Count
        if ($cmdCount -gt 0) {
            Write-Success "SuperClaude: $cmdCount commands installed"
        } else {
            Write-Error "SuperClaude: No commands found"
            $allGood = $false
        }
    } else {
        Write-Error "SuperClaude: Not installed"
        $allGood = $false
    }

    # Check Spec Kit
    if (Test-Command "specify") {
        Write-Success "Spec Kit: Installed"
    } else {
        Write-Warning "Spec Kit: Not in PATH (may need shell restart)"
    }

    # Check CLAUDE.md
    if (Test-Path "$CLAUDE_DIR\CLAUDE.md") {
        Write-Success "Configuration: CLAUDE.md installed"
    } else {
        Write-Error "Configuration: CLAUDE.md not found"
        $allGood = $false
    }

    # Check Claude Code
    if (Test-Command "claude") {
        Write-Success "Claude Code: Ready"
    } else {
        Write-Warning "Claude Code: Not installed"
    }

    # Check Claude-Z
    if ($script:INSTALL_CLAUDE_Z) {
        $claudeZPath = "$env:USERPROFILE\.local\bin\claude-z.cmd"
        if (Test-Path $claudeZPath) {
            Write-Success "Claude-Z: Installed"
        } else {
            Write-Error "Claude-Z: Not installed"
            $allGood = $false
        }
        if (Test-Path "$ZAI_CONFIG_DIR\api_key") {
            Write-Success "Z.AI API Key: Configured"
        } else {
            Write-Error "Z.AI API Key: Not configured"
            $allGood = $false
        }
    }

    Write-Host ""

    if ($allGood) {
        Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║                                                                   ║" -ForegroundColor Green
        Write-Host "║   INSTALLATION COMPLETE!                                          ║" -ForegroundColor Green
        Write-Host "║                                                                   ║" -ForegroundColor Green
        Write-Host "║   Restart Claude Code to activate all features.                   ║" -ForegroundColor Green
        Write-Host "║                                                                   ║" -ForegroundColor Green
        Write-Host "║   Quick Start:                                                    ║" -ForegroundColor Green
        Write-Host "║   - Type /sc:help in Claude Code to see all commands              ║" -ForegroundColor Green
        Write-Host "║   - Run 'specify --help' for Spec Kit commands                    ║" -ForegroundColor Green
        if ($script:INSTALL_CLAUDE_Z) {
        Write-Host "║   - Run 'claude-z' to use Claude with z.ai backend                ║" -ForegroundColor Green
        }
        Write-Host "║                                                                   ║" -ForegroundColor Green
        Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    } else {
        Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
        Write-Host "║   Installation completed with warnings                            ║" -ForegroundColor Yellow
        Write-Host "║   Please check the messages above and fix any issues.             ║" -ForegroundColor Yellow
        Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    }
}

#===============================================================================
# Main
#===============================================================================

function Main {
    Write-Banner

    Write-Host "This script will install:" -ForegroundColor Cyan
    Write-Host "  - SuperClaude Framework (30+ slash commands)"
    Write-Host "  - Spec Kit CLI (spec-driven development)"
    Write-Host "  - Custom CLAUDE.md configuration"
    Write-Host "  - Claude-Z (optional - z.ai backend)"
    Write-Host ""

    $response = Read-Host "Continue with installation? [Y/n]"
    if ($response -eq 'n' -or $response -eq 'N') {
        Write-Info "Installation cancelled."
        exit 0
    }

    # Ask about Claude-Z / z.ai
    Write-Host ""
    Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  Claude-Z Setup (Optional)" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Claude-Z allows you to use Claude Code with z.ai backend."
    Write-Host "This provides additional MCP servers and features."
    Write-Host ""

    $response = Read-Host "Do you want to install Claude-Z? [y/N]"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host ""
        Write-Host "Enter your Z.AI API key (get it from https://z.ai):" -ForegroundColor Cyan
        $script:ZAI_API_KEY = Read-Host "API Key"

        if ($script:ZAI_API_KEY -and $script:ZAI_API_KEY.Trim() -ne "") {
            $script:INSTALL_CLAUDE_Z = $true
            Write-Success "Z.AI API key received"
        } else {
            Write-Warning "No API key provided, skipping Claude-Z"
            $script:INSTALL_CLAUDE_Z = $false
        }
    } else {
        Write-Info "Skipping Claude-Z installation"
    }

    Test-Dependencies
    Install-SuperClaude
    Install-SpecKit
    Install-Config
    Install-ClaudeZ
    Test-Installation
}

# Run
Main
