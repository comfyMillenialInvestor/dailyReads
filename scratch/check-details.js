require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function inspect() {
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME || 'dailyReads' });
    const db = mongoose.connection.db;
    const coll = db.collection(process.env.COLLECTION_NAME || 'Content');

    console.log('=== TYPE DISTRIBUTION ===');
    const typeCounts = await coll.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } }
    ]).toArray();
    console.log(typeCounts);

    console.log('\n=== POEMS STATS ===');
    const poemCount = await coll.countDocuments({ type: 'poem' });
    console.log('Total poems:', poemCount);
    const samplePoems = await coll.find({ type: 'poem' }).limit(5).project({ title: 1, author: 1, source: 1 }).toArray();
    console.log('Sample poems:', samplePoems);

    const poemAuthors = await coll.aggregate([
        { $match: { type: 'poem' } },
        { $group: { _id: "$author", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]).toArray();
    console.log('Top poem authors:', poemAuthors);

    console.log('\n=== TRANSLATION STATS ===');
    const total = await coll.countDocuments();
    const hasDe = await coll.countDocuments({ content_de: { $exists: true, $ne: "" } });
    const hasEn = await coll.countDocuments({ content_en: { $exists: true, $ne: "" } });
    const hasBoth = await coll.countDocuments({
        content_de: { $exists: true, $ne: "" },
        content_en: { $exists: true, $ne: "" }
    });
    const missingDe = await coll.countDocuments({
        $or: [{ content_de: { $exists: false } }, { content_de: "" }, { content_de: null }]
    });
    const missingEn = await coll.countDocuments({
        $or: [{ content_en: { $exists: false } }, { content_en: "" }, { content_en: null }]
    });
    console.log(`Total: ${total}`);
    console.log(`Has DE content: ${hasDe}`);
    console.log(`Has EN content: ${hasEn}`);
    console.log(`Has Both: ${hasBoth}`);
    console.log(`Missing DE: ${missingDe}`);
    console.log(`Missing EN: ${missingEn}`);

    // Break down missing translations by type
    console.log('\n=== MISSING TRANSLATIONS BY TYPE ===');
    const missingByType = await coll.aggregate([
        {
            $group: {
                _id: "$type",
                total: { $sum: 1 },
                missingDe: {
                    $sum: {
                        $cond: [
                            { $or: [{ $eq: ["$content_de", null] }, { $eq: ["$content_de", ""] }, { $not: ["$content_de"] }] },
                            1,
                            0
                        ]
                    }
                },
                missingEn: {
                    $sum: {
                        $cond: [
                            { $or: [{ $eq: ["$content_en", null] }, { $eq: ["$content_en", ""] }, { $not: ["$content_en"] }] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]).toArray();
    console.log(missingByType);

    await mongoose.disconnect();
}

inspect().catch(console.error);
