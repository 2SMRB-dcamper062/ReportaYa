#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN TOTAL (V1.9)"
echo "===================================================="

# 1. Limpieza Terminal de Procesos
echo "💀 Limpiando puertos 3000, 3001 y 27017..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -9 -f node 2>/dev/null
sudo pkill -9 -f vite 2>/dev/null
sudo pkill -9 -f mongod 2>/dev/null

# 2. Arreglo Definitivo de Permisos (ELIMINAR TODO LO VIEJO)
echo "🧹 Borrando archivos temporales y bloqueados..."
sudo rm -rf node_modules
sudo rm -rf dist
sudo rm -rf .vite-temp
sudo rm -f package-lock.json
sudo rm -f /tmp/mongodb-27017.sock

# 3. Asegurar propiedad del usuario ubuntu
echo "🔐 Recuperando permisos para el usuario ubuntu..."
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# 4. Configuración .env (Mailtrap Sandbox)
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
echo "📝 Configurando .env para Mailtrap..."
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

# 5. Instalación Limpia
echo "📦 Reinstalando dependencias desde cero..."
npm install

# 6. MongoDB y Seeding
echo "🍃 Iniciando Base de Datos..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2
npm run seed:users

# 7. Compilación
echo "🏗️ Compilando Frontend..."
npm run build

echo "===================================================="
echo "🚀 LANZANDO SISTEMA LIMPIO"
echo "===================================================="
npm run dev:server
