#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN TOTAL (V2.0)"
echo "===================================================="

# 1. Limpieza de procesos y archivos de bloqueo
echo "💀 Limpiando procesos y sockets bloqueados..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -9 -f node 2>/dev/null
sudo pkill -9 -f mongod 2>/dev/null
sudo pkill -9 -f vite 2>/dev/null

# Limpiar sockets que causan el error de MongoDB
sudo rm -f /tmp/mongodb-27017.sock
sudo rm -f /var/lib/mongodb/mongod.lock

# Limpiar temporales de Vite que causan EACCES
sudo rm -rf node_modules/.vite
sudo rm -rf node_modules/.vite-temp

# 2. Arreglar permisos de raíz
echo "🔐 Reparando permisos de la carpeta..."
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# 3. Configuración forzada de Mailtrap y Red
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
echo "📝 Escribiendo configuración en .env..."
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

# 4. Iniciar MongoDB y esperar respuesta real
echo "🍃 Despertando base de datos..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2
if ! pgrep -x "mongod" > /dev/null; then
    sudo mkdir -p /var/lib/mongodb
    sudo chown -R $USER:$USER /var/lib/mongodb
    mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb --bind_ip 127.0.0.1
fi

# Esperar a que MongoDB responda (Ping)
echo "⏳ Esperando a MongoDB..."
for i in {1..15}; do
    if (mongosh --eval "db.adminCommand('ping')" --quiet &>/dev/null || mongo --eval "db.adminCommand('ping')" --quiet &>/dev/null); then
        echo "✅ MongoDB ONLINE."
        break
    fi
    sleep 1
done

# 5. Build y Seed
echo "🌱 Poblando datos..."
npm run seed:users
echo "🏗️ Compilando Frontend limpio..."
npm run build

echo "===================================================="
echo "🚀 LANZANDO SISTEMA INTEGRADO"
echo "===================================================="
# Usamos dev:server para evitar que lance otro proceso de MongoDB
npm run dev:server
