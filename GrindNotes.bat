@echo off
cd /d "%~dp0"
start "GrindNotes server" /min node server.mjs
timeout /t 1 >nul
start "" "http://127.0.0.1:7718/"
