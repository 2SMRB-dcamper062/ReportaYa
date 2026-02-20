#!/usr/bin/env node
/**
 * api.cjs — Express API server for ReportaYa
 * Connects to MongoDB on localhost:27017, database "reportaya"
 * Collections: users, reports
 *
 * Endpoints:
 *   GET    /api/users/:id              — Get user by ID
 *   GET    /api/users/by-email/:email  — Get user by email
 *   PUT    /api/users/:id              — Create or update user profile
 *   POST   /api/users/login            — Local login (email + password)
 *   POST   /api/users/register         — Register new user (email + password + name)
 *   GET    /api/reports                — List all reports
 *   POST   /api/reports                — Create new report
 *   PUT    /api/reports/:id            — Update report
 *   DELETE /api/reports/:id            — Delete report
 *   POST   /create-checkout-session    — Create Stripe checkout session (premium)
 *   GET    /api/health                 — Health check
 */

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// Safe require for bcryptjs
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  bcrypt = null;
  console.warn('⚠️ bcryptjs no está instalado. Registro y Login local fallarán.');
}

// Safe require for nodemailer
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
  console.warn('⚠️ nodemailer no está instalado. Los correos no se enviarán.');
}

// ─── Email Service ────────────────────────────────────────────────
let emailTransporter = null;
if (nodemailer && process.env.SMTP_USER && process.env.SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  console.log('✅ Servicio de email configurado con', process.env.SMTP_USER);
} else {
  console.warn('⚠️ SMTP_USER / SMTP_PASS no configurados. Los emails se loguearan en consola.');
}

async function sendEmail(to, subject, html) {
  if (emailTransporter) {
    try {
      await emailTransporter.sendMail({
        from: `"ReportaYa" <${process.env.SMTP_USER}>`,
        to, subject, html
      });
      console.log(`📧 Email enviado a ${to}: ${subject}`);
    } catch (err) {
      console.error('❌ Error enviando email:', err.message);
    }
  } else {
    console.log(`📧 [SIMULADO] Email a ${to}:`);
    console.log(`   Asunto: ${subject}`);
    console.log(`   Contenido: ${html.substring(0, 200)}...`);
  }
}

// ─── Password Strength Validation ─────────────────────────────────
function validatePasswordStrength(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Al menos una mayúscula');
  if (!/[a-z]/.test(password)) errors.push('Al menos una minúscula');
  if (!/[0-9]/.test(password)) errors.push('Al menos un número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) errors.push('Al menos un carácter especial (!@#$%...)');
  return errors;
}

const crypto = require('crypto');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'reportaya';
const IS_PROD = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();

// --- SECURITY HEADERS (Basic Helmet implementation) ---
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; frame-src https://js.stripe.com;");
  next();
});

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Reduced limit for security
app.use(express.static(path.join(__dirname, '../dist')));

let db;
let dbClient;

// --- DB MIDDLEWARE (Ensure connection) ---
app.use((req, res, next) => {
  if (!db && !req.path.startsWith('/api/health')) {
    return res.status(503).json({ error: 'La base de datos no está lista. Por favor, asegúrese de que MongoDB esté corriendo.' });
  }
  next();
});

