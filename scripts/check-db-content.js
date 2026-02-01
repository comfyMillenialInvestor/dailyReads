// Quick script to check database content
// Run with: node scripts/check-db-content.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

async function checkDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const collection = db.collection(COLLECTION_NAME);


        // Get total count
        const total = await collection.countDocuments();
        console.log(`Total documents: ${total}\n`);

        // Count by type
        const types = ['short_story', 'poem', 'essay'];
        console.log('=== COUNT BY TYPE ===');
        for (const type of types) {
            const count = await collection.countDocuments({ type });
            console.log(`${type}: ${count}`);
        }

        // Sample documents from each type
        console.log('\n=== SAMPLE DOCUMENTS ===');
        for (const type of types) {
            console.log(`\n--- ${type.toUpperCase()} ---`);
            const samples = await collection.find({ type }).limit(5).toArray();
            samples.forEach((doc, idx) => {
                console.log(`${idx + 1}. "${doc.title}" by ${doc.author}`);
            });
        }

        // Check for any documents with incorrect type values
        console.log('\n=== CHECKING FOR INVALID TYPES ===');
        const allDocs = await collection.find({}).toArray();
        const invalidTypes = allDocs.filter(doc => !types.includes(doc.type));
        if (invalidTypes.length > 0) {
            console.log(`Found ${invalidTypes.length} documents with invalid types:`);
            invalidTypes.forEach(doc => {
                console.log(`- "${doc.title}": type="${doc.type}"`);
            });
        } else {
            console.log('All documents have valid types ✓');
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDatabase();
