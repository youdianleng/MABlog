<#
Create a consistent local database/media backup. Run from PowerShell with Docker Desktop running.
The API, frontend, and indexing worker are briefly stopped to keep the database and uploaded files in sync.
#>
param([string]$Destination)
$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
if (-not $Destination) { $Destination = Join-Path $projectDirectory ('backups\' + (Get-Date -Format 'yyyyMMdd-HHmmss')) }
$backupDirectory = [System.IO.Path]::GetFullPath($Destination)
New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null

function Invoke-Compose {
    <# Run Docker Compose with structured arguments and stop on command failures. #>
    param([string[]]$ComposeArguments)
    & docker compose @ComposeArguments
    if ($LASTEXITCODE -ne 0) { throw "Docker Compose failed: $ComposeArguments" }
}

Push-Location -LiteralPath $projectDirectory
try {
    Invoke-Compose @('stop', 'frontend', 'backend', 'worker', 'news-worker')
    Invoke-Compose @('exec', '-T', 'db', 'pg_dump', '-U', 'mablog', '-Fc', '-f', '/tmp/mablog-backup.dump', 'mablog')
    Invoke-Compose @('cp', 'db:/tmp/mablog-backup.dump', (Join-Path $backupDirectory 'database.dump'))
    $backupMount = '{0}:/backup' -f $backupDirectory
    Invoke-Compose @('run', '--rm', '--no-deps', '-v', $backupMount, 'backend', 'tar', '-czf', '/backup/uploads.tar.gz', '-C', '/data/uploads', '.')
    @{
        createdUtc = (Get-Date).ToUniversalTime().ToString('o')
        database = 'mablog'
        files = @('database.dump', 'uploads.tar.gz')
    } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backupDirectory 'manifest.json') -Encoding UTF8
    Write-Output "Backup saved: $backupDirectory"
} finally {
    Invoke-Compose @('start', 'backend', 'worker', 'news-worker', 'frontend')
    Pop-Location
}
