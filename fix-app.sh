#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SISTEMA DE CONTROL (V4.1)
# ====================================================

# 1. ARREGLO VISUAL (SOLUCIÓN ESCALERA)
# stty sane devuelve la terminal a modo normal cada vez que se llama
stty sane 2>/dev/null
clear

# Función para apagar todo limpiamente
trap 'printf "\n🛑 Deteniendo servicios...\n"; sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null; stty sane; exit' SIGINT SIGTERM

printf "====================================================\n"
printf "🔧 REPARANDO EL ENTORNO DE REPORTAYA\n"
printf "====================================================\n"

# 2. LIMPIEZA DE PROCESOS
printf "[1/4] Liberando puertos y procesos antiguos...\n"
stty sane 2>/dev/null
{
    sudo fuser -k 3000/tcp 3001/tcp 27017/tcp
    sudo pkill -9 -f node
    sudo pkill -9 -f mongod
    sudo pkill -9 -f vite
} >/dev/null 2>&1

# 3. SOLUCIÓN PERMISOS Y DEPENDENCIAS
printf "[2/4] Resolviendo bloqueos de archivos y dependencias...\n"
stty sane 2>/dev/null
# Borrar carpetas de cache conflictivas
sudo rm -rf node_modules/.vite* .vite-temp dist 2>/dev/null

# Reclamar propiedad y dar permisos
sudo chown -R $(whoami):$(whoami) .
if [ ! -d "node_modules" ]; then
    printf "📦 Instalando librerías necesarias...\n"
    npm install --quiet
fi
sudo chmod -R 777 node_modules/.vite* 2>/dev/null || true

# 4. BASE DE DATOS Y CONFIGURACIÓN
printf "[3/4] Iniciando Base de Datos y Configuración...\n"
stty sane 2>/dev/null
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
stty sane 2>/dev/null
printf "----------------------------------------------------\n"
printf "🚀 REPORTAYA LISTO EN: http://$PUBLIC_IP:3000\n"
printf "----------------------------------------------------\n"
printf "(Presiona Ctrl+C para detener)\n\n"

# Reajuste final de terminal antes del stream de datos
stty sane 2>/dev/null

# Usamos npx -y para evitar preguntas interactivas
# Quitamos cross-env y usamos variable de entorno directa de shell
npx -y concurrently --raw --kill-others \
  "PORT=3001 node server/api.cjs" \
  "npx -y vite --port 3000 --host 0.0.0.0 --clearScreen false"
