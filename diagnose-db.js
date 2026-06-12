const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000
});

async function run() {
    try {
        console.log('🔌 Connecting to MongoDB at', uri, '...');
        await client.connect();
        console.log('✅ Connected.');

        const db = client.db('reportaya');
        const collection = db.collection('test_diagnostics');

        console.log('📝 Attempting insertion test...');
        const result = await collection.insertOne({
            test: true,
            timestamp: new Date()
        });
        console.log('✅ Insert successful. ID:', result.insertedId);

        console.log('🧹 Cleaning up...');
        await collection.deleteOne({ _id: result.insertedId });
        console.log('✅ Cleanup successful.');

    } catch (err) {
        console.error('❌ DB ERROR:', err.message);
    } finally {
        await client.close();
        console.log('👋 Connection closed.');
    }
}

run();
