#!/bin/sh

echo "🐟 Starting Fish Farm Consultant..."

# إنشاء قاعدة البيانات إذا لم تكن موجودة
if [ ! -f /app/database.sqlite ]; then
    echo "📦 Creating database..."
    npm run init-db
fi

# تشغيل Backend في الخلفية
echo "🚀 Starting Backend Server..."
node server.js &

# انتظار Backend للتشغيل
sleep 3

# تشغيل Frontend
echo "🌐 Starting Frontend Server..."
serve -s . -l 3000
