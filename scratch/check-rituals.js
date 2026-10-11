const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkRituals() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    
    const rituals = await db.collection('dailyrituals').find().toArray();
    console.log(`Daily rituals count: ${rituals.length}`);
    for (const r of rituals) {
        console.log(`Day ${r.dayNumber}: items count: ${r.items?.length}, textIds:`, r.items?.map(i => ({ title: i.title, type: i.type, author: i.author })));
    }

    await client.close();
}
checkRituals().catch(console.error);
