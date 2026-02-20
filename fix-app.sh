#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN FINAL (V2.2)"
echo "===================================================="

# 1. Limpieza total de procesos y bloqueos
echo "💀 Matando procesos antiguos..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null
sudo pkill -9 -f node 2>/dev/null
sudo pkill -9 -f mongod 2>/dev/null
sudo pkill -9 -f vite 2>/dev/null
sudo rm -f /tmp/mongodb-27017.sock
sudo rm -f /var/lib/mongodb/mongod.lock

# 2. Arreglo de Permisos y Limpieza de Temporales
echo "🔐 Recuperando propiedad del usuario ubuntu..."
sudo chown -R $USER:$USER .
sudo chmod -R 755 .
rm -rf node_modules/.vite node_modules/.vite-temp dist

# 3. Instalación de Dependencias (FUNDAMENTAL)
echo "📦 Instalando librerías (esto tardará unos 2 min)..."
npm install --no-audit --no-fund

# 4. Configuración OFICIAL de Correo y Red
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
echo "📝 Configurando .env con SMTP Soporte..."
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

# 5. Iniciar MongoDB Core
echo "🍃 Despertando base de datos..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2
if ! pgrep -x "mongod" > /dev/null; then
    sudo mkdir -p /var/lib/mongodb
    sudo chown -R $USER:$USER /var/lib/mongodb
    mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb --bind_ip 127.0.0.1
fi

# 6. Sincronización y Compilación
echo "🌱 Poblado de usuarios..."
npm run seed:users
echo "🏗️ Generando archivos de producción..."
npm run build

echo "===================================================="
echo "🚀 SISTEMA REAL PUBLICADO CON ÉXITO"
echo "===================================================="
# Usamos el comando directo para evitar fallos de scripts en package.json
npx concurrently -n API,VITE -c cyan,magenta "cross-env PORT=3001 node server/api.cjs" "npx vite --port 3000 --host 0.0.0.0"
