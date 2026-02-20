#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - FIX PERMISSION ULTIMATE (V9.0)
# ====================================

# Limpieza de pantalla para empezar de cero
clear

echo "----------------------------------------------------"
echo "🔧 ARRANCANDO PROCESO DE REPARACIÓN"
echo "----------------------------------------------------"

# 1. Limpieza radical de procesos
echo ""
echo "🛑 1. Deteniendo procesos antiguos..."
sudo chown -R ubuntu:ubuntu /home/ubuntu/ReportaYa
rm -rf /home/ubuntu/ReportaYa/node_modules/.vite-temp 
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp >/dev/null 2>&1
sudo pkill -9 -f node >/dev/null 2>&1
sudo pkill -9 -f vite >/dev/null 2>&1
echo "✅ Procesos detenidos."

# 2. EL "MAZO" DE PERMISOS
echo ""
echo "🔨 2. Corrigiendo propiedad de archivos..."
sudo chown -R $USER:$USER . 2>/dev/null
sudo chmod -R 755 . 2>/dev/null
echo "✅ Propiedad restaurada para el usuario: $USER"

# 3. LIMPIEZA CRÍTICA DE VITE
echo ""
echo "🧹 3. Eliminando carpetas temporales bloqueadas..."
sudo rm -rf node_modules/.vite 2>/dev/null
sudo rm -rf node_modules/.vite-temp 2>/dev/null
sudo rm -rf .vite_cache 2>/dev/null
echo "✅ Temporales eliminados."

# 4. TRUCO FINAL: Pre-crear carpeta de temporales
echo ""
echo "📂 4. Preparando entorno de ejecución..."
[ -d "node_modules" ] && sudo mkdir -p node_modules/.vite-temp && sudo chmod -R 777 node_modules 2>/dev/null
echo "✅ Directorio de dependencias desbloqueado."

# 5. Asegurar archivo .env
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 5. Creando archivo .env inicial..."
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
    echo "✅ Archivo .env configurado."
fi

# 6. Base de Datos e Instalación
echo ""
echo "🗄️ 6. Verificando base de datos..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null

if [ ! -d "node_modules/express" ]; then
    echo ""
    echo "📦 7. Instalando dependencias (esto puede tardar)..."
    npm install --quiet
fi

# 7. Arranque
echo ""
echo "----------------------------------------------------"
echo "🚀 7. LANZANDO APLICACIÓN"
echo "----------------------------------------------------"
echo "🌍 Frontend: http://localhost:3000"
echo "📡 Backend:  http://localhost:3001"
echo "----------------------------------------------------"

# Quitamos --raw para que concurrently maneje los logs de forma ordenada
export VITE_CACHE_DIR="./.vite_cache"
npx -y concurrently --kill-others \
  --prefix "[{name}]" \
  --names "API,VITE" \
  --prefix-colors "cyan,magenta" \
  "PORT=3001 node server/api.cjs" \
  "npx -y vite --port 3000 --host 0.0.0.0 --clearScreen false --force"
