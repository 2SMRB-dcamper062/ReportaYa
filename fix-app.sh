#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SISTEMA DE CONTROL (V3.7)
# ====================================================

# Limpieza total de pantalla al inicio
clear

# Función para cerrar todo al pulsar Ctrl+C
trap 'echo ""; echo "🛑 Apagando ReportaYa..."; sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null; exit' SIGINT SIGTERM

echo "----------------------------------------------------"
echo "🔧 INICIANDO REPORTAYA"
echo "----------------------------------------------------"

# 1. Limpieza de procesos y carpetas conflictivas
echo "[1/6] Liberando puertos y archivos temporales..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp >/dev/null 2>&1
sudo pkill -9 -f node >/dev/null 2>&1
sudo pkill -9 -f mongod >/dev/null 2>&1
sudo pkill -9 -f vite >/dev/null 2>&1

# Eliminar carpetas que causan el error EACCES de Vite
sudo rm -rf node_modules/.vite >/dev/null 2>&1
sudo rm -rf node_modules/.vite-temp >/dev/null 2>&1
sudo rm -f /tmp/mongodb-27017.sock >/dev/null 2>&1

# 2. Permisos (Crucial para evitar EACCES)
echo "[2/6] Restaurando propiedad de los archivos..."
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# 3. Configuración (.env)
echo "[3/6] Sincronizando configuración (.env)..."
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
echo "[4/6] Verificando MongoDB..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 1

# 5. Dependencias
echo "[5/6] Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando librerías (esto puede tardar)..."
    npm install --quiet
fi

# 6. Lanzamiento
echo "[6/6] Preparando arranque..."
echo "✅ Gmail Conectado: soporte.reportaya@gmail.com"

echo "----------------------------------------------------"
echo "🚀 REPORTAYA LISTO EN: http://$PUBLIC_IP:3000"
echo "Pulsa Ctrl+C para apagar el sistema"
echo "----------------------------------------------------"

# Lanzamiento en modo RAW para evitar problemas de alineación de 'concurrently'
# Ejecutamos con --raw para que no añada prefijos que rompen el diseño de la consola
npx concurrently --raw --kill-others \
  "cross-env PORT=3001 node server/api.cjs" \
  "npx vite --port 3000 --host 0.0.0.0 --clearScreen false"
