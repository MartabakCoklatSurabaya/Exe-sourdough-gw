@echo off
set "P=%~dp0app\index.html"
where msedge >nul 2>&1
if not errorlevel 1 (
  start "" msedge --app="file:///%P%" --start-maximized
  exit /b
)
start "" chrome --app="file:///%P%" --start-maximized
