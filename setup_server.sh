#!/bin/bash

# setup_server.sh
# Automates the setup of ReportaYa on Ubuntu (AWS)
# Usage: sudo bash setup_server.sh

DOMAIN="reportaya.ddns.net"
APP_DIR=$(pwd)
USER_HOME=$(eval echo ~${SUDO_USER})

echo "🚀 Iniciando configuración del servidor para $DOMAIN..."

# 1. Update System
echo "📦 Actualizando paquetes del sistema..."
apt-get update && apt-get upgrade -y
apt-get install -y curl git build-essential nginx

# 2. Install Node.js 18
if ! command -v node &> /dev/null; then
    echo "🟢 Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js ya está instalado."
fi

# 3. Install MongoDB (if not exists)
if ! systemctl is-active --quiet mongod; then
    echo "🍃 Instalando MongoDB..."
    apt-get install -y gnupg
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
       gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
       --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
else
    echo "✅ MongoDB ya está corriendo."
fi

# 4. Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚙️ Instalando PM2..."
    npm install -g pm2
    pm2 startup systemd
else
    echo "✅ PM2 ya está instalado."
fi

# 5. Application Setup
echo "🛠️ Configurando aplicación en $APP_DIR..."
# Ensure we are in the right directory (should be run from repo root)
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado. Ejecuta este script dentro de la carpeta del proyecto."
    exit 1
fi

# Install dependencies and build
echo "📦 Instalando dependencias de Node..."
npm install
echo "🏗️ Construyendo frontend..."
npm run build

# 6. Configure Nginx
echo "🌐 Configurando Nginx..."
cp nginx.conf.template /etc/nginx/sites-available/reportaya
ln -sf /etc/nginx/sites-available/reportaya /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 7. SSL with Certbot
if ! command -v certbot &> /dev/null; then
    echo "🔒 Instalando Certbot..."
    apt-get install -y certbot python3-certbot-nginx
fi

echo "🔐 Solicitando certificado SSL para $DOMAIN..."
# Non-interactive mode for Certbot
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect

# 8. Start Application with PM2
echo "🚀 Iniciando aplicación..."
pm2 delete reportaya 2>/dev/null || true
pm2 start npm --name "reportaya" -- run serve
pm2 save

echo "✅¡Despliegue completado! Accede a https://$DOMAIN"
