#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN ULTRA-RÁPIDA (V1.5)"
echo "===================================================="

# 1. Limpieza rápida de procesos
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null

# 2. IP Pública y .env
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
[ ! -f .env ] && echo "Creando .env base..." && echo "MONGO_URI=mongodb://127.0.0.1:27017" > .env
sed -i "s|^DOMAIN=.*|DOMAIN=http://$PUBLIC_IP:3000|" .env

# 3. MongoDB Express
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
if ! pgrep -x "mongod" > /dev/null; then
    mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb --bind_ip 127.0.0.1
fi

# 4. Instalación inteligente (Solo si hace falta)
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias (esto tardará un poco)..."
    npm install
else
    echo "⚡ Saltando instalación (dependencias ya presentes)."
fi

# 5. Build y Seed
echo "🌱 Poblando base de datos..."
npm run seed:users
echo "🏗️ Compilando Frontend..."
npm run build

echo "🚀 LANZANDO SISTEMA..."
npm run dev:server
