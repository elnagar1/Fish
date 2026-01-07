@echo off
chcp 65001 >nul
echo ========================================
echo 🐳 Fish Farm Consultant - Docker
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker غير مشغل!
    echo ❌ Docker is not running!
    echo.
    echo 💡 من فضلك شغّل Docker Desktop أولاً
    echo 💡 Please start Docker Desktop first
    echo.
    pause
    exit /b 1
)

echo ✅ Docker يعمل بنجاح
echo ✅ Docker is running
echo.

echo 🔨 بناء وتشغيل المشروع...
echo 🔨 Building and starting the project...
echo.

docker-compose up -d --build

if errorlevel 1 (
    echo.
    echo ❌ حدث خطأ في التشغيل
    echo ❌ An error occurred
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ تم التشغيل بنجاح!
echo ✅ Started successfully!
echo ========================================
echo.
echo 🌐 الروابط:
echo    - الموقع: http://localhost:3000
echo    - لوحة التحكم: http://localhost:3000/admin.html
echo    - API: http://localhost:3001/api
echo.
echo 💡 لعرض الـ Logs:
echo    docker-compose logs -f
echo.
echo 🛑 للإيقاف:
echo    docker-compose down
echo.

timeout /t 3 /nobreak >nul
start http://localhost:3000

echo ✅ تم فتح المتصفح تلقائياً!
echo.
pause
