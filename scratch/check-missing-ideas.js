const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkMissingIdeas() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    const coll = db.collection(process.env.COLLECTION_NAME || 'Content');

    const missingIdeas = await coll.find({
        type: 'idea',
        $or: [{ content_de: { $exists: false } }, { content_de: "" }, { content_de: null }]
    }).toArray();

    console.log(`Missing ideas count: ${missingIdeas.length}`);
    missingIdeas.forEach((i, idx) => {
        console.log(`${idx + 1}. [${i.theme}] "${i.title}" by ${i.author} (words: ${i.content ? i.content.split(/\s+/).length : 0})`);
    });

    await client.close();
}
checkMissingIdeas().catch(console.error);
