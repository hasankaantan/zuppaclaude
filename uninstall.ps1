#===============================================================================
#   ZuppaClaude Uninstaller (Windows)
#===============================================================================

$CLAUDE_DIR = "$env:USERPROFILE\.claude"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ZuppaClaude Uninstaller                                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will remove:" -ForegroundColor Yellow
Write-Host "  - SuperClaude commands (~\.claude\commands\sc\)"
Write-Host "  - CLAUDE.md configuration (~\.claude\CLAUDE.md)"
Write-Host "  - Spec Kit CLI (specify-cli)"
Write-Host ""

$response = Read-Host "Continue with uninstall? [y/N]"
if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "Uninstall cancelled." -ForegroundColor Cyan
    exit 0
}

Write-Host ""

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

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Uninstall complete!                                             ║" -ForegroundColor Green
Write-Host "║   Restart Claude Code to apply changes.                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
