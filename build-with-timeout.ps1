#!/usr/bin/env pwsh

# Build script with timeout for DataCRM
$timeoutSeconds = 120  # 2 minutes timeout

Write-Host "Starting DataCRM build with timeout of $timeoutSeconds seconds..."

# Copy simple config
Copy-Item "next.config.simple.js" "next.config.js" -Force

# Start the build process
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run build
}

# Wait for completion or timeout
$completed = Wait-Job $job -Timeout $timeoutSeconds

if ($completed) {
    # Job completed within timeout
    $result = Receive-Job $job
    Write-Host "Build completed successfully!"
    Write-Host $result
    Remove-Job $job
    exit 0
} else {
    # Job timed out
    Write-Host "Build timed out after $timeoutSeconds seconds. Stopping build process..."
    Stop-Job $job
    Remove-Job $job
    
    # Kill any hanging Node.js processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    
    Write-Host "Build process terminated due to timeout."
    exit 1
}
