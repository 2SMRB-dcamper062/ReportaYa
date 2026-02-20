const { MongoClient } = require('mongodb');

async function checkUsers() {
    const MONGO_URI = 'mongodb://localhost:27017';
    const DB_NAME = 'reportaya';
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const usersCol = db.collection('users');
        const users = await usersCol.find({}).toArray();
        console.log('Users in database:');
        users.forEach(u => {
            console.log(`- ${u.email} (${u.role}${u.premium ? ', Premium' : ''})`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

checkUsers();