// ─── Connect to MongoDB ───────────────────────────────────────────
async function connectDB() {
  const client = new MongoClient(MONGO_URI, { connectTimeoutMS: 5000 });
  await client.connect();
  dbClient = client;
  db = client.db(DB_NAME);
  console.log(`✅ Conectado a MongoDB → ${MONGO_URI}/${DB_NAME}`);

  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
  await db.collection('users').createIndex({ id: 1 }, { unique: true, sparse: true });
  await db.collection('reports').createIndex({ createdAt: -1 });
  await db.collection('reports').createIndex({ id: 1 }, { unique: true, sparse: true });
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    // Quick ping to confirm MongoDB is responsive
    await db.command({ ping: 1 });
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// ─── USER ENDPOINTS ───────────────────────────────────────────────

// GET /api/users/:id — Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Never return password hash
    const { passwordHash, plainPassword, _id, ...safeUser } = user;
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
    const { passwordHash, plainPassword, _id, ...safeUser } = user;
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

    // --- PREVENT PRIVILEGE ESCALATION ---
    // User cannot change their own role or premium status via this endpoint
    delete userData.role;
    delete userData.premium;
    delete userData.passwordHash;
    delete userData.plainPassword;
    delete userData.password;
    delete userData._id;
    delete userData.points; // Points should be managed by the server

    // Basic validation
    if (userData.name && typeof userData.name !== 'string') return res.status(400).json({ error: 'Nombre inválido' });
    if (userData.email && typeof userData.email !== 'string') return res.status(400).json({ error: 'Email inválido' });

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

// POST /api/users/register — Register a new user with email + password
app.post('/api/users/register', async (req, res) => {
  try {
    console.log('📝 POST /api/users/register - Start');
    const { email, password, name, surname, postalCode } = req.body;
    console.log('   Payload received:', { email, name, surname, postalCode }); // Don't log password

    if (!email || !password || !surname || !postalCode) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validate password strength
    const pwErrors = validatePasswordStrength(password);
    if (pwErrors.length > 0) {
      return res.status(400).json({ error: 'Contraseña débil: ' + pwErrors.join(', ') });
    }

    // Strict Postal Code Validation Removed
    // if (!postalCode.startsWith('41')) {
    //   return res.status(400).json({ error: 'Solo se permiten registros con código postal de Sevilla (41xxx)' });
    // }

    // Check if email already exists
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const userId = `local-${Date.now()}`;
    const userProfile = {
      id: userId,
      name: name || email.split('@')[0],
      surname,
      postalCode,
      email,
      role: 'citizen',
      points: 0,
      experience: 0,
      inventory: [],
      equippedFrame: null,
      equippedBackground: null,
      profileTag: null,
      premium: false,
      avatar: '',
      passwordHistory: [],  // Store previous password hashes
    };

    if (bcrypt) {
      console.log('   Hashing password...');
      userProfile.passwordHash = await bcrypt.hash(password, 10);
      console.log('   Password hashed.');
    } else {
      console.error('❌ Error: bcryptjs no está disponible.');
      return res.status(503).json({ error: 'El sistema de seguridad no está disponible. Por favor ejecute npm install.' });
    }

    await db.collection('users').insertOne(userProfile);
    console.log('✅ User inserted into DB:', userId);

    console.log('   Sending welcome email (background)...');
    sendEmail(email, '¡Bienvenido a ReportaYa!', `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <h1 style="color:#1e3a5f;">¡Bienvenido a ReportaYa! 🎉</h1>
        <p>Hola <strong>${name || email.split('@')[0]}</strong>,</p>
        <p>Tu cuenta ha sido creada correctamente. Ya puedes empezar a reportar incidencias en tu ciudad.</p>
        <p><strong>Tus credenciales de acceso son:</strong></p>
        <p>Correo electrónico: <strong>${email}</strong></p>
        
        <p>Si no creaste esta cuenta o te olvidas de la contraseña, por favor, cambia tus credenciales de acceso:</p>
        <p><a href="http://localhost:3000/?view=forgot" style="color:#007bff;text-decoration:underline;">Cambiar contraseña</a></p>

        <hr style="border:none;border-top:1px solid #eee;">
        
        <div style="text-align:center;margin-top:20px;">
          <p style="color:#aaa;font-size:11px;">ReportaYa — La plataforma ciudadana de Sevilla</p>
          <img src="https://via.placeholder.com/150x50?text=ReportaYa+Logo" alt="ReportaYa Logo" style="max-height:50px;display:block;margin:0 auto;">
        </div>
      </div>
    `).catch(() => { });

    const { passwordHistory, passwordHash, ...safeUser } = userProfile;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error('Error POST /api/users/register', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
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
      try { bcrypt = require('bcryptjs'); } catch (e) { bcrypt = null; }
      if (bcrypt) {
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });
      } else {
        // Fallback: plain text comparison (DEPRECATED - REMOVING FOR SECURITY)
        return res.status(401).json({ error: 'Credenciales inválidas (Seguridad actualizada)' });
      }
    } else if (user.plainPassword) {
      // Legacy plain password block - Deny access and suggest reset
      return res.status(401).json({ error: 'Su cuenta requiere una actualización de seguridad. Por favor, restablezca su contraseña.' });
    } else {
      // No password stored — deny login
      return res.status(401).json({ error: 'Esta cuenta no tiene contraseña configurada. Use login social.' });
    }

    const { passwordHash, plainPassword, _id, sessions, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Error POST /api/users/login', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/users/:id/change-password — Change password (requires old password)
app.post('/api/users/:id/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'La contraseña actual y la nueva son requeridas' });

    // Validate password strength
    const pwErrors = validatePasswordStrength(newPassword);
    if (pwErrors.length > 0) {
      return res.status(400).json({ error: 'Contraseña débil: ' + pwErrors.join(', ') });
    }

    const user = await db.collection('users').findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (!bcrypt) return res.status(503).json({ error: 'El sistema de seguridad no está disponible.' });

    const match = user.passwordHash ? await bcrypt.compare(oldPassword, user.passwordHash) : false;
    if (!match) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    // Check password history — prevent reusing any of the last 10 passwords
    const history = user.passwordHistory || [];
    for (const oldHash of history) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        return res.status(400).json({ error: 'No puedes reutilizar una contraseña anterior' });
      }
    }
    // Also check if new password is same as current
    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    // Push old hash to history (keep last 10)
    const updatedHistory = [...history, user.passwordHash].slice(-10);

    await db.collection('users').updateOne(
      { id: req.params.id },
      { $set: { passwordHash: newHash, passwordHistory: updatedHistory } }
    );

    // Send notification email
    if (user.email) {
      sendEmail(user.email, 'Contraseña cambiada — ReportaYa', `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#1e3a5f;">Contraseña actualizada 🔒</h2>
          <p>Hola <strong>${user.name || 'usuario'}</strong>,</p>
          <p>Tu contraseña de ReportaYa ha sido cambiada correctamente.</p>
          <p>Si no realizaste este cambio, contacta con soporte inmediatamente.</p>
          <p style="color:#888;font-size:12px;">Fecha: ${new Date().toLocaleString('es-ES')}</p>
          <hr style="border:none;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:11px;">ReportaYa — La plataforma ciudadana de Sevilla</p>
        </div>
      `).catch(() => { });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error POST /api/users/:id/change-password', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/users/forgot-password — Send reset link via email
app.post('/api/users/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email es requerido' });

    const user = await db.collection('users').findOne({ email });
    // Always return success (don't reveal if email exists)
    if (!user) return res.json({ ok: true });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.collection('users').updateOne(
      { email },
      { $set: { resetToken, resetExpires } }
    );

    const domain = process.env.DOMAIN || 'http://localhost:3000';
    const resetUrl = `${domain}/?reset=${resetToken}`;

    sendEmail(email, 'Restablecer contraseña — ReportaYa', `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <h2 style="color:#1e3a5f;">Restablecer contraseña 🔑</h2>
        <p>Hola <strong>${user.name || 'usuario'}</strong>,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <p style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" style="background:#1e3a5f;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Restablecer Contraseña</a>
        </p>
        <p style="color:#888;font-size:12px;">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este mensaje.</p>
        <p style="color:#aaa;font-size:11px;">URL directa: ${resetUrl}</p>
        <hr style="border:none;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:11px;">ReportaYa — La plataforma ciudadana de Sevilla</p>
      </div>
    `).catch(() => { });

    res.json({ ok: true });
  } catch (err) {
    console.error('Error POST /api/users/forgot-password', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/users/reset-password — Reset password using token
app.post('/api/users/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });

    // Validate password strength
    const pwErrors = validatePasswordStrength(newPassword);
    if (pwErrors.length > 0) {
      return res.status(400).json({ error: 'Contraseña débil: ' + pwErrors.join(', ') });
    }

    const user = await db.collection('users').findOne({ resetToken: token });
    if (!user) return res.status(400).json({ error: 'Token inválido o expirado' });

    if (new Date() > new Date(user.resetExpires)) {
      return res.status(400).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' });
    }

    if (!bcrypt) return res.status(503).json({ error: 'El sistema de seguridad no está disponible.' });

    // Check password history
    const history = user.passwordHistory || [];
    for (const oldHash of history) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        return res.status(400).json({ error: 'No puedes reutilizar una contraseña anterior' });
      }
    }
    if (user.passwordHash && await bcrypt.compare(newPassword, user.passwordHash)) {
      return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const updatedHistory = [...history, user.passwordHash].filter(Boolean).slice(-10);

    await db.collection('users').updateOne(
      { resetToken: token },
      {
        $set: { passwordHash: newHash, passwordHistory: updatedHistory },
        $unset: { resetToken: '', resetExpires: '' }
      }
    );

    // Notify user
    if (user.email) {
      sendEmail(user.email, 'Contraseña restablecida — ReportaYa', `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#1e3a5f;">Contraseña restablecida ✅</h2>
          <p>Tu contraseña ha sido cambiada correctamente. Ya puedes iniciar sesión.</p>
          <p style="color:#888;font-size:12px;">Fecha: ${new Date().toLocaleString('es-ES')}</p>
          <hr style="border:none;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:11px;">ReportaYa — La plataforma ciudadana de Sevilla</p>
        </div>
      `).catch(() => { });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error POST /api/users/reset-password', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── REPORT ENDPOINTS ────────────────────────────────────────────

// GET /api/reports — List all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await db.collection('reports').find({}).sort({ createdAt: -1 }).toArray();
    // Map _id to id if needed, and strip internal mongo _id
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

// GET /api/reports/:id — Get single report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await db.collection('reports').findOne({ id: req.params.id });
    if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });
    const { _id, ...rest } = report;
    res.json({ ...rest, id: rest.id || _id.toString() });
  } catch (err) {
    console.error('Error GET /api/reports/:id', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/reports — Create new report
app.post('/api/reports', async (req, res) => {
  try {
    const report = { ...req.body };

    // Basic Validation
    if (!report.title || typeof report.title !== 'string' || report.title.length < 3) {
      return res.status(400).json({ error: 'Título inválido o demasiado corto' });
    }
    if (!report.description || typeof report.description !== 'string') {
      return res.status(400).json({ error: 'Descripción requerida' });
    }

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
    console.error(`❌ Error en ${req.method} ${req.path}:`, err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
});

// DELETE /api/reports/:id — Delete report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const result = await db.collection('reports').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Error DELETE /api/reports/:id', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── STRIPE CHECKOUT ──────────────────────────────────────────────

app.post('/create-checkout-session', async (req, res) => {
  try {
    let stripe;
    try {
      stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
    } catch (e) {
      return res.status(501).json({ error: 'Stripe no está configurado en el servidor.' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(501).json({ error: 'STRIPE_SECRET_KEY no está configurada.' });
    }

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

// Firebase Revoke Sessions endpoint removed. 
// Authentication is now handled locally via MongoDB.


// ─── START SERVER ─────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API ReportaYa corriendo en http://localhost:${PORT}`);
      if (PORT != 3000) {
        console.warn("⚠️ ALERTA: La aplicación NO está corriendo en el puerto 3000. Revise su configuración.");
      } else {
        console.log("✅ Aplicación corriendo correctamente en puerto 3000.");
      }
      console.log(`📋 Endpoints disponibles:`);
      console.log(`   GET    /api/health`);
      console.log(`   GET    /api/users/:id`);
      console.log(`   GET    /api/users/by-email/:email`);
      console.log(`   PUT    /api/users/:id`);
      console.log(`   POST   /api/users/login`);
      console.log(`   POST   /api/users/register`);
      console.log(`   GET    /api/reports`);
      console.log(`   GET    /api/reports/:id`);
      console.log(`   POST   /api/reports`);
      console.log(`   PUT    /api/reports/:id`);
      console.log(`   DELETE /api/reports/:id`);
      console.log(`   POST   /create-checkout-session`);
    });
  })
  .catch(err => {
    console.error('❌ No se pudo conectar a MongoDB:', err);
    process.exit(1);
  });

// ─── SERVE FRONTEND (Optional: for production) ─────────────────────
app.get('*', (req, res) => {
  // If request is not an API call, serve the frontend
  if (!req.path.startsWith('/api') &&
    !req.path.startsWith('/create-checkout-session')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'), (err) => {
      if (err) {
        // Fallback or error if dist is not built
        res.status(404).send('Frontend not built. Run "npm run build" first.');
      }
    });
  }
});
