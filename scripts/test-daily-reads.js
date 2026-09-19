const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testQuery() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    const col = db.collection('Content');

    const story = (await col.aggregate([{ $match: { type: 'short_story' } }, { $sample: { size: 1 } }]).toArray())[0];
    const poem = (await col.aggregate([{ $match: { type: 'poem' } }, { $sample: { size: 1 } }]).toArray())[0];
    const idea = (await col.aggregate([{ $match: { type: 'idea' } }, { $sample: { size: 1 } }]).toArray())[0];

    console.log('1. Story:', `"${story.title}" by ${story.author} (~${story.estimatedWords} words)`);
    console.log('2. Poem: ', `"${poem.title}" by ${poem.author} (~${poem.estimatedWords} words)`);
    console.log('3. Idea: ', `"${idea.title}" by ${idea.author} [${idea.subType || 'idea'}] (~${idea.estimatedWords} words)`);

    const total = (story.estimatedWords || 1500) + (poem.estimatedWords || 150) + (idea.estimatedWords || 50);
    console.log(`\nTotal estimated words: ${total} (~${Math.round(total / 120)} - ${Math.round(total / 100)} minutes read time)`);

    await client.close();
}

testQuery();
