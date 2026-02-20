#!/bin/bash

echo "🔧 COMMENCING REPAIR SEQUENCE FOR REPORTAYA..."

# 1. Kill any process on port 3000
echo "💀 Killing zombie processes on port 3000..."
fuser -k 3000/tcp || echo "   Port 3000 is free."

# 2. Clean artifacts
echo "🧹 Cleaning dist and node_modules..."
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

# 6. Check Mongo
echo "running mongo check..."
if pgrep -x "mongod" > /dev/null
then
    echo "✅ MongoDB is running."
else
    echo "⚠️ MongoDB is NOT running. Attempting to start..."
    # Attempt to start mongo (this might need sudo depending on setup, but trying standard)
    mongod --fork --logpath /var/log/mongodb.log || echo "   Could not auto-start mongod. Please ensure it is running."
fi

# 7. Start Server
echo "🚀 STARTING SERVER ON PORT 3000..."
npm start
