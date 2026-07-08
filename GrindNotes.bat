@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on PATH.
  echo Install Node.js ^(https://nodejs.org^) or open this folder from a shell where node works.
  pause
  exit /b 1
)

if exist ".grindnotes-url" del ".grindnotes-url" >nul 2>nul
start "GrindNotes server" /min cmd /c "node server.mjs || (echo. & echo GrindNotes server stopped with an error ^(see above^). & pause)"

set "GRINDNOTES_URL="
for /l %%I in (1,1,40) do (
  if exist ".grindnotes-url" (
    set /p GRINDNOTES_URL=<".grindnotes-url"
    goto open_app
  )
  timeout /t 1 /nobreak >nul
)

echo Server did not start. Check the minimized "GrindNotes server" window for the error.
pause
exit /b 1

:open_app
where msedge >nul 2>nul
if not errorlevel 1 (
  start "GrindNotes" msedge --app="%GRINDNOTES_URL%" --window-size=1040,760
  goto done
)

where chrome >nul 2>nul
if not errorlevel 1 (
  start "GrindNotes" chrome --app="%GRINDNOTES_URL%" --window-size=1040,760
  goto done
)

start "" "%GRINDNOTES_URL%"

:done
echo GrindNotes opened at %GRINDNOTES_URL%
exit /b 0
