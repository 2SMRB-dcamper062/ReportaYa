#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - FIX PERMISSION ULTIMATE (V7.0)
# ====================================

# Limpieza inicial
clear
echo "� REPARANDO PERMISOS Y ARRANCANDO..."

# 1. Limpieza radical de procesos
echo "🛑 Deteniendo procesos antiguos..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp >/dev/null 2>&1
sudo pkill -9 -f node >/dev/null 2>&1
sudo pkill -9 -f vite >/dev/null 2>&1

# 2. EL "MAZO" DE PERMISOS (Solución definitiva para EACCES)
echo "🔨 Forzando propiedad del usuario $(whoami)..."
sudo chown -R $USER:$USER . 2>/dev/null
sudo chmod -R 755 . 2>/dev/null

# 3. LIMPIEZA CRÍTICA DE VITE (La causa del error)
echo "🧹 Eliminando carpetas temporales bloqueadas..."
sudo rm -rf node_modules/.vite 2>/dev/null
sudo rm -rf node_modules/.vite-temp 2>/dev/null
sudo rm -rf .vite_cache 2>/dev/null

# 4. TRUCO FINAL: Crear la carpeta con permisos totales ANTES de que Vite la pida
[ -d "node_modules" ] && sudo mkdir -p node_modules/.vite-temp && sudo chmod -R 777 node_modules 2>/dev/null

# 5. Asegurar archivo .env con credenciales correctas
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cat <<EOT > .env
MONGO_URI=mongodb://127.0.0.1:27017/reportaya
DB_NAME=reportaya
PORT=3001
DOMAIN=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply.reportaya@gmail.com
SMTP_PASS=vxlx njyo pucz twnv
EOT
fi

# 6. Base de Datos e Instalación
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null
if [ ! -d "node_modules/express" ]; then
    echo "📦 Instalando dependencias..."
    npm install --quiet
fi

# 7. Arranque
echo "🚀 Lanzando ReportaYa en el puerto 3000..."
echo "----------------------------------------------------"
# Forzamos la caché fuera de node_modules por seguridad extra
export VITE_CACHE_DIR="./.vite_cache"
npx -y concurrently --raw --kill-others \
  "PORT=3001 node server/api.cjs" \
  "npx -y vite --port 3000 --host 0.0.0.0 --clearScreen false --force"
