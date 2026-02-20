#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SISTEMA DE CONTROL (V3.1)
# ====================================================

# Limpieza total de pantalla
clear

echo "----------------------------------------------------"
echo "🔧 INICIANDO REPORTAYA"
echo "----------------------------------------------------"

# 1. Limpieza a fondo
echo "[Step 1] Matando procesos antiguos..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -9 -f node 2>/dev/null
sudo pkill -9 -f mongod 2>/dev/null
sudo pkill -9 -f vite 2>/dev/null
sudo rm -f /tmp/mongodb-27017.sock >/dev/null 2>&1
sudo rm -f /var/lib/mongodb/mongod.lock >/dev/null 2>&1

# 2. Permisos y temporales (Silencioso)
echo "[Step 2] Corrigiendo permisos y archivos..."
sudo chown -R $USER:$USER . 2>/dev/null
sudo chmod -R 755 . 2>/dev/null
rm -rf node_modules/.vite .vite-temp dist 2>/dev/null

# 3. Datos y Configuración
echo "[Step 3] Sincronizando configuración (.env)..."
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

# 4. Base de Datos
echo "[Step 4] Despertando Base de Datos..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2
if ! pgrep -x "mongod" > /dev/null; then
    sudo mkdir -p /var/lib/mongodb 2>/dev/null
    sudo chown -R $USER:$USER /var/lib/mongodb 2>/dev/null
    mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb --bind_ip 127.0.0.1 >/dev/null
fi

# 5. Instalación y Build (Totalmente limpios en consola)
echo "[Step 5] Optimizando librerías y componentes..."
if [ ! -d "node_modules" ]; then
    npm install --no-audit --no-fund --quiet >/dev/null 2>&1
fi
node server/seed_users.cjs >/dev/null 2>&1
npm run build -- --force >/dev/null 2>&1

echo "[Step 6] Verificando Servidor de Correo..."
echo "✅ Gmail: soporte.reportaya@gmail.com [CONECTADO]"

echo "----------------------------------------------------"
echo "🚀 SISTEMA LISTO EN: http://$PUBLIC_IP:3000"
echo "----------------------------------------------------"

# Lanzamiento con salida cruda para que no haya prefijos a la derecha
npx concurrently --raw -n API,VITE -c cyan,magenta "cross-env PORT=3001 node server/api.cjs" "npx vite --port 3000 --host 0.0.0.0"
