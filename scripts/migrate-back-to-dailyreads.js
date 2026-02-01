const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

async function fixIndexAndMigrate() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB');

        const targetDb = client.db('dailyReads');
        const targetCollection = targetDb.collection('Content');

        // Drop the problematic unique index on contentId
        try {
            await targetCollection.dropIndex('contentId_1');
            console.log('✓ Dropped contentId_1 unique index');
        } catch (error) {
            console.log('Index may not exist or already dropped');
        }

        // Clear and re-migrate
        const deleteResult = await targetCollection.deleteMany({});
        console.log(`✓ Cleared ${deleteResult.deletedCount} existing documents`);

        const sourceDb = client.db('test');
        const sourceCollection = sourceDb.collection('contents');

        const documents = await sourceCollection.find({}).toArray();
        console.log(`Found ${documents.length} documents in test.contents`);

        // Remove _id from all documents
        const docsToInsert = documents.map(({ _id, ...doc }) => doc);

        const insertResult = await targetCollection.insertMany(docsToInsert);
        console.log(`✓ Inserted ${insertResult.insertedCount} documents`);

        // Verify counts by type
        const finalCount = await targetCollection.countDocuments();
        const storyCount = await targetCollection.countDocuments({ type: 'short_story' });
        const poemCount = await targetCollection.countDocuments({ type: 'poem' });
        const essayCount = await targetCollection.countDocuments({ type: 'essay' });

        console.log(`\n✓ Migration complete!`);
        console.log(`\n✓ Final counts in dailyReads.Content:`);
        console.log(`  - Total: ${finalCount}`);
        console.log(`  - Short stories: ${storyCount}`);
        console.log(`  - Poems: ${poemCount}`);
        console.log(`  - Essays: ${essayCount}`);

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await client.close();
        console.log('\n✓ Connection closed');
    }
}

fixIndexAndMigrate();
