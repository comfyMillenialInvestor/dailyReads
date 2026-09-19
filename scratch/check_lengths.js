const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('dailyReads');
    const col = db.collection('Content');

    const count = await col.countDocuments({ originalType: 'essay', estimatedWords: { $lt: 400 } });
    console.log('Short essays count (<400 words):', count);
    const samples = await col.find({ originalType: 'essay', estimatedWords: { $lt: 400 } }).limit(5).toArray();
    console.log('Samples:', samples.map(s => ({ title: s.title, words: s.estimatedWords, author: s.author })));

    await client.close();
}

check();
