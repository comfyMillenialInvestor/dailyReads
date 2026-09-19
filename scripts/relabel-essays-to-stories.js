const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'dailyReads';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

async function relabelEssaysToStories() {
    if (!MONGO_URI) {
        console.error('Missing MONGO_URI in .env.local');
        process.exit(1);
    }

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log(`✓ Connected to MongoDB`);

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const essayCount = await collection.countDocuments({ type: 'essay' });
        console.log(`Found ${essayCount} documents with type: 'essay' in ${DB_NAME}.${COLLECTION_NAME}`);

        if (essayCount === 0) {
            console.log('No essays to relabel.');
            return;
        }

        // Relabel type: 'essay' to type: 'short_story', preserving originalType: 'essay'
        const result = await collection.updateMany(
            { type: 'essay' },
            { 
                $set: { 
                    type: 'short_story',
                    originalType: 'essay'
                } 
            }
        );

        console.log(`✓ Successfully updated ${result.modifiedCount} documents from type 'essay' to 'short_story'`);

        // Verify current counts
        const storyCount = await collection.countDocuments({ type: 'short_story' });
        const poemCount = await collection.countDocuments({ type: 'poem' });
        const remainingEssays = await collection.countDocuments({ type: 'essay' });
        const quoteCount = await collection.countDocuments({ type: 'quote' });

        console.log('\n--- Updated Collection Counts ---');
        console.log(`Short Stories: ${storyCount}`);
        console.log(`Poems:         ${poemCount}`);
        console.log(`Essays:        ${remainingEssays}`);
        console.log(`Quotes:        ${quoteCount}`);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.close();
        console.log('✓ MongoDB connection closed');
    }
}

relabelEssaysToStories();
