@echo off
chcp 65001 >nul
title Shaxzod CV - portfolio sayt
cd /d "%~dp0"

if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where dotnet >nul 2>nul || (echo [!] .NET SDK topilmadi: https://dotnet.microsoft.com/download & pause & exit /b 1)
where npm >nul 2>nul || (echo [!] Node.js topilmadi: https://nodejs.org & pause & exit /b 1)

if not exist "src\Portfolio.Web\node_modules" (
  echo Frontend paketlari o'rnatilmoqda, faqat birinchi marta...
  pushd src\Portfolio.Web
  call npm install
  popd
)

rem Opens the browser as soon as the site answers; pass "nobrowser" to skip it.
if /i not "%~1"=="nobrowser" (
  start "" powershell -NoProfile -WindowStyle Hidden -Command "while ($true) { try { (New-Object Net.Sockets.TcpClient('localhost', 5174)).Close(); break } catch { Start-Sleep -Milliseconds 700 } }; Start-Process 'http://localhost:5174'"
)

echo.
echo   Sayt:          http://localhost:5174
echo   Admin panel:   http://localhost:5174/admin
echo   API - Swagger: http://localhost:5021/swagger
echo   To'xtatish:    shu oynani yoping yoki Ctrl+C
echo.

dotnet run --project src\Portfolio.WebApi --launch-profile "Sayt + API"
