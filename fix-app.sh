#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN PROTEGIDA (V1.4)"
echo "===================================================="

# 1. Limpieza de Procesos
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null

# 2. Gestión Inteligente de .env (NO BORRA GMAIL)
echo "📝 Sincronizando configuración de red..."
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")

if [ ! -f .env ]; then
    cat <<EOT > .env
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=reportaya
PORT=3001
DOMAIN=http://$PUBLIC_IP:3000
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-codigo-google
EOT
    echo "✨ Archivo .env creado. Edita SMTP_USER y SMTP_PASS con tus datos."
else
    # Actualizamos solo la red e IP, preservando el resto
    sed -i "s|^DOMAIN=.*|DOMAIN=http://$PUBLIC_IP:3000|" .env
    # Aseguramos que existan las variables de base de datos
    grep -q "MONGO_URI=" .env || echo "MONGO_URI=mongodb://127.0.0.1:27017" >> .env
    echo "✅ IP del servidor actualizada a $PUBLIC_IP. Configuración SMTP preservada."
fi

# 3. Permisos
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# 4. MongoDB
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
[ ! -d /var/lib/mongodb ] && sudo mkdir -p /var/lib/mongodb && sudo chown -R $USER:$USER /var/lib/mongodb
if ! pgrep -x "mongod" > /dev/null; then
    mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb --bind_ip 127.0.0.1
fi

# 5. Build y Seed
npm install
npm run seed:users
npm run build

echo "🚀 LANZANDO SISTEMA..."
npm run dev:server
