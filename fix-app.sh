#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN MAESTRA (V2.5)"
echo "===================================================="

# 1. Limpieza total de procesos y bloqueos de sistema
echo "💀 Liberando puertos y procesos antiguos..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -9 -f node 2>/dev/null
sudo pkill -9 -f mongod 2>/dev/null
sudo pkill -9 -f vite 2>/dev/null
sudo rm -f /tmp/mongodb-27017.sock
sudo rm -f /var/lib/mongodb/mongod.lock

# 2. Reparación de Permisos de Raíz (Elimina el error EACCES)
echo "🔐 Limpiando archivos temporales bloqueados..."
sudo chown -R $USER:$USER .
sudo rm -rf node_modules/.vite
sudo rm -rf node_modules/.vite-temp
sudo rm -rf dist

# 3. Configuración SMTP y Red
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
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

# 4. Asegurar que MongoDB esté corriendo
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2

# 5. Build y Lanzamiento
echo "🌱 Sincronizando datos..."
node server/seed_users.cjs 2>/dev/null
echo "🏗️ Compilando Frontend (Sin errores de permisos)..."
npm run build -- --force

echo "===================================================="
echo "🚀 SISTEMA TOTALMENTE OPERATIVO"
echo "===================================================="
npx concurrently -n API,VITE -c cyan,magenta "cross-env PORT=3001 node server/api.cjs" "npx vite --port 3000 --host 0.0.0.0"
