#!/usr/bin/env node
/**
 * create_admin.cjs
 * Small utility to create a Firebase Auth user and a Firestore `users/{uid}` document
 * Use with a service account JSON. Not for browser use.
 *
 * Usage examples:
 *  SERVICE_ACCOUNT_PATH=./serviceAccount.json node server/create_admin.cjs -- --email=admin@example.com --password=Secret123 --name="Ayuntamiento Sevilla"
 */

const fs = require('fs');
const path = require('path');

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

  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || args.serviceAccount;
  let serviceAccount = null;
  if (serviceAccountPath) {
    const abs = path.resolve(serviceAccountPath);
    if (!fs.existsSync(abs)) {
      console.error('Service account file not found:', abs);
      process.exit(1);
    }
    serviceAccount = require(abs);
  } else if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('Invalid SERVICE_ACCOUNT_JSON');
      process.exit(1);
    }
  } else {
    console.error('Provide a service account via SERVICE_ACCOUNT_PATH or SERVICE_ACCOUNT_JSON');
    process.exit(1);
  }

  const admin = require('firebase-admin');

  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (e) {
    // already initialized? ignore
  }

  const email = args.email;
  if (!email) {
    console.error('Missing --email=EMAIL argument');
    process.exit(1);
  }

  const password = args.password || Math.random().toString(36).slice(2, 10) + 'A1!';
  const name = args.name || 'Ayuntamiento';
  const initialPoints = parseInt(args.points || '0', 10) || 0;

  try {
    // Check if user already exists by email
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log('User already exists in Auth with uid:', userRecord.uid);
      const uid = userRecord.uid;
      const db = admin.firestore();
      await db.collection('users').doc(uid).set({
        id: uid,
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
      }, { merge: true });
      console.log('Updated Firestore document users/%s (merge) with admin role.', uid);
      process.exit(0);
    } catch (e) {
      // Not found -> create
    }

    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    const db = admin.firestore();
    await db.collection('users').doc(uid).set({
      id: uid,
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
    });

    console.log('Created admin user:', { uid, email, password });
    console.log('Firestore document users/%s created with role admin.', uid);
  } catch (err) {
    console.error('Error creating or updating admin user:', err);
    process.exit(1);
  }
}

main();
