# 🌐 دليل شراء الدومين ورفع الموقع على السيرفر

## 📋 الخطوات الكاملة من الصفر

---

## 1️⃣ شراء الدومين (Domain)

### أفضل المواقع لشراء الدومين:

#### أ) **Namecheap** (موصى به - رخيص وموثوق)
- الموقع: https://www.namecheap.com
- السعر: $8-15 سنوياً
- المميزات: 
  - ✅ أرخص الأسعار
  - ✅ حماية خصوصية مجانية
  - ✅ واجهة سهلة

#### ب) **GoDaddy** (الأشهر)
- الموقع: https://www.godaddy.com
- السعر: $12-20 سنوياً
- المميزات:
  - ✅ دعم عربي
  - ✅ خدمة عملاء 24/7

#### ج) **Cloudflare** (الأفضل للأمان)
- الموقع: https://www.cloudflare.com
- السعر: $10 سنوياً
- المميزات:
  - ✅ حماية DDoS مجانية
  - ✅ SSL مجاني
  - ✅ CDN مجاني

### خطوات الشراء:

```
1. اذهب إلى الموقع (مثلاً Namecheap)
2. ابحث عن الدومين المطلوب (مثال: fishfarm.com)
3. اختر الدومين المتاح
4. أضفه للسلة
5. أكمل عملية الدفع (Visa/Mastercard/PayPal)
6. ستصلك رسالة تأكيد على البريد
```

**💡 نصيحة:** اختر `.com` أو `.net` - الأفضل والأشهر

---

## 2️⃣ شراء السيرفر (VPS/Cloud Server)

### أفضل مزودي السيرفرات:

#### أ) **DigitalOcean** (موصى به للمبتدئين)
- الموقع: https://www.digitalocean.com
- السعر: $6/شهر (أرخص خطة)
- المواصفات:
  - 1 CPU
  - 1GB RAM
  - 25GB SSD
  - 1TB Transfer
- المميزات:
  - ✅ سهل جداً
  - ✅ دروس كثيرة
  - ✅ $200 رصيد مجاني للتجربة

#### ب) **Linode** (قوي وموثوق)
- الموقع: https://www.linode.com
- السعر: $5/شهر
- مشابه لـ DigitalOcean

#### ج) **Vultr** (سريع)
- الموقع: https://www.vultr.com
- السعر: $6/شهر
- سيرفرات في مواقع كثيرة

#### د) **AWS Lightsail** (من Amazon)
- الموقع: https://aws.amazon.com/lightsail
- السعر: $5/شهر
- موثوق جداً

### خطوات شراء السيرفر (مثال DigitalOcean):

```
1. سجل حساب على DigitalOcean
2. اضغط "Create" → "Droplets"
3. اختر:
   - نظام التشغيل: Ubuntu 22.04 LTS
   - الخطة: Basic ($6/month)
   - المنطقة: أقرب منطقة لك (مثلاً Frankfurt)
4. أضف SSH Key (اختياري - للأمان)
5. اضغط "Create Droplet"
6. انتظر دقيقة - ستحصل على IP السيرفر
```

---

## 3️⃣ ربط الدومين بالسيرفر

### الطريقة (DNS Settings):

#### على موقع الدومين (Namecheap مثلاً):

```
1. اذهب إلى لوحة التحكم
2. اختر الدومين
3. اضغط "Manage" → "Advanced DNS"
4. أضف السجلات التالية:

A Record:
- Host: @
- Value: [IP السيرفر]
- TTL: Automatic

A Record:
- Host: www
- Value: [IP السيرفر]
- TTL: Automatic
```

**مثال:**
```
Type    Host    Value           TTL
A       @       157.230.45.123  Automatic
A       www     157.230.45.123  Automatic
```

**⏰ ملاحظة:** قد يستغرق التفعيل من 5 دقائق إلى 48 ساعة

---

## 4️⃣ إعداد السيرفر

### الاتصال بالسيرفر:

#### على Windows:
```bash
# استخدم PuTTY أو PowerShell
ssh root@[IP-السيرفر]
# أدخل كلمة المرور (ستصلك بالبريد)
```

#### على Mac/Linux:
```bash
ssh root@[IP-السيرفر]
```

### تثبيت المتطلبات:

```bash
# 1. تحديث النظام
apt update && apt upgrade -y

# 2. تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. تثبيت Docker Compose
apt install docker-compose -y

# 4. تثبيت Nginx (للدومين)
apt install nginx -y

# 5. تثبيت Certbot (للـ SSL المجاني)
apt install certbot python3-certbot-nginx -y
```

---

## 5️⃣ رفع المشروع على السيرفر

### الطريقة 1: باستخدام Git (الأفضل)

```bash
# على السيرفر
cd /var/www
git clone https://github.com/your-username/fish-farm.git
cd fish-farm
docker-compose up -d
```

