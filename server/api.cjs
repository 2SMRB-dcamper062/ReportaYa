#!/usr/bin/env node
/**
 * api.cjs — Express API server for ReportaYa
 * Connects to MongoDB Atlas (via .env) or fallback localhost
 * Collections: users, reports
 *
 * Endpoints:
 * GET    /api/users/:id              — Get user by ID
 * GET    /api/users/by-email/:email  — Get user by email
 * PUT    /api/users/:id              — Create or update user profile
 * POST   /api/users/login            — Local login (email + password)
 * POST   /api/users/register         — Register new user (email + password + name)
 * GET    /api/reports                — List all reports
 * POST   /api/reports                — Create new report
 * PUT    /api/reports/:id            — Update report
 * DELETE /api/reports/:id            — Delete report
 * POST   /create-checkout-session    — Create Stripe checkout session (premium)
 * GET    /api/health                 — Health check
 */

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// --- MANUAL ENV LOADER (Debe ejecutarse antes de definir constantes) ---
try {
  const fs = require('fs');
  let envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    envPath = path.join(__dirname, '../.env');
  }
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.replace(/\r/g, '').trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const value = trimmed.substring(idx + 1).trim();
        if (key) process.env[key] = value;
      }
    });
    console.log('✅ Variables de entorno cargadas desde .env');
  }
} catch (e) {
  console.warn('⚠️ No se pudo cargar el archivo .env de forma manual');
}

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
let isRealEmail = false;

async function initEmail() {
  if (nodemailer && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transportConfig = {
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    };

    if (process.env.SMTP_HOST) {
      transportConfig.host = process.env.SMTP_HOST;
      transportConfig.port = parseInt(process.env.SMTP_PORT || '587');
      transportConfig.secure = transportConfig.port === 465;
      console.log(`📡 SMTP Config: Host=${transportConfig.host}, Port=${transportConfig.port}, Secure=${transportConfig.secure}`);
    } else {
      transportConfig.service = process.env.SMTP_SERVICE || 'gmail';
      console.log(`📡 SMTP Config: Service=${transportConfig.service}`);
    }

    emailTransporter = nodemailer.createTransport(transportConfig);

    emailTransporter.verify((error) => {
      if (error) {
        console.error('❌ ERROR CRÍTICO EN SMTP:', error.message);
        isRealEmail = false;
      } else {
        console.log('🚀 SERVIDOR DE CORREO LISTO: Envío real activado para', process.env.SMTP_USER);
        isRealEmail = true;
      }
    });
  } else if (nodemailer) {
    try {
      console.log('🧪 Iniciando Modo de Prueba (Buzón Virtual)...');
      const testAccount = await nodemailer.createTestAccount();
      emailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      isRealEmail = false;
    } catch (err) {
      console.error('❌ Error configurando motor de correo:', err.message);
    }
  }
}

initEmail().catch(console.error);

async function sendEmail(to, subject, html) {
  if (emailTransporter) {
    try {
      console.log(`📧 Intentando enviar correo a: ${to}...`);
      const fromEmail = process.env.SMTP_SENDER || process.env.SMTP_USER || 'noreply@reportaya.es';
      const info = await emailTransporter.sendMail({
        from: `"ReportaYa" <${fromEmail}>`,
        to,
        subject,
        html
      });

      if (isRealEmail) {
        console.log(`✅ CORREO ENVIADO CORRECTAMENTE a ${to}: ${subject}`);
      } else {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`🧪 [MODO PRUEBA] Correo enviado a ${to}. Ver enlace: ${previewUrl}`);
      }
    } catch (err) {
      console.error('❌ ERROR AL ENVIAR CORREO:', err.message);
    }
  } else {
    console.log(`⚠️ NO HAY MOTOR DE CORREO para ${to}`);
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

// Configuración de Servidor y URI Dinámica (Toma la de Atlas si existe en process.env)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'reportaya';
const PORT = process.env.PORT || 3001;

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
  origin: true, // Requerido para peticiones directas desde el APK sin origen fijo
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); 

app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(express.static(path.join(__dirname, '../dist')));

let db;
let dbClient;

// --- DB MIDDLEWARE (Ensure connection) ---
app.use((req, res, next) => {
  if (!db && !req.path.startsWith('/api/health')) {
    return res.status(503).json({ error: 'La base de datos no está lista o se está conectando a la nube.' });
  }
  next();
});

