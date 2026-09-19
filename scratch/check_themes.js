const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkThemes() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    const col = db.collection('Content');

    const VALID_THEMES = [
        'philosophy',
        'science',
        'history',
        'personal growth',
        'technology',
        'environment',
        'literature',
        'mystery',
        'fantasy',
        'art',
        'politics',
        'economy'
    ];

    console.log('=== IDEA COUNTS BY THEME ===');
    for (const theme of VALID_THEMES) {
        const count = await col.countDocuments({ type: 'idea', theme });
        console.log(`${theme.padEnd(16)}: ${count}`);
    }

    const otherThemes = await col.aggregate([
        { $match: { type: 'idea', theme: { $nin: VALID_THEMES } } },
        { $group: { _id: '$theme', count: { $sum: 1 } } }
    ]).toArray();
    if (otherThemes.length > 0) {
        console.log('\nOther themes:', otherThemes);
    }

    await client.close();
}

checkThemes();
