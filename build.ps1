# PowerShell Build Script for DATACRM
Write-Host "Building DATACRM..." -ForegroundColor Green

# Set environment variables to avoid interactive prompts
$env:CI = "true"
$env:NEXT_TELEMETRY_DISABLED = "1"

try {
    Write-Host "Running Next.js build..." -ForegroundColor Yellow
    & npx next build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Build completed. Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
