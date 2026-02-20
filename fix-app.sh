#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN DEFINITIVA"
echo "===================================================="

# 1. Limpiar procesos
echo "💀 Limpiando puertos 3000 y 3001..."
sudo fuser -k 3000/tcp 3001/tcp 2>/dev/null || echo "   Puertos libres."

# 2. Configurar Entorno (Evitar confusión MONGO_URI vs MONGODB_URI)
echo "📝 Configurando archivo .env..."
cat <<EOT > .env
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=reportaya
PORT=3001
DOMAIN=http://127.0.0.1:3000
EOT

# 3. Asegurar MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️ Instalando MongoDB..."
    sudo apt update && sudo apt install -y mongodb
fi

echo "🍃 Iniciando MongoDB..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
if ! pgrep -x "mongod" > /dev/null; then
    sudo mkdir -p /data/db && sudo chown -R $USER:$USER /data/db
    mongod --fork --logpath /tmp/mongodb.log --dbpath /data/db --bind_ip 127.0.0.1
fi

# 4. Espera Real (Ping)
echo "⏳ Esperando a MongoDB..."
MAX_TRIES=20
for ((i=1; i<=MAX_TRIES; i++)); do
    if (mongosh --eval "db.adminCommand('ping')" --quiet &>/dev/null || mongo --eval "db.adminCommand('ping')" --quiet &>/dev/null); then
        echo "✅ MongoDB ONLINE."
        break
    fi
    if [ $i -eq $MAX_TRIES ]; then
        echo "❌ ERROR: MongoDB no responde."
        exit 1
    fi
    sleep 1
done

# 5. Permisos y Dependencias
echo "🔐 Reparando permisos y dependencias..."
sudo chown -R $USER:$USER .
rm -rf dist node_modules package-lock.json
npm install

# 6. Datos y Compilación
npm run seed:users
npm run build

echo "===================================================="
echo "🚀 LANZANDO SISTEMA..."
echo "===================================================="
npm run dev:server
