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

# 1. Limpieza de procesos y carpetas conflictivas
echo "[1/4] Liberando puertos y limpiando temporales..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp >/dev/null 2>&1
sudo pkill -9 -f node >/dev/null 2>&1
sudo pkill -9 -f vite >/dev/null 2>&1

# Solución EACCES definitiva
echo "🧹 Eliminando carpetas temporales de Vite..."
sudo rm -rf node_modules/.vite node_modules/.vite-temp .vite_cache >/dev/null 2>&1
sudo find . -name ".vite*" -exec sudo rm -rf {} + >/dev/null 2>&1

# 3. Instalación de seguridad
if [ ! -d "node_modules/express" ]; then
    echo "📦 Instalando dependencias desde cero..."
    npm install --quiet
fi

# 4. Configuración (.env) - SOLO SE CREA SI NO EXISTE
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env inicial..."
    PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
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
    echo "✅ Archivo .env creado con las credenciales correctas."
fi

# 5. Base de Datos
echo "[3/4] Iniciando Base de Datos..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null

# 6. Arranque
echo "[4/4] Lanzando aplicación..."
echo "----------------------------------------------------"
echo "🚀 REPORTAYA LISTO EN: http://$(curl -s ifconfig.me):3000"
echo "📧 Sistema de correos ACTIVO"
echo "----------------------------------------------------"

# Forzamos a Vite a usar una carpeta de caché nueva y limpia fuera de node_modules
npx -y concurrently --raw --kill-others \
  "PORT=3001 node server/api.cjs" \
  "cross-env VITE_CACHE_DIR=./.vite_cache npx -y vite --port 3000 --host 0.0.0.0 --clearScreen false --force"
