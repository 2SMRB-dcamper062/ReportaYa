#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SISTEMA DE CONTROL (V4.4 - FINAL FIX)
# ====================================================

# 1. LIMPIEZA VISUAL
stty sane 2>/dev/null
clear

# Función para apagar todo limpiamente
trap 'printf "\n🛑 Deteniendo servicios...\n"; sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null; stty sane; exit' SIGINT SIGTERM

printf -- "====================================================\n"
printf "🔧 REPARACIÓN CRÍTICA DE PERMISOS\n"
printf -- "====================================================\n"

# 2. LIMPIEZA DE PROCESOS
printf "[1/4] Liberando puertos y procesos activos...\n"
{
    sudo fuser -k 3000/tcp 3001/tcp 27017/tcp
    sudo pkill -9 -f node
    sudo pkill -9 -f mongod
    sudo pkill -9 -f vite
} >/dev/null 2>&1

# 3. SOLUCIÓN RADICAL AL ERROR DE VITE.CONFIG.TS (EACCES)
printf "[2/4] Corrigiendo archivos bloqueados...\n"

# El error "EACCES: permission denied, open vite.config.ts..." 
# ocurre porque Vite intenta crear un archivo temporal (.mjs) basado en el config.
# Vamos a limpiar TODO lo que Vite usa para arrancar.

sudo rm -rf node_modules/.vite
sudo rm -rf node_modules/.vite-temp
sudo rm -rf .vite-temp
sudo rm -rf dist

# Reclamamos la propiedad del usuario para TODO el proyecto incluyendo archivos de config
sudo chown -R $(whoami):$(whoami) .

# Damos permisos totales a los archivos de configuración y carpetas de dependencias
sudo chmod 777 vite.config.ts
sudo chmod -R 777 node_modules 2>/dev/null || true

# Pre-creamos la carpeta donde falla Vite y le damos permiso total
mkdir -p node_modules/.vite-temp
sudo chmod -R 777 node_modules/.vite-temp

# 4. CONFIGURACIÓN Y BASE DE DATOS
printf "[3/4] Iniciando Base de Datos y Configuración...\n"
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

# 5. ARRANQUE FINAL
printf "[4/4] Lanzando aplicación...\n"
printf -- "----------------------------------------------------\n"
printf "🚀 ACCESO WEB: http://$PUBLIC_IP:3000\n"
printf -- "----------------------------------------------------\n"
printf "(Presiona Ctrl+C para salir)\n\n"

# Forzamos modo normal de terminal
stty sane 2>/dev/null

# Usamos npx -y y pasamos el puerto directamente para evitar fallos de cross-env
npx -y concurrently --raw --kill-others \
  "PORT=3001 node server/api.cjs" \
  "npx -y vite --port 3000 --host 0.0.0.0 --clearScreen false"
