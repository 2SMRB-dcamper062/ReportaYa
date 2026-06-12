#!/usr/bin/env node
/**
 * import_rtdb_to_firestore.cjs
 * Usage:
 *   SERVICE_ACCOUNT_PATH=./serviceAccount.json node server/import_rtdb_to_firestore.cjs [path/to/export.json]
 *
 * This script reads a Realtime Database export JSON and writes top-level keys
 * as Firestore collections. For each object under a top-level key it will
 * create/update a document with the object's key as the document ID.
 *
 * WARNING: inspect your JSON before running. This will write to Firestore
 * using the provided service account (admin privileges).
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || path.join(__dirname, './serviceAccount.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account JSON not found. Set SERVICE_ACCOUNT_PATH env var to the file.');
  process.exit(1);
}

try {
  admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });
} catch (e) {
  // ignore if already initialized
}

const db = admin.firestore();

const inputFile = process.argv[2] || path.join(__dirname, '..', 'reportaya2-default-rtdb-export.json');
if (!fs.existsSync(inputFile)) {
  console.error('Input JSON not found:', inputFile);
  process.exit(1);
}

const raw = fs.readFileSync(inputFile, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error('Invalid JSON:', err);
  process.exit(1);
}

async function importObjectAsCollection(name, obj) {
  if (!obj || typeof obj !== 'object') return;
  const keys = Object.keys(obj);
  for (const k of keys) {
    const docRef = db.collection(name).doc(String(k));
    const value = obj[k];
    try {
      await docRef.set(value, { merge: true });
      console.log(`Wrote ${name}/${k}`);
    } catch (err) {
      console.error(`Failed ${name}/${k}:`, err);
    }
  }
}

async function main() {
  console.log('Starting import to Firestore from', inputFile);
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      console.log('Importing collection:', key);
      await importObjectAsCollection(key, val);
    } else if (Array.isArray(val)) {
      console.log(`Importing array items into collection: ${key}`);
      for (const item of val) {
        try {
          const ref = db.collection(key).doc();
          await ref.set(item);
          console.log(`Wrote ${key}/${ref.id}`);
        } catch (err) {
          console.error(`Failed write to ${key}:`, err);
        }
      }
    } else {
      console.log(`Skipping top-level key ${key} (not an object/array)`);
    }
  }
  console.log('Import finished.');
  process.exit(0);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
