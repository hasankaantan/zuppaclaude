#===============================================================================
#   ZuppaClaude Settings Manager (Windows)
#   Export, Import, and Reset settings
#===============================================================================

param(
    [Parameter(Position=0)]
    [string]$Command,
    [Parameter(Position=1)]
    [string]$FilePath
)

# Config
$ZUPPACLAUDE_CONFIG_DIR = "$env:USERPROFILE\.config\zuppaclaude"
$SETTINGS_FILE = "$ZUPPACLAUDE_CONFIG_DIR\zc-settings.json"

function Show-Banner {
    Write-Host ""
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host "   ZuppaClaude Settings Manager" -ForegroundColor Cyan
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Usage {
    Write-Host "Usage: .\zc-settings.ps1 <command> [options]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  show              Display current settings"
    Write-Host "  export <file>     Export settings to file"
    Write-Host "  import <file>     Import settings from file"
    Write-Host "  reset             Reset settings to default"
    Write-Host "  path              Show settings file path"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\zc-settings.ps1 show"
    Write-Host "  .\zc-settings.ps1 export ~\my-zc-settings.json"
    Write-Host "  .\zc-settings.ps1 import ~\backup\zc-settings.json"
    Write-Host "  .\zc-settings.ps1 reset"
    Write-Host ""
}

function Invoke-Show {
    if (-not (Test-Path $SETTINGS_FILE)) {
        Write-Host "[!] No settings file found at: $SETTINGS_FILE" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Run the installer first to create settings."
        return
    }

    Write-Host ""
    Write-Host "Settings file: $SETTINGS_FILE" -ForegroundColor Cyan
    Write-Host ""

    try {
        $settings = Get-Content $SETTINGS_FILE -Raw | ConvertFrom-Json
        $c = $settings.components

        Write-Host "Version: $($settings.version)"
        Write-Host "Created: $($settings.created)"
        Write-Host "Updated: $($settings.updated)"
        Write-Host ""
        Write-Host "Components:"
        Write-Host "  SuperClaude: $(if ($c.superclaude.installed) { 'Yes' } else { 'No' })"
        Write-Host "  Spec Kit: $(if ($c.speckit.installed) { 'Yes' } else { 'No' })"
        Write-Host "  Claude-Z: $(if ($c.claude_z.installed) { 'Yes' } else { 'No' })"
        if ($c.claude_z.api_key_encoded) {
            Write-Host "    API Key: [configured]"
        }
        Write-Host "  Claude HUD: $(if ($c.claude_hud.installed) { 'Yes' } else { 'No' })"
        Write-Host ""

        $p = $settings.preferences
        Write-Host "Preferences:"
        Write-Host "  Auto-update check: $(if ($p.auto_update_check) { 'Yes' } else { 'No' })"
        Write-Host "  Backup configs: $(if ($p.backup_configs) { 'Yes' } else { 'No' })"
    } catch {
        Get-Content $SETTINGS_FILE
    }
    Write-Host ""
}

function Invoke-Export {
    param([string]$ExportFile)

    if (-not $ExportFile) {
        Write-Host "[X] Please specify export file path" -ForegroundColor Red
        Write-Host "Usage: .\zc-settings.ps1 export <file>"
        return
    }

    if (-not (Test-Path $SETTINGS_FILE)) {
        Write-Host "[X] No settings file found at: $SETTINGS_FILE" -ForegroundColor Red
        return
    }

    try {
        $settings = Get-Content $SETTINGS_FILE -Raw | ConvertFrom-Json

        # Add export metadata
        $settings | Add-Member -NotePropertyName "_export" -NotePropertyValue @{
            exported_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            hostname = $env:COMPUTERNAME
            source_path = $SETTINGS_FILE
        } -Force

        $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $ExportFile -Encoding UTF8
        Write-Host "[OK] Settings exported to: $ExportFile" -ForegroundColor Green
    } catch {
        Write-Host "[X] Failed to export settings: $_" -ForegroundColor Red
    }
}

function Invoke-Import {
    param([string]$ImportFile)

    if (-not $ImportFile) {
        Write-Host "[X] Please specify import file path" -ForegroundColor Red
        Write-Host "Usage: .\zc-settings.ps1 import <file>"
        return
    }

    if (-not (Test-Path $ImportFile)) {
        Write-Host "[X] Import file not found: $ImportFile" -ForegroundColor Red
        return
    }

    # Validate JSON
    try {
        $settings = Get-Content $ImportFile -Raw | ConvertFrom-Json
    } catch {
        Write-Host "[X] Invalid JSON file: $ImportFile" -ForegroundColor Red
        return
    }

    # Backup existing settings
    if (Test-Path $SETTINGS_FILE) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backup = "$SETTINGS_FILE.backup.$timestamp"
        Copy-Item $SETTINGS_FILE $backup
        Write-Host "[i] Existing settings backed up to: $backup" -ForegroundColor Blue
    }

    # Create directory if needed
    if (-not (Test-Path $ZUPPACLAUDE_CONFIG_DIR)) {
        New-Item -ItemType Directory -Path $ZUPPACLAUDE_CONFIG_DIR -Force | Out-Null
    }

    # Remove export metadata and update timestamp
    $settings.PSObject.Properties.Remove('_export')
    $settings.updated = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

    $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $SETTINGS_FILE -Encoding UTF8
    Write-Host "[OK] Settings imported from: $ImportFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "[i] Run the installer again to apply imported settings" -ForegroundColor Blue
}

function Invoke-Reset {
    if (-not (Test-Path $SETTINGS_FILE)) {
        Write-Host "[!] No settings file found" -ForegroundColor Yellow
        return
    }

    $response = Read-Host "Are you sure you want to reset all settings? [y/N]"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "[i] Reset cancelled" -ForegroundColor Blue
        return
    }

    # Backup before reset
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backup = "$SETTINGS_FILE.backup.$timestamp"
    Copy-Item $SETTINGS_FILE $backup
    Write-Host "[i] Settings backed up to: $backup" -ForegroundColor Blue

    # Remove settings
    Remove-Item $SETTINGS_FILE
    Write-Host "[OK] Settings reset complete" -ForegroundColor Green
    Write-Host ""
    Write-Host "[i] Run the installer again to create new settings" -ForegroundColor Blue
}

function Invoke-Path {
    Write-Host $SETTINGS_FILE
}

# Main
Show-Banner

switch ($Command) {
    "show" { Invoke-Show }
    "export" { Invoke-Export $FilePath }
    "import" { Invoke-Import $FilePath }
    "reset" { Invoke-Reset }
    "path" { Invoke-Path }
    { $_ -in @("-h", "--help", "help", "") } { Show-Usage }
    default {
        Write-Host "[X] Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Usage
    }
}
