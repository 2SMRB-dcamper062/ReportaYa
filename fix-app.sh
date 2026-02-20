#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SISTEMA DE CONTROL (V4.0)
# ====================================================

# 1. LIMPIEZA VISUAL ABSOLUTA
# Corregimos el terminal para evitar el "efecto escalera"
stty sane 2>/dev/null
clear

# Función para apagar todo limpiamente
trap 'echo ""; echo "🛑 Deteniendo servicios..."; sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null; stty sane; exit' SIGINT SIGTERM

echo "===================================================="
echo "🔧 REPARANDO EL ENTORNO DE REPORTAYA"
echo "===================================================="

# 2. LIMPIEZA DE PROCESOS
echo "[1/4] Liberando puertos y matando procesos antiguos..."
{
    sudo fuser -k 3000/tcp 3001/tcp 27017/tcp
    sudo pkill -9 -f node
    sudo pkill -9 -f mongod
    sudo pkill -9 -f vite
} >/dev/null 2>&1

# 3. SOLUCIÓN RADICAL AL ERROR DE PERMISOS (EACCES)
echo "[2/4] Resolviendo bloqueos de archivos (Vite EACCES)..."
# Borramos carpetas de cache que suelen dar problemas de permisos
sudo rm -rf node_modules/.vite
sudo rm -rf node_modules/.vite-temp
sudo rm -rf .vite-temp
sudo rm -rf dist

# Forzamos que TODO el proyecto sea propiedad de tu usuario actual
sudo chown -R $(whoami):$(whoami) .

# Pre-creamos las carpetas problemáticas y les damos permiso total
mkdir -p node_modules/.vite
mkdir -p node_modules/.vite-temp
chmod -R 777 node_modules/.vite node_modules/.vite-temp 2>/dev/null

# 4. BASE DE DATOS Y CONFIGURACIÓN
echo "[3/4] Iniciando Base de Datos y Configuración..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null

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

# 5. ARRANQUE
echo "[4/4] Lanzando aplicación..."
echo "----------------------------------------------------"
echo "🚀 REPORTAYA ESTARÁ DISPONIBLE EN:"
echo "👉  http://$PUBLIC_IP:3000"
echo "----------------------------------------------------"
echo "(Presiona Ctrl+C para detener)"
echo ""

# Forzamos stty sane una vez más justo antes de arrancar los servicios
stty sane 2>/dev/null

# Lanzamiento usando concurrently en modo RAW para evitar desorden de columnas
# Usamos --raw para que no añada prefijos que desalinean el texto
npx concurrently --raw --kill-others \
  "cross-env PORT=3001 node server/api.cjs" \
  "npx vite --port 3000 --host 0.0.0.0 --clearScreen false"
