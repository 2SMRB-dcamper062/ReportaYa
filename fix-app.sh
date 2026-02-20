#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SISTEMA DE CONTROL (V3.8)
# ====================================================

# Limpieza total de pantalla y reset de terminal para evitar el efecto "escalera"
clear
reset 2>/dev/null || tput reset 2>/dev/null

# Función para cerrar todo al pulsar Ctrl+C
trap 'echo ""; echo "🛑 Apagando ReportaYa..."; sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null; exit' SIGINT SIGTERM

echo "----------------------------------------------------"
echo "🔧 INICIANDO REPORTAYA"
echo "----------------------------------------------------"

# 1. Limpieza AGRESIVA de procesos y carpetas
echo "[1/6] Limpiando procesos y bloqueos de archivos..."
{
  sudo fuser -k 3001/tcp 3000/tcp 27017/tcp
  sudo pkill -9 -f node
  sudo pkill -9 -f mongod
  sudo pkill -9 -f vite
} >/dev/null 2>&1

# Eliminar carpetas de cache de Vite (CAUSA DEL ERROR EACCES)
sudo rm -rf node_modules/.vite* >/dev/null 2>&1
sudo rm -f /tmp/mongodb-27017.sock >/dev/null 2>&1

# 2. Permisos TOTALES
echo "[2/6] Corrigiendo permisos (Solución EACCES)..."
sudo chown -R $USER:$USER .
# Damos permisos de escritura total a node_modules para que Vite no falle
sudo chmod -R 777 node_modules 2>/dev/null || true
chmod -R 755 . 2>/dev/null

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
    echo "📦 Instalando librerías..."
    npm install --quiet
fi

# 6. Lanzamiento
echo "[6/6] Preparando arranque final..."
echo "✅ Servidor de Correo: soporte.reportaya@gmail.com"

echo "----------------------------------------------------"
echo "🚀 REPORTAYA LISTO EN: http://$PUBLIC_IP:3000"
echo "Pulsa Ctrl+C para apagar el sistema"
echo "----------------------------------------------------"

# Usamos concurrently con prefijos cortos pero sin --raw para mantener el orden de las líneas
# Si el efecto escalera persiste, intentaremos sin concurrently.
npx concurrently --kill-others \
  -n API,WEB \
  -c "bgCyan.bold,bgMagenta.bold" \
  "cross-env PORT=3001 node server/api.cjs" \
  "npx vite --port 3000 --host 0.0.0.0 --clearScreen false"
