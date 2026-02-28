const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function checkUsers() {
    try {
        await client.connect();
        const db = client.db('reportaya');
        const users = await db.collection('users').find({}).toArray();
        console.log('--- Users in DB ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Points: ${u.points}, Experience: ${u.experience}`);
        });
        console.log('-------------------');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

checkUsers();
