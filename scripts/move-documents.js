// Script to move documents from test.Content to dailyReads.Content
// Run with: node scripts/move-documents.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function moveDocuments() {
    try {
        // Connect without specifying database
        const baseUri = MONGODB_URI.replace('/dailyReads', '');
        await mongoose.connect(baseUri);
        console.log('Connected to MongoDB\n');

        const connection = mongoose.connection;

        // Access both databases
        const testDb = connection.useDb('test');
        const dailyReadsDb = connection.useDb('dailyReads');

        const sourceCollection = testDb.collection('contents');
        const targetCollection = dailyReadsDb.collection('contents');

        // Check source
        const sourceCount = await sourceCollection.countDocuments();
        console.log(`Documents in test.contents: ${sourceCount}`);

        // Check target
        const targetCount = await targetCollection.countDocuments();
        console.log(`Documents in dailyReads.contents: ${targetCount}\n`);

        if (sourceCount === 0) {
            console.log('No documents to move from test database.');
            await mongoose.disconnect();
            return;
        }

        // Get all documents from source
        console.log('Fetching documents from test.contents...');
        const documents = await sourceCollection.find({}).toArray();
        console.log(`Found ${documents.length} documents\n`);

        // Insert into target
        console.log('Inserting documents into dailyReads.contents...');
        if (documents.length > 0) {
            // Remove _id to let MongoDB generate new ones (avoid duplicates)
            const docsWithoutId = documents.map(doc => {
                const { _id, ...rest } = doc;
                return rest;
            });

            const result = await targetCollection.insertMany(docsWithoutId, { ordered: false });
            console.log(`✓ Inserted ${result.insertedCount} documents\n`);
        }

        // Verify
        const newTargetCount = await targetCollection.countDocuments();
        console.log(`Documents now in dailyReads.contents: ${newTargetCount}`);

        // Show sample
        console.log('\n=== SAMPLE FROM dailyReads.contents ===');
        const types = ['short_story', 'poem', 'essay'];
        for (const type of types) {
            const count = await targetCollection.countDocuments({ type });
            console.log(`${type}: ${count}`);
        }

        console.log('\n✓ Migration complete!');
        console.log('\nNOTE: Original documents still exist in test.contents');
        console.log('If you want to delete them, you can run:');
        console.log('  db.getSiblingDB("test").contents.drop()');

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

moveDocuments();
