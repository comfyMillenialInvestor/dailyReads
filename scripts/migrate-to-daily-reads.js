const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function migrateData() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI not found');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const sourceDb = client.db('test');
        const targetDb = client.db('dailyReads');

        const collectionsToMigrate = ['users', 'completions'];

        for (const collName of collectionsToMigrate) {
            console.log(`\nMigrating collection: ${collName}`);

            const sourceColl = sourceDb.collection(collName);
            const targetColl = targetDb.collection(collName);

            const count = await sourceColl.countDocuments();
            if (count === 0) {
                console.log(`- Source collection ${collName} is empty. Skipping.`);
                continue;
            }

            const docs = await sourceColl.find({}).toArray();
            console.log(`- Found ${docs.length} documents in test.${collName}`);

            // Clear target collection first to avoid duplicates
            await targetColl.deleteMany({});
            console.log(`- Cleared target dailyReads.${collName}`);

            const result = await targetColl.insertMany(docs);
            console.log(`- Migrated ${result.insertedCount} documents to dailyReads.${collName}`);
        }

        console.log('\nMigration complete!');

    } catch (err) {
        console.error('Migration Error:', err);
    } finally {
        await client.close();
    }
}

migrateData();
