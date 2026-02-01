const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

async function debugMongo() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB');

        const admin = client.db().admin();
        const dbs = await admin.listDatabases();

        console.log('\n=== DATABASES ===');
        for (const dbInfo of dbs.databases) {
            console.log(`- ${dbInfo.name} (${dbInfo.sizeOnDisk} bytes)`);
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`  └─ ${col.name}: ${count} docs`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

debugMongo();
