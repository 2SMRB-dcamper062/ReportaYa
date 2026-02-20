#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN DEFINITIVA (V1.7)"
echo "===================================================="

# 1. Limpieza de Procesos Descontrolados
echo "💀 Matando procesos en puertos 3000, 3001 y 27017..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -9 -f node 2>/dev/null
sudo pkill -9 -f vite 2>/dev/null
sudo pkill -9 -f mongod 2>/dev/null
sudo rm -f /tmp/mongodb-27017.sock

# 2. Reseteo de Permisos Críticos
echo "🔐 Reparando permisos y limpiando temporales..."
sudo chown -R $USER:$USER .
rm -rf node_modules/.vite-temp
rm -rf node_modules/.vite

# 3. Asegurar Configuración .env
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
if [ ! -f .env ]; then
    echo "⚠️ .env no encontrado. Creando uno nuevo..."
    cat <<EOT > .env
MONGO_URI=mongodb://127.0.0.1:27017/reportaya
DB_NAME=reportaya
PORT=3001
DOMAIN=http://$PUBLIC_IP:3000
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=39d905339322c9
SMTP_PASS=99e486dd618da5
EOT
else
    sed -i "s|^DOMAIN=.*|DOMAIN=http://$PUBLIC_IP:3000|" .env
    echo "✅ .env actualizado con IP: $PUBLIC_IP"
fi

# 4. Iniciar MongoDB
echo "🍃 Iniciando MongoDB..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2

# 5. Build y Seed
echo "🌱 Sincronizando datos..."
npm run seed:users
echo "🏗️ Compilando Frontend..."
npm run build

echo "===================================================="
echo "🚀 TODO LISTO. LANZANDO APLICACIÓN..."
echo "===================================================="
# Lanzamos con el script que evita conflictos de MongoDB
npm run dev:server
