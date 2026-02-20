#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN TOTAL (V1.6)"
echo "===================================================="

# 1. Limpieza Agresiva de Procesos y Bloqueos
echo "💀 Matando procesos y limpiando sockets de sistema..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -f node 2>/dev/null
sudo pkill -f mongod 2>/dev/null
# ESTO ES CRÍTICO: Limpiar el socket que causa el error de MongoDB
sudo rm -f /tmp/mongodb-27017.sock
sudo rm -f /var/lib/mongodb/mongod.lock

# 2. Reparar Permisos de Raíz
echo "🔐 Recuperando propiedad de los archivos..."
sudo chown -R $USER:$USER .
find . -name ".vite-temp" -type d -exec rm -rf {} + 2>/dev/null

# 3. Configurar Entorno (IP Pública)
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
sed -i "s|^DOMAIN=.*|DOMAIN=http://$PUBLIC_IP:3000|" .env

# 4. Asegurar MongoDB
echo "🍃 Iniciando base de datos..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2
if ! pgrep -x "mongod" > /dev/null; then
    sudo mkdir -p /var/lib/mongodb
    sudo chown -R $USER:$USER /var/lib/mongodb
    mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb --bind_ip 127.0.0.1
fi

# 5. Instalación y Build Limpio
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "🌱 Poblando base de datos..."
npm run seed:users

echo "🏗️ Compilando Frontend (Vite)..."
# Borramos cache de vite para evitar EACCES
rm -rf node_modules/.vite
npm run build

echo "===================================================="
echo "🚀 SISTEMA LISTO - LANZANDO..."
echo "===================================================="
npm run dev:server
