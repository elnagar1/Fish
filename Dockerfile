# استخدام Node.js 18 كـ base image
FROM node:18-alpine

# تثبيت serve globally
RUN npm install -g serve

# إنشاء مجلد العمل
WORKDIR /app

# نسخ package files
COPY package*.json ./

# تثبيت المكتبات
RUN npm install --production

# نسخ باقي الملفات
COPY . .

# إنشاء قاعدة البيانات إذا لم تكن موجودة
RUN if [ ! -f database.sqlite ]; then npm run init-db; fi

# فتح المنافذ
EXPOSE 3000 3001

# نسخ startup script
COPY docker-start.sh /app/
RUN chmod +x /app/docker-start.sh

# تشغيل البرنامج
CMD ["/app/docker-start.sh"]
