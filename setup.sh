#!/bin/bash

# ============================================
# Fish Farm Consultant - Auto Setup Script
# للسيرفرات Ubuntu/Debian
# ============================================

echo "========================================="
echo "🐟 Fish Farm Consultant - Auto Setup"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ يرجى تشغيل هذا السكريبت كـ root${NC}"
    echo -e "${RED}❌ Please run as root (use: sudo bash setup.sh)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Running as root${NC}"
echo ""

# Get domain name
read -p "أدخل اسم الدومين (مثال: fishfarm.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ يجب إدخال اسم الدومين${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 تحديث النظام...${NC}"
apt update && apt upgrade -y

echo ""
echo -e "${YELLOW}🐳 تثبيت Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ تم تثبيت Docker${NC}"
else
    echo -e "${GREEN}✅ Docker مثبت مسبقاً${NC}"
fi

echo ""
echo -e "${YELLOW}🐳 تثبيت Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
    echo -e "${GREEN}✅ تم تثبيت Docker Compose${NC}"
else
    echo -e "${GREEN}✅ Docker Compose مثبت مسبقاً${NC}"
fi

echo ""
echo -e "${YELLOW}🌐 تثبيت Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl enable nginx
    systemctl start nginx
    echo -e "${GREEN}✅ تم تثبيت Nginx${NC}"
else
    echo -e "${GREEN}✅ Nginx مثبت مسبقاً${NC}"
fi

echo ""
echo -e "${YELLOW}🔒 تثبيت Certbot (SSL)...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✅ تم تثبيت Certbot${NC}"
else
    echo -e "${GREEN}✅ Certbot مثبت مسبقاً${NC}"
fi

echo ""
echo -e "${YELLOW}📁 إنشاء المجلدات...${NC}"
mkdir -p /var/www/fish-farm
mkdir -p /root/backups

echo ""
echo -e "${YELLOW}🔥 إعداد Firewall...${NC}"
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
echo -e "${GREEN}✅ تم إعداد Firewall${NC}"

echo ""
echo -e "${YELLOW}📝 إنشاء ملف تكوين Nginx...${NC}"
cat > /etc/nginx/sites-available/fishfarm << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    client_max_body_size 10M;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/fishfarm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx
echo -e "${GREEN}✅ تم إعداد Nginx${NC}"

echo ""
echo -e "${YELLOW}📦 إنشاء سكريبت النسخ الاحتياطي...${NC}"
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
docker cp fish-farm-consultant:/app/database.sqlite $BACKUP_DIR/db_$DATE.sqlite
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete
echo "Backup completed: $DATE"
EOF

chmod +x /root/backup.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 3 * * * /root/backup.sh") | crontab -
echo -e "${GREEN}✅ تم إعداد النسخ الاحتياطي التلقائي${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}✅ تم الإعداد بنجاح!${NC}"
echo "========================================="
echo ""
echo "📋 الخطوات التالية:"
echo ""
echo "1️⃣ ارفع ملفات المشروع إلى: /var/www/fish-farm"
echo "   مثال: scp -r ./FishFarmConsultant root@server:/var/www/fish-farm"
echo ""
echo "2️⃣ شغّل المشروع:"
echo "   cd /var/www/fish-farm"
echo "   docker-compose up -d"
echo ""
echo "3️⃣ فعّل SSL:"
echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "4️⃣ افتح الموقع:"
echo "   http://$DOMAIN"
echo ""
echo "========================================="
