# استخدام Node.js 18 كـ base image
FROM node:18-alpine

# تثبيت أدوات البناء اللازمة لـ sqlite3
RUN apk add --no-cache python3 make g++

# إنشاء مجلد العمل
WORKDIR /app


# نسخ package files
COPY package*.json ./

# تثبيت المكتبات
RUN npm install

# نسخ كل ملفات المشروع
# هذا يتضمن server.js, add_articles.sql, api.js, والملفات الثابتة
COPY . .

# فتح المنفذ (Railway يحدد المنفذ ديناميكياً، لكن نعرض 3001 كافتراضي)
EXPOSE 3001

# تشغيل السيرفر مباشرة
# server.js الآن ذكي كفاية لإنشاء قاعدة البيانات إذا لم يجدها
CMD ["node", "server.js"]

