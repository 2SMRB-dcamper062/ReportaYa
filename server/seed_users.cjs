const admin = require('firebase-admin');
const path = require('path');

// Load service account from project root
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccount.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const users = [
  {
    uid: 'antonio.diaz',
    name: 'Antonio Díaz',
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
    uid: 'david.camacho',
    name: 'David Camacho',
    email: 'david.camacho@reportaya.es',
    password: 'reportaya_2025',
    role: 'admin',
    points: 300,
    experience: 0,
    inventory: ['frame_default', 'tag_admin'],
    equippedFrame: 'frame_default',
    equippedBackground: 'bg_default',
    profileTag: 'tag_admin',
    premium: true,
  }
];

async function seed() {
  for (const u of users) {
    try {
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(u.email);
        console.log(`Auth user exists: ${u.email} (uid=${userRecord.uid})`);
      } catch (e) {
        // create user
        userRecord = await admin.auth().createUser({
          uid: u.uid,
          email: u.email,
          emailVerified: true,
          password: u.password,
          displayName: u.name,
        });
        console.log(`Created auth user: ${u.email} (uid=${userRecord.uid})`);
      }

      // set custom claims for admin
      if (u.role === 'admin') {
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
        console.log(`Set admin claims for ${u.email}`);
      }

      // Firestore profile
      const profile = {
        id: userRecord.uid,
        name: u.name,
        role: u.role === 'admin' ? 'admin' : 'citizen',
        email: u.email,
        points: u.points,
        avatar: '',
        inventory: u.inventory || [],
        experience: u.experience || 0,
        equippedFrame: u.equippedFrame || null,
        equippedBackground: u.equippedBackground || null,
        profileTag: u.profileTag || null,
        premium: !!u.premium,
      };

      await db.collection('users').doc(userRecord.uid).set(profile, { merge: true });
      console.log(`Seeded Firestore profile for ${u.email}`);
    } catch (err) {
      console.error(`Error seeding user ${u.email}:`, err);
    }
  }

  console.log('Seeding completed.');
  process.exit(0);
}

seed();
