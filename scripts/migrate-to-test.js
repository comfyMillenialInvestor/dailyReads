const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

async function migrateToTest() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB');

        const sourceDb = client.db('dailyReads');
        const targetDb = client.db('test');

        const sourceCollection = sourceDb.collection('Content');
        const targetCollection = targetDb.collection('contents');

        // Get all documents from source
        const documents = await sourceCollection.find({}).toArray();
        console.log(`Found ${documents.length} documents in dailyReads.Content`);

        if (documents.length === 0) {
            console.log('No documents to migrate');
            return;
        }

        // Upsert each document to target
        let upsertedCount = 0;
        for (const doc of documents) {
            // Remove _id to avoid immutability error
            const { _id, ...docWithoutId } = doc;

            const result = await targetCollection.updateOne(
                { title: doc.title, author: doc.author }, // Match criteria
                { $set: docWithoutId }, // Update with document (without _id)
                { upsert: true } // Create if doesn't exist
            );

            if (result.upsertedCount > 0) {
                console.log(`✓ Inserted: "${doc.title}"`);
                upsertedCount++;
            } else if (result.modifiedCount > 0) {
                console.log(`✓ Updated: "${doc.title}"`);
            } else {
                console.log(`- Unchanged: "${doc.title}"`);
            }
        }

        console.log(`\n✓ Migration complete!`);
        console.log(`  - Total documents: ${documents.length}`);
        console.log(`  - New inserts: ${upsertedCount}`);
        console.log(`  - Updates/unchanged: ${documents.length - upsertedCount}`);

        // Verify counts
        const targetCount = await targetCollection.countDocuments();
        console.log(`\n✓ Final count in test.contents: ${targetCount}`);

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await client.close();
        console.log('\n✓ Connection closed');
    }
}

migrateToTest();
