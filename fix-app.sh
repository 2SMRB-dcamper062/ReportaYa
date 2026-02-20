#!/bin/bash

echo "===================================================="
echo "🔧 REPAIR & CONFIGURATION SEQUENCE FOR REPORTAYA"
echo "===================================================="

# 1. Kill any process on ports 3000 and 3001
echo "💀 Cleaning ports 3000 and 3001..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    powershell.exe -Command "Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }" 2>/dev/null
else
    sudo fuser -k 3000/tcp 3001/tcp 2>/dev/null || echo "   Ports already free."
fi

# 2. Fix Permissions (Crucial for Ubuntu EACCES errors)
echo "🔐 Fixing file permissions..."
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    sudo chown -R $USER:$USER .
    sudo chmod -R 755 .
    echo "✅ Permissions restored for user $USER."
fi

# 3. Clean and Install
echo "🧹 Cleaning old artifacts and installing dependencies..."
rm -rf dist node_modules package-lock.json
npm install

# 4. Ensure MongoDB is running
echo "🍃 Ensuring MongoDB is active..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running."
else
    echo "⚠️ MongoDB is not running. Attempting to start..."
    if sudo systemctl start mongod 2>/dev/null || sudo systemctl start mongodb 2>/dev/null; then
        echo "✅ MongoDB started via systemctl."
    else
        echo "ℹ️ Systemd service not found, attempting manual background start..."
        sudo mkdir -p /data/db
        sudo chown -R $USER:$USER /data/db
        mongod --fork --logpath /tmp/mongodb.log --dbpath /data/db --bind_ip 127.0.0.1 || echo "❌ Failed to start MongoDB."
    fi
fi

# 5. Wait for MongoDB to be ready (Loop until ping works)
echo "⏳ Waiting for MongoDB to accept connections..."
MAX_RETRIES=10
COUNT=0
while ! (mongosh --eval "db.adminCommand('ping')" --quiet &>/dev/null || mongo --eval "db.adminCommand('ping')" --quiet &>/dev/null); do
    sleep 1
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo "❌ MongoDB taking too long to start. Please check logs."
        exit 1
    fi
    echo "   ...waiting ($COUNT/$MAX_RETRIES)"
done
echo "✅ MongoDB is ready!"

# 6. Seed Database
echo "🌱 Seeding test users and reports..."
npm run seed:users

# 7. Build Frontend
echo "🏗️ Building Frontend..."
npm run build

echo ""
echo "===================================================="
echo "🎉 SYSTEM READY"
echo "===================================================="
echo "Starting the application now..."
echo "===================================================="

# 8. Start Application
npm run dev:server
