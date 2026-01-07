@echo off
chcp 65001 >nul
echo ========================================
echo 🛑 إيقاف جميع السيرفرات
echo Stopping all servers...
echo ========================================
echo.

REM Kill all node processes
taskkill /F /IM node.exe >nul 2>&1

REM Kill all serve processes
taskkill /F /FI "WINDOWTITLE eq Frontend Server*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Backend Server*" >nul 2>&1

echo ✅ تم إيقاف جميع السيرفرات بنجاح!
echo All servers stopped successfully!
echo.
pause
