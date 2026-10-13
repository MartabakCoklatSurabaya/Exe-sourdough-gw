@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js belum terpasang. Unduh dulu dari https://nodejs.org lalu jalankan file ini lagi.
  pause
  exit /b 1
)
call npm install
if errorlevel 1 goto gagal
call npm run dist
if errorlevel 1 goto gagal
echo.
echo Selesai! File .exe ada di folder dist
pause
exit /b 0
:gagal
echo.
echo Build gagal. Lihat pesan error di atas.
pause
