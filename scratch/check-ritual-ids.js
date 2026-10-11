const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkRitualIds() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    const rituals = await db.collection('dailyrituals').find().toArray();
    const allIds = [];
    rituals.forEach(r => {
        if (r.contentIds) {
            r.contentIds.forEach(id => allIds.push(new ObjectId(id)));
        }
    });

    const docs = await db.collection('Content').find({ _id: { $in: allIds } }).toArray();
    console.log(`Found ${docs.length} docs referenced by rituals:`);
    docs.forEach(d => console.log(`- [${d.type}] "${d.title}" by ${d.author} (${d._id})`));

    await client.close();
}
checkRitualIds().catch(console.error);
