@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo GrindNotes needs Node.js on PATH ^(install from https://nodejs.org^).
  pause
  exit /b 1
)
if exist .grindnotes-url del .grindnotes-url
start "GrindNotes server" /min cmd /c "node server.mjs || (echo. & echo GrindNotes server stopped with an error ^(see above^). & pause)"
set tries=0
:wait
if exist .grindnotes-url goto open
set /a tries+=1
if %tries% geq 20 (
  echo Server did not start. Check the minimized "GrindNotes server" window for the error.
  pause
  exit /b 1
)
timeout /t 1 >nul
goto wait
:open
set /p GNURL=<.grindnotes-url
start "" "%GNURL%"
