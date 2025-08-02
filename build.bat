@echo off
echo Building DATACRM...
npx next build
if %errorlevel% neq 0 (
    echo Build failed with error %errorlevel%
    pause
    exit /b %errorlevel%
)
echo Build successful!
pause
