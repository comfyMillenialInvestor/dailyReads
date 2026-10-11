const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function sample() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    const coll = db.collection(process.env.COLLECTION_NAME || 'Content');

    const sample = await coll.findOne({ type: 'poem' });
    console.log('Sample poem document:\n', JSON.stringify(sample, null, 2));

    const sampleClassic = await coll.findOne({
        type: 'poem',
        author: { $in: ['Emily Dickinson', 'Walt Whitman', 'William Shakespeare', 'Robert Frost', 'Edgar Allan Poe', 'William Wordsworth'] }
    });
    console.log('\nSample classic poem document:\n', JSON.stringify(sampleClassic, null, 2));

    await client.close();
}
sample().catch(console.error);
