const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function inspectCollections() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI not found');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const admin = client.db().admin();
        const dbs = await admin.listDatabases();

        for (const dbInfo of dbs.databases) {
            console.log(`\nDatabase: ${dbInfo.name}`);
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            for (const coll of collections) {
                const count = await db.collection(coll.name).countDocuments();
                console.log(`  - ${coll.name}: ${count} docs`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

inspectCollections();
