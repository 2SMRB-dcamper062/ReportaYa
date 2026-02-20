#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SISTEMA DE CONTROL (V5.1)
# ====================================================

# Limpieza inicial
clear
stty sane 2>/dev/null

# Función para apagar todo limpiamente
trap 'printf "\n🛑 Deteniendo ReportaYa...\n"; sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null; stty sane; exit' SIGINT SIGTERM

# 0. Asegurar propiedad y permisos (Fix radical 777)
echo "🔒 Desbloqueando permisos de archivos..."
CURRENT_USER=$(whoami)
# Si estamos en /home/ubuntu, forzamos ese usuario, si no, el actual.
TARGET_USER=${SUDO_USER:-$CURRENT_USER}

sudo chown -R $TARGET_USER:$TARGET_USER /home/ubuntu/ReportaYa 2>/dev/null || sudo chown -R $TARGET_USER:$TARGET_USER .
sudo chmod -R 755 .
[ -d "node_modules" ] && sudo chmod -R 777 node_modules  # Permiso total a dependencias

# 1. Limpieza radical de procesos y permisos
echo "[1/4] Liberando puertos y corrigiendo permisos..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp >/dev/null 2>&1
sudo pkill -9 -f node >/dev/null 2>&1
sudo pkill -9 -f vite >/dev/null 2>&1

# Forzar propiedad al usuario actual (ubuntu)
CURRENT_USER=$(whoami)
TARGET_USER=${SUDO_USER:-$CURRENT_USER}
sudo chown -R $TARGET_USER:$TARGET_USER .

# 2. ELIMINACIÓN CRÍTICA (La causa del error EACCES)
echo "🧹 Eliminando rastros bloqueados de Vite..."
sudo rm -rf node_modules/.vite node_modules/.vite-temp .vite_cache >/dev/null 2>&1

# 3. Instalación/Verificación
if [ ! -d "node_modules/express" ]; then
    echo "📦 Instalando dependencias..."
    npm install --quiet
fi

# 4. Configuración (.env)
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

# 5. Base de Datos
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null

# 6. Arranque (Forzando nuevo directorio de caché para evitar conflictos)
echo "� Lanzando ReportaYa..."
echo "----------------------------------------------------"
export VITE_CACHE_DIR="./.vite_cache"
npx -y concurrently --raw --kill-others \
  "PORT=3001 node server/api.cjs" \
  "npx -y vite --port 3000 --host 0.0.0.0 --clearScreen false --force"
