#!/usr/bin/env node
/**
 * seed_users.cjs
 * Seed test users directly into MongoDB.
 * No Firebase dependency needed.
 *
 * Usage:
 *   node server/seed_users.cjs
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'reportaya';

const users = [
  {
    id: 'antonio.diaz',
    name: 'Antonio Díaz',
    surname: 'Díaz',
    postalCode: '41001',
    email: 'antonio.diaz@reportaya.es',
    password: 'reportaya_2025',
    role: 'citizen',
    points: 200,
    experience: 0,
    inventory: ['frame_default', 'tag_developer'],
    equippedFrame: 'frame_default',
    equippedBackground: 'bg_default',
    profileTag: 'tag_developer',
    premium: false,
  },
  {
    id: 'david.camacho',
    name: 'David Camacho',
    surname: 'Camacho',
    postalCode: '41010',
    email: 'david.camacho@reportaya.es',
    password: 'reportaya_2025',
    role: 'citizen',
    points: 300,
    experience: 0,
    inventory: ['frame_default', 'tag_developer'],
    equippedFrame: 'frame_default',
    equippedBackground: 'bg_default',
    profileTag: 'tag_developer',
    premium: true,
  },
  {
    id: 'antonio.nieto',
    name: 'Antonio Nieto',
    surname: 'Nieto',
    postalCode: '41003',
    email: 'antonio.nieto@reportaya.es',
    password: 'reportaya_2025',
    role: 'citizen',
    points: 200,
    experience: 0,
    inventory: ['frame_default', 'tag_developer'],
    equippedFrame: 'frame_default',
    equippedBackground: 'bg_default',
    profileTag: 'tag_developer',
    premium: false,
  },
  {
    id: 'admin-ayuntamiento',
    name: 'Ayuntamiento ReportaYa',
    surname: 'Admin',
    postalCode: '41001',
    email: 'ayuntamiento@reportaya.es',
    password: 'ayuntamiento',
    role: 'admin',
    points: 1000,
    experience: 0,
    inventory: [],
    equippedFrame: null,
    equippedBackground: null,
    profileTag: 'tag_admin',
    premium: true,
  }
];

async function seed() {
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

    // Create unique index on email
    await usersCol.createIndex({ email: 1 }, { unique: true, sparse: true });

    for (const u of users) {
      try {
        // Hash password
        const passwordHash = await bcrypt.hash(u.password, 10);

        // Normalize role: treat legacy 'developer' or users with developer tag as 'citizen'
        const normalizedRole = (u.role === 'developer' || (u.inventory || []).includes('tag_developer') || u.profileTag === 'tag_developer') ? 'citizen' : u.role;

        const profile = {
          id: u.id,
          name: u.name,
          surname: u.surname || '',
          postalCode: u.postalCode || '',
          role: normalizedRole,
          email: u.email,
          points: u.points,
          avatar: '',
          inventory: u.inventory || [],
          experience: u.experience || 0,
          equippedFrame: u.equippedFrame || null,
          equippedBackground: u.equippedBackground || null,
          profileTag: u.profileTag || null,
          premium: !!u.premium,
          passwordHash,
        };

        await usersCol.updateOne(
          { email: u.email },
          { $set: profile },
          { upsert: true }
        );

        console.log(`✅ Seeded user: ${u.email} (${u.role})`);
      } catch (err) {
        console.error(`❌ Error seeding user ${u.email}:`, err);
      }
    }

    // Also seed the mock reports
    const reportsCol = db.collection('reports');
    const mockReports = [
      {
        id: '1',
        title: 'Farola fundida en Plaza de España',
        description: 'La farola principal cerca de la fuente central no funciona desde hace dos noches. Es una zona muy oscura.',
        category: 'Alumbrado',
        status: 'Pendiente',
        location: { lat: 37.3772, lng: -5.9869 },
        createdAt: '2023-10-25',
        votes: 5,
        author: 'Juan Pérez',
        imageUrl: 'https://picsum.photos/400/300',
      },
      {
        id: '2',
        title: 'Bache peligroso en Calle Betis',
        description: 'Hay un agujero grande en la calzada que puede dañar las motos.',
        category: 'Infraestructura (Baches/Aceras)',
        status: 'En Proceso',
        location: { lat: 37.3841, lng: -6.0028 },
        createdAt: '2023-10-24',
        votes: 12,
        author: 'Ana García',
        imageUrl: 'https://picsum.photos/401/300',
      },
      {
        id: '3',
        title: 'Contenedores desbordados Triana',
        description: 'Basura acumulada fuera de los contenedores en la calle San Jacinto.',
        category: 'Limpieza/Basura',
        status: 'Resuelto',
        location: { lat: 37.3835, lng: -6.0070 },
        createdAt: '2023-10-20',
        votes: 3,
        author: 'Carlos Ruiz',
        adminResponse: 'Servicio de limpieza enviado el 21/10. Gracias por el aviso.',
        imageUrl: 'https://picsum.photos/402/300',
      },
      {
        id: '4',
        title: 'Ruido excesivo bar local',
        description: 'Música alta hasta las 4 AM en zona residencial Alameda.',
        category: 'Ruido',
        status: 'Pendiente',
        location: { lat: 37.3999, lng: -5.9960 },
        createdAt: '2023-10-26',
        votes: 8,
        author: 'Maria S.',
        imageUrl: 'https://picsum.photos/403/300',
      },
    ];

    for (const report of mockReports) {
      await reportsCol.updateOne(
        { id: report.id },
        { $set: report },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${mockReports.length} mock reports.`);

    console.log('\n🎉 Seeding completado.');
  } catch (err) {
    console.error('❌ Error general:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();
