const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkTranslations() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'dailyReads');
    const coll = db.collection(process.env.COLLECTION_NAME || 'Content');

    const total = await coll.countDocuments();
    const missingDe = await coll.countDocuments({
        $or: [{ content_de: { $exists: false } }, { content_de: "" }, { content_de: null }]
    });
    const missingEn = await coll.countDocuments({
        $or: [{ content_en: { $exists: false } }, { content_en: "" }, { content_en: null }]
    });

    console.log(`Current Total Content: ${total}`);
    console.log(`Missing DE: ${missingDe}`);
    console.log(`Missing EN: ${missingEn}`);

    const byType = await coll.aggregate([
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
    console.log('\nBreakdown by type:\n', byType);

    await client.close();
}
checkTranslations().catch(console.error);
