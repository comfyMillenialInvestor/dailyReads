const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'dailyReads';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

async function relabelIdeas() {
    if (!MONGO_URI) {
        console.error('Missing MONGO_URI');
        process.exit(1);
    }

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const col = db.collection(COLLECTION_NAME);

        // 1. Update all type: 'quote' to type: 'idea' with subType: 'quote'
        const quoteUpdate = await col.updateMany(
            { type: 'quote' },
            { $set: { type: 'idea', subType: 'quote' } }
        );
        console.log(`✓ Updated ${quoteUpdate.modifiedCount} quotes to type: 'idea' (subType: 'quote')`);

        // 2. Find short essays (< 350 words) that were originally essays and classify them as ideas (subType: 'micro_essay')
        // These represent short conceptual thoughts, letters, and reflections in line with Bradbury's essay pillar!
        const shortEssayUpdate = await col.updateMany(
            { originalType: 'essay', estimatedWords: { $lt: 350 }, type: 'short_story' },
            { $set: { type: 'idea', subType: 'micro_essay' } }
        );
        console.log(`✓ Updated ${shortEssayUpdate.modifiedCount} short essays (<350 words) to type: 'idea' (subType: 'micro_essay')`);

        // 3. Print counts of the 3 canonical Bradbury Trio types
        const types = ['short_story', 'poem', 'idea'];
        console.log('\n=== CANONICAL DAILY READS TRIO ===');
        for (const type of types) {
            const count = await col.countDocuments({ type });
            console.log(`${type.toUpperCase()}: ${count} documents`);
        }

        const subTypes = await col.aggregate([
            { $match: { type: 'idea' } },
            { $group: { _id: '$subType', count: { $sum: 1 } } }
        ]).toArray();
        console.log('\nIdea subtypes:');
        subTypes.forEach(s => console.log(`  - ${s._id || 'general'}: ${s.count}`));

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.close();
    }
}

relabelIdeas();
