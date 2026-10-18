require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

async function seedCommunity() {
    try {
        await mongoose.connect(MONGO_URI, { dbName: process.env.DB_NAME || 'dailyReads' });
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection(COLLECTION_NAME);

        const count = await collection.countDocuments({
            $or: [{ theme: 'community' }, { isCommunity: true }]
        });

        console.log(`Current community texts: ${count}`);

        if (count === 0) {
            console.log('Seeding initial community creative pieces...');
            const samples = [
                {
                    type: 'short_story',
                    theme: 'community',
                    title: 'Der Uhrmacher von St. Gallen',
                    title_de: 'Der Uhrmacher von St. Gallen',
                    title_en: 'The Clockmaker of St. Gallen',
                    author: 'Clara M. Bern',
                    authorName: 'Clara M. Bern',
                    content: `In einer engen Gasse hinter der Stiftsbibliothek tickte die Zeit anders als im Rest der Stadt. Meister Albin reparierte keine gewöhnlichen Wanduhren; er stellte Pendel her, die sich nach dem Herzschlag derer richteten, die den Raum betraten.\n\n"Jeder Mensch trägt einen eigenen Rhythmus in sich", pflegte er zu sagen, während er mit zitternden Händen winzige Zahnräder aus Messing in das Gehäuse setzte. "Die Welt draußen eilt, weil alle Uhren denselben Takt erzwingen. Doch Heilung beginnt dort, wo eine Uhr verweilt."\n\nEines Regentages trat ein junger Mann ein, dessen Schritte hastig und unruhig klangen. Er legte eine Taschenuhr auf den Holztisch. Das Zifferblatt war zersprungen, die Zeiger blockiert. "Ich habe keine Zeit mehr", flüsterte er erschöpft.\n\nMeister Albin lächelte leise, öffnete das Gehäuse und nahm die Feder heraus. "Sie haben nicht zu wenig Zeit, junger Freund. Sie haben nur vergessen, dass Zeit nicht fließt, um besiegt zu werden, sondern um gelebt zu werden."`,
                    content_de: `In einer engen Gasse hinter der Stiftsbibliothek tickte die Zeit anders als im Rest der Stadt. Meister Albin reparierte keine gewöhnlichen Wanduhren; er stellte Pendel her, die sich nach dem Herzschlag derer richteten, die den Raum betraten.\n\n"Jeder Mensch trägt einen eigenen Rhythmus in sich", pflegte er zu sagen, während er mit zitternden Händen winzige Zahnräder aus Messing in das Gehäuse setzte. "Die Welt draußen eilt, weil alle Uhren denselben Takt erzwingen. Doch Heilung beginnt dort, wo eine Uhr verweilt."\n\nEines Regentages trat ein junger Mann ein, dessen Schritte hastig und unruhig klangen. Er legte eine Taschenuhr auf den Holztisch. Das Zifferblatt war zersprungen, die Zeiger blockiert. "Ich habe keine Zeit mehr", flüsterte er erschöpft.\n\nMeister Albin lächelte leise, öffnete das Gehäuse und nahm die Feder heraus. "Sie haben nicht zu wenig Zeit, junger Freund. Sie haben nur vergessen, dass Zeit nicht fließt, um besiegt zu werden, sondern um gelebt zu werden."`,
                    estimatedWords: 155,
                    readTime: '1 min',
                    isCommunity: true,
                    status: 'published',
                    upvotes: 7,
                    downvotes: 0,
                    score: 7,
                    copyrightAgreed: true,
                    copyrightAgreedAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'poem',
                    theme: 'community',
                    title: 'Im Zwischenraum des Lichts',
                    title_de: 'Im Zwischenraum des Lichts',
                    title_en: 'In the Interval of Light',
                    author: 'Julian Thorne',
                    authorName: 'Julian Thorne',
                    content: `Wo der Tag den Atem anhält,\nehe die Dämmerung beginnt,\nliegt ein Raum, der still zerfällt,\nleise wie ein Sommerwind.\n\nKeine Eile, keine Schwere,\nnur der Herzschlag auf dem Stein.\nIn der weiten Abendleere\ndarfst du unvollendet sein.`,
                    content_de: `Wo der Tag den Atem anhält,\nehe die Dämmerung beginnt,\nliegt ein Raum, der still zerfällt,\nleise wie ein Sommerwind.\n\nKeine Eile, keine Schwere,\nnur der Herzschlag auf dem Stein.\nIn der weiten Abendleere\ndarfst du unvollendet sein.`,
                    estimatedWords: 48,
                    readTime: '1 min',
                    isCommunity: true,
                    status: 'published',
                    upvotes: 12,
                    downvotes: 1,
                    score: 11,
                    copyrightAgreed: true,
                    copyrightAgreedAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'quote',
                    theme: 'community',
                    title: 'Über das Schaffen im Verborgenen',
                    title_de: 'Über das Schaffen im Verborgenen',
                    title_en: 'On Creating in the Shadows',
                    author: 'Mara V.',
                    authorName: 'Mara V.',
                    content: `Ein geschriebenes Wort wartet nicht auf Beifall. Es wartet nur auf den einen Geist, der in seiner Einsamkeit dieselbe Melodie wiedererkennt.`,
                    content_de: `Ein geschriebenes Wort wartet nicht auf Beifall. Es wartet nur auf den einen Geist, der in seiner Einsamkeit dieselbe Melodie wiedererkennt.`,
                    estimatedWords: 24,
                    readTime: '1 min',
                    isCommunity: true,
                    status: 'published',
                    upvotes: 18,
                    downvotes: 0,
                    score: 18,
                    copyrightAgreed: true,
                    copyrightAgreedAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ];

            await collection.insertMany(samples);
            console.log('Seeded 3 community sample texts successfully.');
        } else {
            console.log('Community texts already present. Skipping seed.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Seed error:', err);
    }
}

seedCommunity();
