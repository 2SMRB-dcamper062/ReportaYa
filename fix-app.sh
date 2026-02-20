#!/bin/bash

echo "🔧 COMMENCING REPAIR SEQUENCE FOR REPORTAYA..."

# 1. Kill any process on port 3000 and 3001
echo "💀 Killing zombie processes on ports 3000 and 3001..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    powershell.exe -Command "Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }" 2>/dev/null || echo "   Ports are free."
else
    fuser -k 3000/tcp 3001/tcp 2>/dev/null || echo "   Ports are free."
fi

# 2. Fix Permissions and Clean
echo "🧹 Fixing permissions and cleaning artifacts..."
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    sudo chown -R $USER:$USER .
    sudo chmod -R 755 .
fi
rm -rf dist node_modules package-lock.json

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Force reinstall bcryptjs to ensure native bindings (if any) are correct
echo "🔒 Reinstalling bcryptjs..."
npm uninstall bcryptjs
npm install bcryptjs

# 5. Build Frontend
echo "🏗️ Building Frontend..."
npm run build

# 6. Check Mongo & Seed
echo "running mongo check and seeding..."
if pgrep -x "mongod" > /dev/null || command -v mongosh &> /dev/null
then
    echo "✅ MongoDB is available."
    npm run seed:users
else
    echo "⚠️ MongoDB is NOT running. Attempting to start..."
    if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
        sudo mongod --fork --logpath /var/log/mongodb.log || echo "   Could not auto-start mongod."
    else
        echo "   Please start MongoDB manually on Windows."
    fi
fi

# 7. Start Server
echo "🚀 STARTING SERVER..."
npm run dev
