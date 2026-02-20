#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - FIX PERMISSION ULTIMATE (V8.0)
# ====================================

# 1. COMANDOS SOLICITADOS (Fix de permisos y limpieza)
echo "🔒 Aplicando fix de permisos solicitado..."
sudo chown -R ubuntu:ubuntu /home/ubuntu/ReportaYa
sudo rm -rf /home/ubuntu/ReportaYa/node_modules/.vite-temp

# 2. Limpieza de procesos
echo "🛑 Deteniendo procesos antiguos..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp >/dev/null 2>&1
sudo pkill -9 -f node >/dev/null 2>&1
sudo pkill -9 -f vite >/dev/null 2>&1

# 3. Limpieza extra de seguridad
sudo rm -rf /home/ubuntu/ReportaYa/node_modules/.vite 2>/dev/null
sudo rm -rf /home/ubuntu/ReportaYa/.vite_cache 2>/dev/null

# 4. Asegurar archivo .env con credenciales correctas
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

# 5. Base de Datos e Instalación
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null

# 6. Arranque
echo "🚀 Lanzando ReportaYa en el puerto 3000..."
echo "----------------------------------------------------"
# Forzamos la caché fuera de node_modules por seguridad extra
export VITE_CACHE_DIR="/home/ubuntu/ReportaYa/.vite_cache"
npx -y concurrently --raw --kill-others \
  "PORT=3001 node server/api.cjs" \
  "npx -y vite --port 3000 --host 0.0.0.0 --clearScreen false --force"