// ─── Connect to MongoDB ───────────────────────────────────────────
async function connectDB() {
  // Mayor timeout por si la conexión a Atlas tarda un par de segundos extras al arrancar
  const client = new MongoClient(MONGO_URI, { connectTimeoutMS: 10000 });
  await client.connect();
  dbClient = client;
  db = client.db(DB_NAME);
  
  // Ocultamos las contraseñas de la URI en el log de consola por privacidad
  const safeLogUri = MONGO_URI.includes('@') ? 'mongodb+srv://[ATLAS_CLOUD_CLUSTER]' : MONGO_URI;
  console.log(`✅ Conectado con éxito a MongoDB → ${safeLogUri}/${DB_NAME}`);

  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
  await db.collection('users').createIndex({ id: 1 }, { unique: true, sparse: true });
  await db.collection('reports').createIndex({ createdAt: -1 });
  await db.collection('reports').createIndex({ id: 1 }, { unique: true, sparse: true });
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    if (!db) throw new Error('Objeto DB no inicializado');
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

    delete userData.role;
    delete userData.premium;
    delete userData.passwordHash;
    delete userData.plainPassword;
    delete userData.password;
    delete userData._id;
    delete userData.points; 

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

    if (!email || !password || !name || !surname || !postalCode) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const pwErrors = validatePasswordStrength(password);
    if (pwErrors.length > 0) {
      return res.status(400).json({ error: 'Contraseña débil: ' + pwErrors.join(', ') });
    }

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
      passwordHistory: [],  
    };

    if (bcrypt) {
      userProfile.passwordHash = await bcrypt.hash(password, 8); 
    } else {
      return res.status(503).json({ error: 'El sistema de seguridad no está disponible en este momento.' });
    }

    await db.collection('users').insertOne(userProfile);

    const domain = process.env.DOMAIN || 'http://localhost:3000';
    sendEmail(email, '¡Bienvenido a ReportaYa!', `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <h1 style="color:#1e3a5f;">¡Bienvenido a ReportaYa! 🎉</h1>
        <p>Hola <strong>${name || email.split('@')[0]}</strong>,</p>
        <p>Tu cuenta ha sido creada correctamente. Ya puedes empezar a reportar incidencias en tu ciudad.</p>
        <p><strong>Tus credenciales de acceso son:</strong></p>
        <p>Correo electrónico: <strong>${email}</strong></p>
        <hr style="border:none;border-top:1px solid #eee;">
        <div style="text-align:center;margin-top:20px;">
          <p style="color:#aaa;font-size:11px;">ReportaYa — La plataforma ciudadana</p>
        </div>
      </div>
    `).catch(() => { });

    const { passwordHistory, passwordHash, ...safeUser } = userProfile;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error('Error POST /api/users/register', err);
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

    if (user.passwordHash) {
      if (bcrypt) {
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });
      } else {
        return res.status(501).json({ error: 'Verificación deshabilitada por mantenimiento del servidor.' });
      }
    } else {
      return res.status(401).json({ error: 'Esta cuenta requiere un restablecimiento de contraseña.' });
    }

    const { passwordHash, plainPassword, _id, sessions, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Error POST /api/users/login', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/users/:id/change-password — Change password
app.post('/api/users/:id/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Ambas contraseñas son requeridas' });

    const pwErrors = validatePasswordStrength(newPassword);
    if (pwErrors.length > 0) {
      return res.status(400).json({ error: 'Contraseña débil: ' + pwErrors.join(', ') });
    }

    const user = await db.collection('users').findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (!bcrypt) return res.status(503).json({ error: 'Sistema de hash no disponible.' });

    const match = user.passwordHash ? await bcrypt.compare(oldPassword, user.passwordHash) : false;
    if (!match) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    const history = user.passwordHistory || [];
    for (const oldHash of history) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        return res.status(400).json({ error: 'No puedes usar una contraseña antigua' });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const updatedHistory = [...history, user.passwordHash].slice(-10);

    await db.collection('users').updateOne(
      { id: req.params.id },
      { $set: { passwordHash: newHash, passwordHistory: updatedHistory } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('Error ', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/users/forgot-password
app.post('/api/users/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email es requerido' });

    const user = await db.collection('users').findOne({ email });
    if (!user) return res.json({ ok: true });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); 

    await db.collection('users').updateOne(
      { email },
      { $set: { resetToken, resetExpires } }
    );

    const domain = process.env.DOMAIN || 'http://localhost:3000';
    const resetUrl = `${domain}/?reset=${resetToken}`;

    sendEmail(email, 'Restablecer contraseña — ReportaYa', `
      <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace:</p>
      <a href="${resetUrl}">Restablecer Contraseña</a>
    `).catch(() => { });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/users/reset-password
app.post('/api/users/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    const user = await db.collection('users').findOne({ resetToken: token });
    if (!user || new Date() > new Date(user.resetExpires)) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne(
      { resetToken: token },
      {
        $set: { passwordHash: newHash },
        $unset: { resetToken: '', resetExpires: '' }
      }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// ─── REPORT ENDPOINTS ────────────────────────────────────────────

// GET /api/reports — List all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await db.collection('reports').find({}).sort({ createdAt: -1 }).toArray();
    const mapped = reports.map(r => {
      const { _id, ...rest } = r;
      return { ...rest, id: rest.id || _id.toString() };
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/reports — Create new report
app.post('/api/reports', async (req, res) => {
  try {
    const report = { ...req.body };
    if (!report.title || report.title.length < 3) return res.status(400).json({ error: 'Título demasiado corto' });

    if (!report.id) report.id = Date.now().toString();
    report.createdAt = report.createdAt || new Date().toISOString();

    await db.collection('reports').insertOne(report);
    res.status(201).json({ ok: true, id: report.id });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
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
    res.status(500).json({ error: 'Error' });
  }
});

// DELETE /api/reports/:id — Delete report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    await db.collection('reports').deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// ─── STRIPE CHECKOUT ──────────────────────────────────────────────
app.post('/create-checkout-session', async (req, res) => {
  try {
    let stripe;
    try { stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || ''); } catch (e) {
      return res.status(501).json({ error: 'Stripe no configurado.' });
    }
    res.json({ message: 'Stripe endpoint mock ready' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START SERVER ─────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API activa en puerto ${PORT}`);
      console.log(`🌐 Acceso Web local: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error fatal al conectar a MongoDB:', err);
    process.exit(1);
  });

// Catch-all frontend route
app.get('/*path', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'), (err) => {
      if (err) res.status(404).send('Frontend asset not found.');
    });
  }
});