#!/usr/bin/env node
// Small Express endpoint to revoke Firebase Refresh Tokens for a UID
// Requires SERVICE_ACCOUNT_PATH or SERVICE_ACCOUNT_JSON env var for admin SDK.

const express = require('express');
const app = express();
app.use(express.json());

let admin;
try {
  admin = require('firebase-admin');
} catch (e) {
  console.error('firebase-admin not installed. Run `npm install firebase-admin` in server folder.');
  process.exit(1);
}

function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;
  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });
    return admin;
  }
  const json = process.env.SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const obj = JSON.parse(json);
      admin.initializeApp({ credential: admin.credential.cert(obj) });
      return admin;
    } catch (e) {
      console.error('Invalid SERVICE_ACCOUNT_JSON');
      process.exit(1);
    }
  }
  console.error('Provide SERVICE_ACCOUNT_PATH or SERVICE_ACCOUNT_JSON to initialize firebase-admin');
  process.exit(1);
}

initAdmin();

app.post('/revoke-sessions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth' });
    const idToken = authHeader.split(' ')[1];

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = req.body.uid;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });
    if (decoded.uid !== uid) return res.status(403).json({ error: 'Forbidden' });

    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(uid);

    // Clear sessions array in Firestore
    const db = admin.firestore();
    await db.collection('users').doc(uid).update({ sessions: [] });

    res.json({ ok: true });
  } catch (err) {
    console.error('Error in revoke-sessions:', err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 4243;
app.listen(PORT, () => console.log(`Revoke sessions server listening on ${PORT}`));
