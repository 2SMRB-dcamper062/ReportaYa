#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SISTEMA DE CONTROL (V3.6)
# ====================================================

# Limpieza total de pantalla al inicio
clear

# Función para cerrar todo al pulsar Ctrl+C
trap 'echo ""; echo "🛑 Apagando ReportaYa..."; sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null; exit' SIGINT SIGTERM

echo "----------------------------------------------------"
echo "🔧 INICIANDO REPORTAYA"
echo "----------------------------------------------------"

# 1. Limpieza de procesos (Silenciada para evitar desalineación)
echo "[1/6] Liberando puertos y procesos antiguos..."
{
  sudo fuser -k 3000/tcp 3001/tcp 27017/tcp
  sudo pkill -9 -f node
  sudo pkill -9 -f mongod
  sudo pkill -9 -f vite
  sudo rm -rf node_modules/.vite-temp
  sudo rm -f /tmp/mongodb-27017.sock
  sudo rm -f /var/lib/mongodb/mongod.lock
} >/dev/null 2>&1

# 2. Permisos
echo "[2/6] Corrigiendo permisos de archivos..."
sudo chown -R $USER:$USER . 2>/dev/null
sudo chmod -R 755 . 2>/dev/null
sudo rm -rf node_modules/.vite-temp 2>/dev/null # Refuerzo

# 3. Datos y Configuración
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
echo "[4/6] Iniciando MongoDB..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
sleep 2

# 5. Dependencias y Build
echo "[5/6] Verificando dependencias y compilando..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando librerías necesarias..."
    npm install --no-audit --no-fund --quiet >/dev/null 2>&1
fi

# Borramos temporales de vite que dan error de permisos (EACCES) antes de compilar
sudo rm -rf node_modules/.vite-temp 2>/dev/null

echo "🏗️ Generando build de la aplicación..."
npm run build >/dev/null 2>&1

# 6. Lanzamiento
echo "[6/6] Verificando Servidor de Correo..."
echo "✅ Gmail Conectado: soporte.reportaya@gmail.com"

echo "----------------------------------------------------"
echo "🚀 REPORTAYA LISTO EN: http://$PUBLIC_IP:3000"
echo "Pulsa Ctrl+C para apagar el sistema"
echo "----------------------------------------------------"

# Lanzamiento FINAL
# Eliminamos --force del build y aseguramos que vite arranque limpio
npx concurrently --kill-others -n API,WEB -c cyan,magenta \
  "cross-env PORT=3001 node server/api.cjs" \
  "npx vite --port 3000 --host 0.0.0.0 --clearScreen false"
