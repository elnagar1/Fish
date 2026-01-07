@echo off
chcp 65001 >nul
echo ========================================
echo 🐟 مستشار مزارع الأسماك
echo Fish Farm Consultant - Auto Starter
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 تثبيت المكتبات...
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if database exists
if not exist "database.sqlite" (
    echo 🗄️ إنشاء قاعدة البيانات...
    echo Creating database...
    call npm run init-db
    echo.
)

echo ✅ كل شيء جاهز!
echo Everything is ready!
echo.
echo 🚀 تشغيل Backend و Frontend...
echo Starting Backend and Frontend...
echo.
echo ⚠️ لا تغلق هذه النافذة!
echo Do not close this window!
echo.
echo 🌐 الروابط:
echo    - الموقع: http://localhost:3000
echo    - لوحة التحكم: http://localhost:3000/admin.html
echo    - API: http://localhost:3001/api
echo.
echo ========================================
echo.

REM Start Backend in background
start "Backend Server" cmd /k "npm start"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend
start "Frontend Server" cmd /k "npx serve . -l 3000"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo ✅ تم فتح المتصفح تلقائياً!
echo Browser opened automatically!
echo.
echo 💡 نصيحة: اضغط Ctrl+C في أي نافذة لإيقاف السيرفر
echo Tip: Press Ctrl+C in any window to stop the server
echo.
pause
