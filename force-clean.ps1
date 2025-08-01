#!/usr/bin/env pwsh

Write-Host "Forceful cleanup script for DataCRM build directories" -ForegroundColor Red

# Function to forcefully remove directories on Windows
function Force-RemoveDirectory {
    param([string]$Path)
    
    if (Test-Path $Path) {
        Write-Host "Force removing $Path..." -ForegroundColor Yellow
        
        # Method 1: Use robocopy to clear directory (Windows only)
        try {
            $tempDir = "$env:TEMP\empty_$(Get-Random)"
            New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
            robocopy $tempDir $Path /MIR /R:0 /W:0 | Out-Null
            Remove-Item $tempDir -Force
            Remove-Item $Path -Force
            Write-Host "Successfully removed $Path using robocopy" -ForegroundColor Green
        } catch {
            Write-Host "Robocopy method failed, trying takeown..." -ForegroundColor Yellow
            
            # Method 2: Take ownership and delete
            try {
                takeown /f $Path /r /d y | Out-Null
                icacls $Path /grant administrators:F /t | Out-Null
                Remove-Item $Path -Recurse -Force
                Write-Host "Successfully removed $Path using takeown" -ForegroundColor Green
            } catch {
                Write-Host "All methods failed for $Path. Manual intervention required." -ForegroundColor Red
                Write-Host "Please close all browsers, editors, and file explorers, then try again." -ForegroundColor Yellow
            }
        }
    }
}

# Clean directories
Force-RemoveDirectory ".next"
Force-RemoveDirectory "out"

Write-Host "Cleanup completed!" -ForegroundColor Green
