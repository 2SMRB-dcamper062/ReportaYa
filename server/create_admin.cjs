#!/usr/bin/env node
/**
 * create_admin.cjs
 * Utility to create an admin user directly in MongoDB.
 * No Firebase dependency needed.
 *
 * Usage:
 *   node server/create_admin.cjs --email=admin@example.com --password=Secret123 --name="Ayuntamiento Sevilla"
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'reportaya';

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [k, v] = arg.split('=');
      args[k.replace(/^--/, '')] = v === undefined ? true : v;
    }
  });
  return args;
}

async function main() {
  const args = parseArgs();

  const email = args.email;
  if (!email) {
    console.error('Missing --email=EMAIL argument');
    process.exit(1);
  }

  const password = args.password || Math.random().toString(36).slice(2, 10) + 'A1!';
  const name = args.name || 'Ayuntamiento';
  const initialPoints = parseInt(args.points || '0', 10) || 0;

  let bcrypt;
  try {
    bcrypt = require('bcryptjs');
  } catch (e) {
    console.error('bcryptjs not found. Run: npm install bcryptjs');
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCol = db.collection('users');

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    const adminId = `admin-${email.replace(/[^a-z0-9]/gi, '-')}`;

    const adminProfile = {
      id: adminId,
      name,
      email,
      role: 'admin',
      inventory: [],
      equippedFrame: null,
      equippedBackground: null,
      points: initialPoints,
      experience: 0,
      premium: false,
      avatar: '',
      passwordHash,
    };

    // Upsert: create or update
    const result = await usersCol.updateOne(
      { email },
      { $set: adminProfile },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('✅ Admin creado:', { id: adminId, email, password });
    } else {
      console.log('✅ Admin actualizado:', { id: adminId, email });
    }

    console.log(`Documento en colección 'users' con rol admin.`);
  } catch (err) {
    console.error('❌ Error creando/actualizando admin:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
