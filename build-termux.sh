#!/data/data/com.termux/files/usr/bin/bash
# Membuat folder portable Windows (SDA-Indonesia.exe) langsung dari Termux.
set -e
cd "$(dirname "$0")"
V=33.0.0
pkg install -y curl unzip zip
rm -rf out && mkdir out && cd out
curl -L -o electron.zip "https://github.com/electron/electron/releases/download/v$V/electron-v$V-win32-x64.zip"
unzip -q electron.zip -d SDA-Indonesia
mv SDA-Indonesia/electron.exe SDA-Indonesia/SDA-Indonesia.exe
mkdir -p SDA-Indonesia/resources/app
cp -r ../main.js ../package.json ../app SDA-Indonesia/resources/app/
zip -qr ../SDA-Indonesia-windows.zip SDA-Indonesia
cd .. && rm -rf out
echo "Selesai: SDA-Indonesia-windows.zip"
