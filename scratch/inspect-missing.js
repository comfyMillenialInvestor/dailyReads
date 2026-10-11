const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function inspectMissing() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    const coll = db.collection(process.env.COLLECTION_NAME || 'Content');

    console.log('--- SAMPLE SHORT STORIES MISSING DE ---');
    const missingStories = await coll.find({
        type: 'short_story',
        $or: [{ content_de: { $exists: false } }, { content_de: "" }, { content_de: null }]
    }).limit(5).toArray();

    missingStories.forEach(s => {
        console.log(`Title: "${s.title}", Author: "${s.author}", Words: ${s.estimatedWords || (s.content ? s.content.split(/\s+/).length : 0)}, hasContent_en: ${Boolean(s.content_en)}, hasContent: ${Boolean(s.content)}`);
        console.log(`Content excerpt: ${s.content ? s.content.slice(0, 120) : 'NO CONTENT'}...\n`);
    });

    console.log('--- SAMPLE IDEAS MISSING DE ---');
    const missingIdeas = await coll.find({
        type: 'idea',
        $or: [{ content_de: { $exists: false } }, { content_de: "" }, { content_de: null }]
    }).limit(5).toArray();
    missingIdeas.forEach(i => {
        console.log(`Title: "${i.title}", Author: "${i.author}", Content: ${i.content}`);
    });

    await client.close();
}
inspectMissing().catch(console.error);
