#!/bin/bash

echo "===================================================="
echo "🔧 SECUENCIA DE REPARACIÓN NUCLEAR (V2.4)"
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
echo "🔐 Reparando permisos del sistema..."
sudo chown -R $USER:$USER .
sudo chmod -R 755 .
sudo rm -rf node_modules
sudo rm -rf dist

# 3. INSTALACIÓN MANUAL FORZADA (ESTO ES LO QUE TE FALLABA)
echo "📦 INSTALACIÓN MANUAL FORZADA ( Tardará 2-3 min )..."
npm install --no-audit --no-fund || { echo "❌ ERROR: No se pudieron instalar las librerías. Revisa tu internet."; exit 1; }
echo "✅ Librerías instaladas correctamente."

# 4. Configuración OFICIAL de Correo y Red
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
echo "🌱 Poblando datos..."
node server/seed_users.cjs || echo "⚠️ Falló el seeding, pero continuamos..."
echo "🏗️ Compilando Frontend oficial..."
./node_modules/.bin/vite build || npx vite build

echo "===================================================="
echo "🚀 SISTEMA REAL PUBLICADO CON ÉXITO"
echo "===================================================="
# Usamos npx para asegurar que lance aunque no esté en el PATH
npx concurrently -n API,VITE -c cyan,magenta "cross-env PORT=3001 node server/api.cjs" "npx vite --port 3000 --host 0.0.0.0"
