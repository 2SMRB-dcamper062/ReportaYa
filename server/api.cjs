#!/usr/bin/env node
/**
 * api.cjs — Express API server for ReportaYa
 * Connects to MongoDB on localhost:27017, database "reportaya"
 * Collections: users, reports
 */

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'reportaya';
const PORT = process.env.API_PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

let db;

// ─── Connect to MongoDB ───────────────────────────────────────────
async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`✅ Conectado a MongoDB → ${MONGO_URI}/${DB_NAME}`);

  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
  await db.collection('reports').createIndex({ createdAt: -1 });
}

// ─── USER ENDPOINTS ───────────────────────────────────────────────

// GET /api/users/:id — Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Never return password hash
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Error GET /api/users/:id', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/users/by-email/:email — Get user by email
app.get('/api/users/by-email/:email', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ email: decodeURIComponent(req.params.email) });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Error GET /api/users/by-email', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/users/:id — Create or update user profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const userData = { ...req.body, id: req.params.id };
    // Never let client overwrite passwordHash
    delete userData.passwordHash;
    delete userData.password;

    await db.collection('users').updateOne(
      { id: req.params.id },
      { $set: userData },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Error PUT /api/users/:id', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/users/login — Local login (email + password)
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    // If user has a bcrypt hash, verify it
    if (user.passwordHash) {
      let bcrypt;
      try { bcrypt = require('bcryptjs'); } catch(e) { bcrypt = null; }
      if (bcrypt) {
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });
      } else {
        // Fallback: plain text comparison (not recommended for production)
        if (user.plainPassword && user.plainPassword !== password) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }
      }
    } else if (user.plainPassword) {
      // Legacy plain password
      if (user.plainPassword !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
    } else {
      // No password stored — deny login
      return res.status(401).json({ error: 'Esta cuenta no tiene contraseña configurada. Use login social.' });
    }

    const { passwordHash, plainPassword, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Error POST /api/users/login', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── REPORT ENDPOINTS ────────────────────────────────────────────

// GET /api/reports — List all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await db.collection('reports').find({}).sort({ createdAt: -1 }).toArray();
    // Map _id to id if needed
    const mapped = reports.map(r => {
      const { _id, ...rest } = r;
      return { ...rest, id: rest.id || _id.toString() };
    });
    res.json(mapped);
  } catch (err) {
    console.error('Error GET /api/reports', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/reports — Create new report
app.post('/api/reports', async (req, res) => {
  try {
    const report = { ...req.body };
    if (!report.id) report.id = Date.now().toString();
    report.createdAt = report.createdAt || new Date().toISOString();

    await db.collection('reports').insertOne(report);
    res.status(201).json({ ok: true, id: report.id });
  } catch (err) {
    console.error('Error POST /api/reports', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/reports/:id — Update report
app.put('/api/reports/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;

    await db.collection('reports').updateOne(
      { id: req.params.id },
      { $set: updateData },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Error PUT /api/reports/:id', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── START SERVER ─────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API ReportaYa corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ No se pudo conectar a MongoDB:', err);
    process.exit(1);
  });
