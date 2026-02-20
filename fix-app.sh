#!/bin/bash

# Script de configuración y reparación de ReportaYa
# Este script instalará dependencias, preparará la base de datos y verificará el entorno.

echo "===================================================="
echo "🔧 INICIANDO SECUENCIA DE CONFIGURACIÓN/REPARACIÓN"
echo "===================================================="

# 0. Matar procesos existentes en puertos 3000 y 3001
echo "💀 Limpiando puertos 3000 y 3001..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Comandos para Windows (Git Bash / PowerShell)
    powershell.exe -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess -Force" 2>/dev/null || echo "   Puerto 3000 libre."
    powershell.exe -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess -Force" 2>/dev/null || echo "   Puerto 3001 libre."
else
    # Comandos para Linux / macOS
    fuser -k 3000/tcp 2>/dev/null || echo "   Puerto 3000 libre."
    fuser -k 3001/tcp 2>/dev/null || echo "   Puerto 3001 libre."
fi

# 1. Limpieza (Opcional, pero recomendado para reparación)
echo "🧹 Limpiando artefactos antiguos..."
rm -rf dist node_modules package-lock.json
echo "✅ Limpieza completada."

# 2. Instalación de dependencias
echo "📦 Instalando dependencias (npm install)..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias. Revisa tu conexión a internet o los logs de npm."
    exit 1
fi
echo "✅ Dependencias instaladas."

# 3. Verificación de MongoDB
echo "� Verificando estado de MongoDB..."
# En Windows, mongod suele correr como servicio. Intentamos un ping básico si está disponible.
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB está respondiendo."
    else
        echo "⚠️ MongoDB no parece estar respondiendo en el puerto por defecto (27017)."
        echo "   Asegúrate de tener MongoDB instalado y ejecutándose."
    fi
else
    echo "ℹ️ mongosh no disponible para verificar, continuando..."
fi

# 4. Poblar base de datos (Seeding)
echo "🌱 Poblando base de datos con usuarios de prueba..."
npm run seed:users
if [ $? -ne 0 ]; then
    echo "⚠️ Hubo un problema al poblar la base de datos. Asegúrate de que MongoDB esté arrancado."
fi

# 5. Compilación (Build)
echo "🏗️ Compilando el frontend (npm run build)..."
npm run build
echo "✅ Compilación completada."

echo ""
echo "===================================================="
echo "🎉 CONFIGURACIÓN FINALIZADA CON ÉXITO"
echo "===================================================="
echo "Puedes iniciar la aplicación ahora con:"
echo "   npm run dev"
echo "===================================================="
