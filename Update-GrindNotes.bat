@echo off
setlocal EnableExtensions
title GrindNotes updater

rem Updates the GrindNotes install with the latest app files from GitHub.
rem Your notes folder is never touched. Safe to run any time, from anywhere:
rem it targets the known install path, or the folder it sits in if that
rem folder already contains GrindNotes (server.mjs present).

set "DEST=C:\Users\Sasha\Documents\Codex\2026-07-06\i-wa\outputs\GrindNotes"
if exist "%~dp0server.mjs" set "DEST=%~dp0"
if not exist "%DEST%" (
  echo Could not find the GrindNotes folder at:
  echo   %DEST%
  echo Move this file into your GrindNotes folder and run it again.
  pause
  exit /b 1
)

set "BASE=https://raw.githubusercontent.com/Salinator513/Notes/claude/cursor-swing-physics-bstakk"

echo Updating GrindNotes in: %DEST%
echo.

rem stop a running GrindNotes server so files are not locked (best effort)
if not exist "%DEST%\.grindnotes-pid" goto nopid
set /p GNPID=<"%DEST%\.grindnotes-pid"
if defined GNPID taskkill /pid %GNPID% /f >nul 2>nul
:nopid
taskkill /fi "WINDOWTITLE eq GrindNotes server*" /f >nul 2>nul

set FAIL=0
for %%F in (ui.html usage.html server.mjs GrindNotes.bat GrindNotes-App.vbs) do (
  echo   downloading %%F ...
  curl -fsSL "%BASE%/%%F" -o "%DEST%\%%F.new" || set FAIL=1
)
if "%FAIL%"=="1" (
  echo.
  echo Download failed - check your internet connection and try again.
  echo Nothing on your PC was changed.
  pause
  exit /b 1
)
for %%F in (ui.html usage.html server.mjs GrindNotes.bat GrindNotes-App.vbs) do (
  move /y "%DEST%\%%F.new" "%DEST%\%%F" >nul
)

echo.
echo Update complete. Starting GrindNotes...
start "" "%DEST%\GrindNotes.bat"
exit /b 0
