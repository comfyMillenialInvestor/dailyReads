const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

async function deleteGarbageEssays() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB');

        const dbs = ['dailyReads', 'test'];
        const collections = {
            'dailyReads': 'Content',
            'test': 'contents'
        };

        for (const dbName of dbs) {
            const db = client.db(dbName);
            const collectionName = collections[dbName];
            const collection = db.collection(collectionName);

            console.log(`\nCleaning ${dbName}.${collectionName}...`);

            // Delete all essays since the user said they are garbage
            const result = await collection.deleteMany({ type: 'essay' });
            console.log(`✓ Deleted ${result.deletedCount} essays from ${dbName}.${collectionName}`);
        }

        console.log('\n✓ Cleanup complete!');

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await client.close();
        console.log('✓ Connection closed');
    }
}

deleteGarbageEssays();