### الطريقة 2: باستخدام SCP (نسخ مباشر)

```bash
# على جهازك المحلي
scp -r D:/Work\ Space/FishFarmConsultant root@[IP-السيرفر]:/var/www/fish-farm

# ثم على السيرفر
cd /var/www/fish-farm
docker-compose up -d
```

### الطريقة 3: باستخدام FileZilla (واجهة رسومية)

```
1. حمّل FileZilla: https://filazilla-project.org
2. اتصل بالسيرفر:
   - Host: sftp://[IP-السيرفر]
   - Username: root
   - Password: [كلمة المرور]
   - Port: 22
3. ارفع المجلد كاملاً
```

---

## 6️⃣ إعداد Nginx (للدومين)

### إنشاء ملف التكوين:

```bash
nano /etc/nginx/sites-available/fishfarm
```

### أضف هذا المحتوى:

```nginx
server {
    listen 80;
    server_name fishfarm.com www.fishfarm.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### تفعيل التكوين:

```bash
# إنشاء رابط رمزي
ln -s /etc/nginx/sites-available/fishfarm /etc/nginx/sites-enabled/

# اختبار التكوين
nginx -t

# إعادة تشغيل Nginx
systemctl restart nginx
```

---

## 7️⃣ تفعيل SSL (HTTPS المجاني)

```bash
# تشغيل Certbot
certbot --nginx -d fishfarm.com -d www.fishfarm.com

# اتبع التعليمات:
# 1. أدخل بريدك الإلكتروني
# 2. وافق على الشروط
# 3. اختر "Redirect" لتحويل HTTP إلى HTTPS تلقائياً
```

**✅ الآن موقعك يعمل على https://fishfarm.com**

---

## 8️⃣ إعداد Firewall (الأمان)

```bash
# تفعيل UFW
ufw enable

# السماح بالمنافذ المطلوبة
ufw allow 22      # SSH
ufw allow 80      # HTTP
ufw allow 443     # HTTPS

# التحقق
ufw status
```

---

## 9️⃣ إعداد النسخ الاحتياطي التلقائي

### إنشاء سكريبت النسخ الاحتياطي:

```bash
nano /root/backup.sh
```

### أضف هذا المحتوى:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# نسخ قاعدة البيانات
docker cp fish-farm-consultant:/app/database.sqlite $BACKUP_DIR/db_$DATE.sqlite

# حذف النسخ القديمة (أكثر من 7 أيام)
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### جدولة النسخ الاحتياطي (يومياً):

```bash
# تعديل الصلاحيات
chmod +x /root/backup.sh

# إضافة للـ Cron
crontab -e

# أضف هذا السطر (نسخ احتياطي يومياً الساعة 3 صباحاً)
0 3 * * * /root/backup.sh
```

---

## 🔟 المراقبة والصيانة

### التحقق من حالة الموقع:

```bash
# حالة Docker
docker-compose ps

# Logs
docker-compose logs -f

# حالة Nginx
systemctl status nginx

# استخدام الموارد
htop
```

### إعادة التشغيل:

```bash
# إعادة تشغيل Docker
docker-compose restart

# إعادة تشغيل Nginx
systemctl restart nginx

# إعادة تشغيل السيرفر
reboot
```

---

## 📊 ملخص التكاليف

| الخدمة | السعر | ملاحظات |
|--------|-------|----------|
| الدومين | $10/سنة | Namecheap |
| السيرفر | $6/شهر | DigitalOcean |
| SSL | مجاني | Let's Encrypt |
| **الإجمالي** | **$82/سنة** | حوالي 2500 جنيه مصري |

---

## ✅ Checklist النشر

- [ ] شراء الدومين
- [ ] شراء السيرفر
- [ ] ربط الدومين بالسيرفر (DNS)
- [ ] تثبيت Docker على السيرفر
- [ ] رفع المشروع
- [ ] إعداد Nginx
- [ ] تفعيل SSL
- [ ] إعداد Firewall
- [ ] إعداد النسخ الاحتياطي
- [ ] اختبار الموقع

---

## 🆘 حل المشاكل الشائعة

### الدومين لا يعمل؟
```bash
# تحقق من DNS
nslookup fishfarm.com

# انتظر حتى 48 ساعة للتفعيل
```

### الموقع لا يفتح؟
```bash
# تحقق من Nginx
systemctl status nginx

# تحقق من Docker
docker-compose ps

# تحقق من Firewall
ufw status
```

### SSL لا يعمل؟
```bash
# أعد تشغيل Certbot
certbot renew --dry-run
```

---

## 📚 مصادر مفيدة

- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **Docker Documentation**: https://docs.docker.com/

---

**الآن موقعك جاهز للعالم! 🌍🚀**
