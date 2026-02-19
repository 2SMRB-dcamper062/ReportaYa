// Simple Express server to create a Stripe Checkout session.
// Usage: set STRIPE_SECRET_KEY and STRIPE_PRICE_CENTS (e.g., 499 for 4.99 EUR), and DOMAIN (e.g., http://localhost:3000)

const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
app.use(express.json());

// Optional: Firebase Admin to support session revocation
let admin;
try {
  admin = require('firebase-admin');
} catch (e) {
  console.warn('firebase-admin not installed. Revoke-sessions endpoint will not be available until firebase-admin is installed.');
}

function initAdmin() {
  if (!admin) return null;
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
      console.error('Invalid SERVICE_ACCOUNT_JSON for firebase-admin init');
      return null;
    }
  }
  return null;
}

app.post('/create-checkout-session', async (req, res) => {
  try {
    const domain = process.env.DOMAIN || 'http://localhost:3000';
    const amount = parseInt(process.env.STRIPE_PRICE_CENTS || '499', 10);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'ReportaYa Premium' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${domain}/?checkout=success`,
      cancel_url: `${domain}/?checkout=cancel`,
      customer_email: req.body?.email || undefined,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe create session error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
// Add revoke-sessions endpoint if admin SDK is available
app.post('/revoke-sessions', async (req, res) => {
  try {
    if (!admin) return res.status(501).json({ error: 'Admin SDK not configured on server' });
    const initialized = initAdmin();
    if (!initialized) return res.status(500).json({ error: 'Admin SDK initialization failed' });

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth header' });
    const idToken = authHeader.split(' ')[1];

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = req.body.uid;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });
    if (decoded.uid !== uid) return res.status(403).json({ error: 'Forbidden' });

    // Revoke refresh tokens
    await admin.auth().revokeRefreshTokens(uid);

    // Clear sessions array in Firestore (best-effort)
    const db = admin.firestore();
    await db.collection('users').doc(uid).update({ sessions: [] });

    res.json({ ok: true });
  } catch (err) {
    console.error('Error in revoke-sessions:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => console.log(`Checkout server running on port ${PORT}`));
