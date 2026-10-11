const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkRitualsSchema() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    
    const one = await db.collection('dailyrituals').findOne();
    console.log('Sample daily ritual:\n', JSON.stringify(one, null, 2));

    await client.close();
}
checkRitualsSchema().catch(console.error);
