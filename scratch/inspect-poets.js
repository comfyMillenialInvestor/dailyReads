const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function inspectPoets() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    const coll = db.collection(process.env.COLLECTION_NAME || 'Content');

    const sources = await coll.aggregate([
        { $match: { type: 'poem' } },
        { $group: { _id: "$source", count: { $sum: 1 } } }
    ]).toArray();
    console.log('Poem Sources:', sources);

    // List all distinct authors of poems
    const authors = await coll.distinct('author', { type: 'poem' });
    console.log(`Total distinct poem authors: ${authors.length}`);
    console.log('Sample authors:', authors.slice(0, 30));

    await client.close();
}

inspectPoets().catch(console.error);
