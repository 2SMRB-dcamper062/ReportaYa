#!/bin/bash

# ====================================================
# 🚀 REPORTAYA - SISTEMA DE CONTROL (V5.0)
# ====================================================

# Limpieza inicial
clear
stty sane 2>/dev/null

# Función para apagar todo limpiamente
trap 'printf "\n🛑 Deteniendo ReportaYa...\n"; sudo fuser -k 3000/tcp 3001/tcp 27017/tcp 2>/dev/null; stty sane; exit' SIGINT SIGTERM

echo "----------------------------------------------------"
echo "🔧 ARRANCANDO REPORTAYA"
echo "----------------------------------------------------"

# 1. Limpieza de procesos y carpetas conflictivas
echo "[1/4] Liberando puertos y limpiando temporales..."
sudo fuser -k 3000/tcp 3001/tcp 27017/tcp >/dev/null 2>&1
sudo pkill -9 -f node >/dev/null 2>&1
sudo pkill -9 -f vite >/dev/null 2>&1

# El error EACCES se soluciona borrando esta carpeta específica con sudo
sudo rm -rf node_modules/.vite* >/dev/null 2>&1
sudo rm -rf dist >/dev/null 2>&1

# 2. Restaurar permisos básicos
echo "[2/4] Verificando permisos..."
sudo chown -R $USER:$USER .
chmod -R 755 .

# 3. Instalación de seguridad (para evitar el error de "express not found")
if [ ! -d "node_modules/express" ]; then
    echo "📦 Instalando dependencias faltantes..."
    npm install --quiet
fi

# 4. Configuración (.env)
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

# 5. Base de Datos
echo "[3/4] Iniciando Base de Datos..."
sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null

# 6. Arranque
echo "[4/4] Lanzando aplicación..."
echo "----------------------------------------------------"
echo "🚀 REPORTAYA LISTO EN: http://$PUBLIC_IP:3000"
echo "📧 Sistema de correos ACTIVO (Reportes y Contraseñas)"
echo "----------------------------------------------------"
echo ""

# Usamos concurrently de la forma más sencilla posible (como al principio)
# Quitamos los filtros raros para que el flujo de texto sea natural
npx -y concurrently --kill-others \
  "PORT=3001 node server/api.cjs" \
  "npx -y vite --port 3000 --host 0.0.0.0 --clearScreen false"
