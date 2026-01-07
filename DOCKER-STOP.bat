@echo off
chcp 65001 >nul
echo ========================================
echo 🛑 إيقاف Docker Container
echo ========================================
echo.

docker-compose down

echo.
echo ✅ تم الإيقاف بنجاح!
echo ✅ Stopped successfully!
echo.
pause
