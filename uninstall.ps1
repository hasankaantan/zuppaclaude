#===============================================================================
#   ZuppaClaude Uninstaller (Windows)
#===============================================================================

# Config
$CLAUDE_DIR = "$env:USERPROFILE\.claude"
$ZUPPACLAUDE_CONFIG_DIR = "$env:USERPROFILE\.config\zuppaclaude"
$SETTINGS_FILE = "$ZUPPACLAUDE_CONFIG_DIR\zc-settings.json"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ZuppaClaude Uninstaller                                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will remove:" -ForegroundColor Yellow
Write-Host "  - SuperClaude commands (~\.claude\commands\sc\)"
Write-Host "  - CLAUDE.md configuration (~\.claude\CLAUDE.md)"
Write-Host "  - Spec Kit CLI (specify-cli)"
Write-Host "  - Claude-Z script (~\.local\bin\claude-z.*)"
Write-Host "  - Claude HUD setup script (~\.local\bin\setup-claude-hud.*)"
Write-Host "  - Z.AI configuration (~\.config\zai\)"
Write-Host ""

$response = Read-Host "Continue with uninstall? [y/N]"
if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "Uninstall cancelled." -ForegroundColor Cyan
    exit 0
}

Write-Host ""

# Ask about preserving settings
$keepSettings = $false
if (Test-Path $SETTINGS_FILE) {
    Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  Settings Preservation" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Found saved settings at: $SETTINGS_FILE"
    Write-Host "Keeping settings allows quick reinstall with your previous choices."
    Write-Host ""
    $response = Read-Host "Keep settings for future reinstall? [Y/n]"
    if ($response -ne 'n' -and $response -ne 'N') {
        $keepSettings = $true
        Write-Host "[OK] Settings will be preserved" -ForegroundColor Green
    } else {
        Write-Host "[!] Settings will be removed" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Remove SuperClaude
$scDir = "$CLAUDE_DIR\commands\sc"
if (Test-Path $scDir) {
    Remove-Item -Recurse -Force $scDir
    Write-Host "[OK] SuperClaude removed" -ForegroundColor Green
} else {
    Write-Host "[!] SuperClaude not found" -ForegroundColor Yellow
}

# Backup and remove CLAUDE.md
$claudeMd = "$CLAUDE_DIR\CLAUDE.md"
if (Test-Path $claudeMd) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backup = "$CLAUDE_DIR\CLAUDE.md.uninstall.$timestamp"
    Move-Item $claudeMd $backup
    Write-Host "[OK] CLAUDE.md backed up to: $backup" -ForegroundColor Green
} else {
    Write-Host "[!] CLAUDE.md not found" -ForegroundColor Yellow
}

# Remove Spec Kit
try {
    if (Get-Command "uv" -ErrorAction SilentlyContinue) {
        uv tool uninstall specify-cli 2>$null
        Write-Host "[OK] Spec Kit removed (uv)" -ForegroundColor Green
    } elseif (Get-Command "pipx" -ErrorAction SilentlyContinue) {
        pipx uninstall specify-cli 2>$null
        Write-Host "[OK] Spec Kit removed (pipx)" -ForegroundColor Green
    } elseif (Get-Command "pip" -ErrorAction SilentlyContinue) {
        pip uninstall specify-cli -y 2>$null
        Write-Host "[OK] Spec Kit removed (pip)" -ForegroundColor Green
    }
} catch {
    Write-Host "[!] Could not remove Spec Kit" -ForegroundColor Yellow
}

# Remove Claude-Z scripts
$claudeZPs1 = "$env:USERPROFILE\.local\bin\claude-z.ps1"
$claudeZCmd = "$env:USERPROFILE\.local\bin\claude-z.cmd"
if (Test-Path $claudeZPs1) {
    Remove-Item -Force $claudeZPs1
    Write-Host "[OK] Claude-Z script removed (ps1)" -ForegroundColor Green
} else {
    Write-Host "[!] Claude-Z script not found (ps1)" -ForegroundColor Yellow
}
if (Test-Path $claudeZCmd) {
    Remove-Item -Force $claudeZCmd
    Write-Host "[OK] Claude-Z wrapper removed (cmd)" -ForegroundColor Green
} else {
    Write-Host "[!] Claude-Z wrapper not found (cmd)" -ForegroundColor Yellow
}

# Remove Claude HUD setup scripts
$hudSetupPs1 = "$env:USERPROFILE\.local\bin\setup-claude-hud.ps1"
$hudSetupCmd = "$env:USERPROFILE\.local\bin\setup-claude-hud.cmd"
if (Test-Path $hudSetupPs1) {
    Remove-Item -Force $hudSetupPs1
    Write-Host "[OK] Claude HUD setup script removed (ps1)" -ForegroundColor Green
} else {
    Write-Host "[!] Claude HUD setup script not found (ps1)" -ForegroundColor Yellow
}
if (Test-Path $hudSetupCmd) {
    Remove-Item -Force $hudSetupCmd
    Write-Host "[OK] Claude HUD setup wrapper removed (cmd)" -ForegroundColor Green
} else {
    Write-Host "[!] Claude HUD setup wrapper not found (cmd)" -ForegroundColor Yellow
}

# Remove Z.AI configuration
$zaiConfigDir = "$env:USERPROFILE\.config\zai"
if (Test-Path $zaiConfigDir) {
    Remove-Item -Recurse -Force $zaiConfigDir
    Write-Host "[OK] Z.AI configuration removed" -ForegroundColor Green
} else {
    Write-Host "[!] Z.AI configuration not found" -ForegroundColor Yellow
}

# Handle settings
if ($keepSettings) {
    Write-Host "[OK] Settings preserved at: $SETTINGS_FILE" -ForegroundColor Green
} else {
    if (Test-Path $ZUPPACLAUDE_CONFIG_DIR) {
        Remove-Item -Recurse -Force $ZUPPACLAUDE_CONFIG_DIR
        Write-Host "[OK] ZuppaClaude settings removed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Uninstall complete!                                             ║" -ForegroundColor Green
Write-Host "║   Restart Claude Code to apply changes.                           ║" -ForegroundColor Green
if ($keepSettings) {
Write-Host "║                                                                   ║" -ForegroundColor Green
Write-Host "║   Settings preserved - reinstall will use your saved config.      ║" -ForegroundColor Green
}
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
