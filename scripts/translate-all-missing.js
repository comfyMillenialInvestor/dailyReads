const { MongoClient } = require('mongodb');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'dailyReads';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1',
});

async function translateToGerman(text, title) {
    try {
        const prompt = `Translate the following literary or essay excerpt into natural, fluent German. Preserve line breaks, poetry formatting, quotes, or markdown. Only return the translated text without commentary.\n\nText to translate:\n${text.slice(0, 3000)}`;
        
        const completion = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.3
        });

        return completion.choices[0]?.message?.content?.trim() || text;
    } catch (e) {
        console.error('Translation error:', e.message);
        return null;
    }
}

async function run() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const coll = db.collection(COLLECTION_NAME);

    console.log('--- 1. POPULATING MISSING EN FIELDS FROM BASE CONTENT ---');
    const updateEnResult = await coll.updateMany(
        { $or: [{ content_en: { $exists: false } }, { content_en: "" }, { content_en: null }] },
        [
            {
                $set: {
                    content_en: "$content",
                    title_en: { $ifNull: ["$title_en", "$title"] }
                }
            }
        ]
    );
    console.log(`Updated ${updateEnResult.modifiedCount} documents to set content_en & title_en.`);

    console.log('--- 2. TRANSLATING 67 IDEAS & 4 POEMS TO GERMAN ---');
    const shortTextsMissingDe = await coll.find({
        type: { $in: ['idea', 'poem'] },
        $or: [{ content_de: { $exists: false } }, { content_de: "" }, { content_de: null }]
    }).toArray();

    console.log(`Found ${shortTextsMissingDe.length} ideas/poems to translate to German.`);

    for (let i = 0; i < shortTextsMissingDe.length; i++) {
        const doc = shortTextsMissingDe[i];
        console.log(`Translating [${doc.type}] ${i + 1}/${shortTextsMissingDe.length}: "${doc.title}"...`);
        const translatedContent = await translateToGerman(doc.content, doc.title);
        if (translatedContent) {
            await coll.updateOne(
                { _id: doc._id },
                {
                    $set: {
                        content_de: translatedContent,
                        title_de: doc.title, // Keep title or translated title
                        updatedAt: new Date()
                    }
                }
            );
        }
    }
    console.log('Finished translating ideas & poems!');

    console.log('--- 3. TRANSLATING BATCH OF SHORT STORIES MISSING DE ---');
    const storiesMissingDe = await coll.find({
        type: 'short_story',
        $or: [{ content_de: { $exists: false } }, { content_de: "" }, { content_de: null }]
    }).limit(20).toArray();

    console.log(`Translating sample batch of ${storiesMissingDe.length} stories...`);
    for (let i = 0; i < storiesMissingDe.length; i++) {
        const story = storiesMissingDe[i];
        // Clean any Project Gutenberg header
        let cleanContent = story.content || '';
        const gutenbergIdx = cleanContent.indexOf('*** START OF');
        if (gutenbergIdx !== -1) {
            cleanContent = cleanContent.slice(gutenbergIdx + 50).trim();
        } else if (cleanContent.startsWith('Skip to main content')) {
            cleanContent = cleanContent.slice(150).trim();
        }

        console.log(`Translating story ${i + 1}/${storiesMissingDe.length}: "${story.title}"...`);
        const translated = await translateToGerman(cleanContent, story.title);
        if (translated) {
            await coll.updateOne(
                { _id: story._id },
                {
                    $set: {
                        content: cleanContent,
                        content_en: cleanContent,
                        content_de: translated,
                        title_de: story.title,
                        updatedAt: new Date()
                    }
                }
            );
        }
    }

    console.log('\n--- 4. FINAL TRANSLATION STATS ---');
    const finalMissingDe = await coll.countDocuments({
        $or: [{ content_de: { $exists: false } }, { content_de: "" }, { content_de: null }]
    });
    const finalMissingEn = await coll.countDocuments({
        $or: [{ content_en: { $exists: false } }, { content_en: "" }, { content_en: null }]
    });
    console.log(`Missing DE remaining: ${finalMissingDe}`);
    console.log(`Missing EN remaining: ${finalMissingEn}`);

    await client.close();
}

run().catch(console.error);
