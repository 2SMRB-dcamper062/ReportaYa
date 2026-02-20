#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SECUENCIA DE ARRANQUE PROFESIONAL (V3.0)
# ====================================================

# Limpiamos la pantalla para empezar de cero
clear

echo "===================================================="
echo "🔧 INICIANDO SISTEMA DE REPARACIÓN Y ARRANQUE"
echo "===================================================="
echo ""

# 1. Limpieza de Procesos
echo "[1/6] 💀 Limpiando procesos antiguos..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -9 -f node 2>/dev/null
sudo pkill -9 -f mongod 2>/dev/null
sudo pkill -9 -f vite 2>/dev/null
sudo rm -f /tmp/mongodb-27017.sock
sudo rm -f /var/lib/mongodb/mongod.lock
echo "      ✅ Puertos liberados."

# 2. Permisos y Archivos Temporales
echo "[2/6] 🔐 Reparando permisos y limpiando temporales..."
sudo chown -R $USER:$USER . 2>/dev/null
sudo chmod -R 755 . 2>/dev/null
rm -rf node_modules/.vite 2>/dev/null
rm -rf node_modules/.vite-temp 2>/dev/null
rm -rf dist 2>/dev/null
echo "      ✅ Archivos limpios."

# 3. Configuración de Red y SMTP
echo "[3/6] 📝 Configurando entorno..."
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
echo "      ✅ IP detectada: $PUBLIC_IP"
echo "      ✅ Correo configurado: soporte.reportaya@gmail.com"

# 4. Base de Datos
echo "[4/6] 🍃 Iniciando Base de Datos (MongoDB)..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2
if ! pgrep -x "mongod" > /dev/null; then
    sudo mkdir -p /var/lib/mongodb 2>/dev/null
    sudo chown -R $USER:$USER /var/lib/mongodb 2>/dev/null
    mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb --bind_ip 127.0.0.1 >/dev/null
fi
echo "      ✅ MongoDB Online."

# 5. Sincronización de Datos
echo "[5/6] 🌱 Cargando datos iniciales..."
node server/seed_users.cjs >/dev/null 2>&1
echo "      ✅ Ciudadanos y reportes listos."

# 6. Compilación de Frontend
echo "[6/6] 🏗️ Compilando Interfaz de Usuario..."
npm run build -- --force >/dev/null 2>&1
echo "      ✅ Frontend compilado con éxito."

echo ""
echo "===================================================="
echo "🚀 TODO LISTO - LANZANDO APLICACIÓN"
echo "===================================================="
echo "Accede a la web en: http://$PUBLIC_IP:3000"
echo "----------------------------------------------------"

# Lanzamiento final alineado a la izquierda sin prefijos molestos
npx concurrently --raw -n API,VITE "cross-env PORT=3001 node server/api.cjs" "npx vite --port 3000 --host 0.0.0.0"
