@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required to start Savy.
  pause
  exit /b 1
)
set "SAVY_LOCAL_AI=0"
if /i "%AI_PROVIDER%"=="ollama" set "SAVY_LOCAL_AI=1"
if not defined AI_PROVIDER (
  if exist ".env.local" (
    findstr /i /x /c:"AI_PROVIDER=ollama" ".env.local" >nul
    if not errorlevel 1 set "SAVY_LOCAL_AI=1"
  )
)
if "%SAVY_LOCAL_AI%"=="1" (
  where ollama >nul 2>&1
  if errorlevel 1 (
    echo Ollama is required for the local AI assistant.
    pause
    exit /b 1
  )
  powershell -NoProfile -Command "try { $null = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2 } catch { Start-Process -FilePath 'ollama' -ArgumentList 'serve' -WindowStyle Hidden }"
)
echo Starting Savy. Keep this window open while using the prototype.
call npm run dev -- --host 127.0.0.1 --port 3001 --open
pause
