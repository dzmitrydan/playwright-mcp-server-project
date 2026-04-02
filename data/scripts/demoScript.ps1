param(
    [string]$downloadUrl = "https://www.example.com",
    [string]$downloadsDir = "./downloads"
)

if (-not (Test-Path $downloadsDir)) {
    New-Item -Path $downloadsDir -ItemType Directory -Force | Out-Null
}

$tempFile = [System.IO.Path]::Combine($downloadsDir, "systemInfo_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt")

$os = $PSVersionTable.OS
$psVersion = $PSVersionTable.PSVersion
$cpu = [System.Environment]::ProcessorCount
$memGB = [math]::Round(([System.GC]::GetGCMemoryInfo().TotalAvailableMemoryBytes) / 1GB, 2)

@"
=== SYSTEM INFO ===
OS: $os
PS Version: $psVersion
CPU: $cpu cores
Memory: $memGB GB
Generated at: $(Get-Date)
"@ | Out-File -FilePath $tempFile -Encoding UTF8 -Force

Write-Output "System info saved to: $tempFile"

$saveFile = [System.IO.Path]::Combine($downloadsDir, "downloadedFile_$(Get-Date -Format 'yyyyMMdd_HHmmss').html")

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $saveFile -ErrorAction Stop
    Write-Output "File downloaded: $saveFile"
} catch {
    Write-Output "Download failed: $($_.Exception.Message)"
}

Write-Output "=== SCRIPT COMPLETE ==="