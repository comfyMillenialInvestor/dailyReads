const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

async function cleanup() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB');

        const db = client.db('dailyReads');

        // Remove the redundant 'contents' collection (the one with 4 docs)
        const collections = await db.listCollections({ name: 'contents' }).toArray();
        if (collections.length > 0) {
            await db.collection('contents').drop();
            console.log('✓ Dropped redundant "contents" collection from dailyReads');
        } else {
            console.log('No "contents" collection found in dailyReads');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

cleanup();
