#!/usr/bin/env pwsh

param(
    [switch]$Build,
    [switch]$Deploy
)

Write-Host "DataCRM Development & Deployment Script" -ForegroundColor Green

# Kill any existing Node processes
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Stopped existing Node processes" -ForegroundColor Yellow
} catch {
    Write-Host "No existing Node processes found" -ForegroundColor Blue
}

# Clean build files with retry logic for Windows
function Remove-DirectoryWithRetry {
    param([string]$Path)
    
    if (Test-Path $Path) {
        Write-Host "Cleaning $Path directory..." -ForegroundColor Yellow
        try {
            # First attempt: normal removal
            Remove-Item -Recurse -Force $Path -ErrorAction Stop
            Write-Host "Successfully cleaned $Path" -ForegroundColor Green
        } catch {
            Write-Host "First attempt failed, trying with PowerShell force..." -ForegroundColor Yellow
            try {
                # Second attempt: unlock files first
                Get-ChildItem -Path $Path -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
                Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
                Write-Host "Successfully cleaned $Path on second attempt" -ForegroundColor Green
            } catch {
                Write-Host "Could not fully clean $Path. Some files may be locked." -ForegroundColor Red
                Write-Host "Please close any open browsers/editors and try again." -ForegroundColor Yellow
            }
        }
        Start-Sleep 1
    }
}

Remove-DirectoryWithRetry ".next"
Remove-DirectoryWithRetry "out"

if ($Build) {
    Write-Host "Building for production (GitHub Pages)..." -ForegroundColor Green
    npm run build:github
    Write-Host "Build completed! Check ./out directory" -ForegroundColor Green
} elseif ($Deploy) {
    Write-Host "Building and deploying to GitHub Pages..." -ForegroundColor Green
    npm run build:github
    
    # Add .nojekyll file
    if (Test-Path "out") {
        New-Item -Path "out/.nojekyll" -ItemType File -Force
        Write-Host "Added .nojekyll file" -ForegroundColor Yellow
    }
    
    Write-Host "Build ready for deployment! Push to main branch to auto-deploy." -ForegroundColor Green
} else {
    # Start the development server
    Write-Host "Starting Next.js development server on http://localhost:3000" -ForegroundColor Green
    npm run dev
}
