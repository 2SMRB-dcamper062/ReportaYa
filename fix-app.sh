#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN FINAL (V2.2)"
echo "===================================================="

# 1. Limpieza total de procesos previos
echo "💀 Limpiando puertos 3000, 3001 y 27017..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -9 -f node 2>/dev/null
sudo pkill -9 -f mongod 2>/dev/null
sudo pkill -9 -f vite 2>/dev/null
sudo rm -f /tmp/mongodb-27017.sock
sudo rm -f /var/lib/mongodb/mongod.lock

# 2. Reparar Permisos
echo "🔐 Reparando permisos del sistema..."
sudo chown -R $USER:$USER .
sudo chmod -R 755 .
rm -rf node_modules/.vite node_modules/.vite-temp

# 3. CONFIGURACIÓN OFICIAL SMTP (GMAIL SOPORTE)
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
echo "📝 Escribiendo configuración oficial en .env..."
cat <<EOT > .env
MONGO_URI=mongodb://127.0.0.1:27017/reportaya
DB_NAME=reportaya
PORT=3001
DOMAIN=http://$PUBLIC_IP:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=soporte.reportaya@gmail.com
SMTP_PASS=wemodqbgfcmjruot
EOT

# 4. Iniciar MongoDB
echo "🍃 Despertando base de datos..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 3
if ! pgrep -x "mongod" > /dev/null; then
    sudo mkdir -p /var/lib/mongodb
    sudo chown -R $USER:$USER /var/lib/mongodb
    mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb --bind_ip 127.0.0.1
fi

# 5. Build y Seed
echo "🌱 Poblando datos de ciudadanos..."
npm run seed:users
echo "🏗️ Compilando Frontend oficial..."
npm run build

echo "===================================================="
echo "🚀 APLICACIÓN REAL Y FUNCIONAL LANZADA"
echo "===================================================="
npm run dev:server
