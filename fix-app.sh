#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN MAESTRA (V1.2)"
echo "===================================================="

# 1. Limpieza de Procesos y Bloqueos
echo "💀 Matando procesos y limpiando bloqueos..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -f node 2>/dev/null
sudo pkill -f mongod 2>/dev/null
sudo rm -f /tmp/mongodb-27017.sock
sudo rm -f /var/lib/mongodb/mongod.lock

# 2. Permisos Recursivos (Elimina EACCES)
echo "🔐 Reparando permisos de la carpeta del proyecto..."
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# 3. Configuración Forzada de Red
echo "📝 Sincronizando configuración de red (IPv4)..."
cat <<EOT > .env
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=reportaya
PORT=3001
DOMAIN=http://127.0.0.1:3000
EOT

# 4. Asegurar MongoDB
echo "🍃 Despertando MongoDB..."
if ! command -v mongod &> /dev/null; then
    sudo apt update && sudo apt install -y mongodb
fi

sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2

if ! pgrep -x "mongod" > /dev/null; then
    echo "   Arrancando manualmente con bind_ip 127.0.0.1..."
    sudo mkdir -p /var/lib/mongodb
    sudo chown -R $USER:$USER /var/lib/mongodb
    mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb --bind_ip 127.0.0.1
fi

# 5. Verificación de Puerto 27017 (Ping)
echo "⏳ Esperando a que MongoDB acepte conexiones..."
for i in {1..15}; do
    if (mongosh --eval "db.adminCommand('ping')" --quiet &>/dev/null || mongo --eval "db.adminCommand('ping')" --quiet &>/dev/null); then
        echo "✅ MongoDB ONLINE y respondiendo."
        break
    fi
    [ $i -eq 15 ] && echo "❌ ERROR: MongoDB no arrancó. Revisa /tmp/mongodb.log" && exit 1
    sleep 1
done

# 6. Reinstalar y Poblar
echo "🧹 Reinstalando dependencias limpias..."
rm -rf dist node_modules package-lock.json
npm install
npm run seed:users
npm run build

echo "===================================================="
echo "🚀 LANZANDO SISTEMA INTEGRADO"
echo "===================================================="
npm run dev:server
