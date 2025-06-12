@echo off
echo Checking for processes using port 3000...
powershell -ExecutionPolicy Bypass -File "%~dp0\kill-port.ps1"

echo Starting Next.js development server...
cd %~dp0\..
npm run dev 