#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN NUCLEAR (V1.8)"
echo "===================================================="

# 1. Limpieza de procesos a nivel de kernel
echo "💀 Liberando puertos bloqueados..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -9 -f node 2>/dev/null
sudo pkill -9 -f vite 2>/dev/null

# 2. Reset total de archivos temporales
echo "🧹 Borrando cachés y sockets..."
sudo rm -f /tmp/mongodb-27017.sock
sudo rm -rf node_modules/.vite-temp
sudo rm -rf dist

# 3. Configuración del entorno
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

# 4. Asegurar propiedad del usuario
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# 5. MongoDB e Instalación
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
if [ ! -d "node_modules" ]; then
    npm install
fi

# 6. Datos y Compilación con limpieza de caché
npm run seed:users
echo "🏗️ Compilando Frontend (Modo Forzado)..."
npx vite build --force

echo "===================================================="
echo "🚀 LANZANDO SISTEMA EN PUERTOS LIMPIOS"
echo "===================================================="
# Usamos directamente el comando para asegurar que no hay capas intermedias fallando
concurrently -n API,VITE -c cyan,magenta "cross-env PORT=3001 node server/api.cjs" "vite --port 3000 --host 0.0.0.0"
