# 🐳 Docker Deployment Guide

## 🚀 التشغيل السريع

### الطريقة الأسهل (باستخدام Docker Compose):

```bash
# بناء وتشغيل
docker-compose up -d

# إيقاف
docker-compose down
```

---

## 📋 الخطوات التفصيلية

### 1️⃣ بناء الـ Docker Image

```bash
docker build -t fish-farm-consultant .
```

### 2️⃣ تشغيل الـ Container

```bash
docker run -d \
  --name fish-farm \
  -p 3000:3000 \
  -p 3001:3001 \
  -v $(pwd)/database.sqlite:/app/database.sqlite \
  fish-farm-consultant
```

### 3️⃣ فتح الموقع

افتح المتصفح على:
- **الموقع**: http://localhost:3000
- **لوحة التحكم**: http://localhost:3000/admin.html
- **API**: http://localhost:3001/api

---

## 🔧 أوامر مفيدة

### عرض الـ Logs
```bash
docker logs -f fish-farm
```

### إيقاف الـ Container
```bash
docker stop fish-farm
```

### إعادة التشغيل
```bash
docker restart fish-farm
```

### حذف الـ Container
```bash
docker rm -f fish-farm
```

### الدخول للـ Container
```bash
docker exec -it fish-farm sh
```

---

## 📦 Docker Compose (الطريقة الموصى بها)

### تشغيل
```bash
docker-compose up -d
```

### إيقاف
```bash
docker-compose down
```

### إعادة البناء
```bash
docker-compose up -d --build
```

### عرض الـ Logs
```bash
docker-compose logs -f
```

---

## 🌐 النشر على السيرفر

### 1. نسخ المشروع للسيرفر
```bash
scp -r . user@server:/path/to/fish-farm
```

### 2. على السيرفر
```bash
cd /path/to/fish-farm
docker-compose up -d
```

### 3. فتح المنافذ (إذا كان هناك Firewall)
```bash
sudo ufw allow 3000
sudo ufw allow 3001
```

---

## 🔒 النسخ الاحتياطي

### نسخ قاعدة البيانات
```bash
docker cp fish-farm:/app/database.sqlite ./backup-$(date +%Y%m%d).sqlite
```

### استعادة قاعدة البيانات
```bash
docker cp ./backup.sqlite fish-farm:/app/database.sqlite
docker restart fish-farm
```

---

## 🐳 Docker Hub (اختياري)

### رفع الـ Image
```bash
# تسجيل الدخول
docker login

# Tag
docker tag fish-farm-consultant username/fish-farm-consultant:latest

# Push
docker push username/fish-farm-consultant:latest
```

### استخدام الـ Image من Docker Hub
```bash
docker pull username/fish-farm-consultant:latest
docker run -d -p 3000:3000 -p 3001:3001 username/fish-farm-consultant:latest
```

---

## ⚙️ المتغيرات البيئية (Environment Variables)

يمكنك إنشاء ملف `.env`:

```env
NODE_ENV=production
PORT_FRONTEND=3000
PORT_BACKEND=3001
```

ثم استخدامه في `docker-compose.yml`:

```yaml
env_file:
  - .env
```

---

## 🔍 استكشاف الأخطاء

### المنفذ مشغول؟
```bash
# تغيير المنفذ في docker-compose.yml
ports:
  - "8000:3000"  # استخدم 8000 بدلاً من 3000
  - "8001:3001"
```

### قاعدة البيانات لا تعمل؟
```bash
# إعادة إنشاء قاعدة البيانات
docker exec -it fish-farm npm run init-db
docker restart fish-farm
```

### الـ Container لا يعمل؟
```bash
# عرض الـ Logs
docker logs fish-farm

# التحقق من الحالة
docker ps -a
```

---

## 📊 المتطلبات

- Docker 20.10+
- Docker Compose 1.29+
- 512MB RAM على الأقل
- 1GB مساحة تخزين

---

## ✅ الميزات

- ✅ تشغيل تلقائي للـ Backend و Frontend
- ✅ قاعدة بيانات محفوظة في Volume
- ✅ إعادة تشغيل تلقائية عند الفشل
- ✅ سهولة النشر على أي سيرفر
- ✅ عزل كامل عن النظام

---

**جاهز للنشر! 🚀**
