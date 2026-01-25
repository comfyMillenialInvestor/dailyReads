
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Content, { IContent } from '../lib/models/Content';

// Load env vars
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define MONGODB_URI in .env.local');
    process.exit(1);
}

const SAMPLE_CONTENT: Partial<IContent>[] = [
    {
        type: 'short_story',
        theme: 'philosophy',
        title: 'The Cave',
        author: 'Plato (Adapted)',
        source: 'The Republic',
        content: `In a cave, people have lived all their lives chained to a wall, facing a blank wall. They watch shadows projected on the wall from objects passing in front of a fire behind them. The shadows are the prisoners' reality.
    
One prisoner is freed and dragged out of the cave. He sees the fire, and then the world outside. He sees the real objects, and finally the sun itself. He realizes that his former view of reality was wrong.
    
He returns to the cave to tell the others, but they do not believe him. They threaten to kill him if he tries to set them free.`,
        estimatedWords: 150,
        readTime: '1 min',
        scheduledDate: new Date(),
        pauseNumber: 1,
    },
    {
        type: 'poem',
        theme: 'literature',
        title: 'The Road Not Taken',
        author: 'Robert Frost',
        source: 'Mountain Interval',
        content: `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`,
        readTime: '2 min',
        scheduledDate: new Date(),
        pauseNumber: 1,
    },
    {
        type: 'essay',
        theme: 'personal growth',
        title: 'Self-Reliance (Excerpt)',
        author: 'Ralph Waldo Emerson',
        source: 'Essays: First Series',
        content: `Trust thyself: every heart vibrates to that iron string. Accept the place the divine providence has found for you, the society of your contemporaries, the connection of events. Great men have always done so, and confided themselves childlike to the genius of their age, betraying their perception that the absolutely trustworthy was seated at their heart, working through their hands, predominating in all their being.
    
Whoso would be a man must be a nonconformist. He who would gather immortal palms must not be hindered by the name of goodness, but must explore if it be goodness. Nothing is at last sacred but the integrity of your own mind. Absolve you to yourself, and you shall have the suffrage of the world.`,
        estimatedWords: 200,
        readTime: '2 min',
        scheduledDate: new Date(),
        pauseNumber: 1,
    },
    {
        type: 'short_story',
        theme: 'mystery',
        title: 'The tell-tale Heart (Excerpt)',
        author: 'Edgar Allan Poe',
        source: 'Public Domain',
        content: `TRUE! --nervous --very, very dreadfully nervous I had been and am; but why will you say that I am mad? The disease had sharpened my senses --not destroyed --not dulled them. Above all was the sense of hearing acute. I heard all things in the heaven and in the earth. I heard many things in hell. How, then, am I mad? Hearken! and observe how healthily --how calmly I can tell you the whole story.`,
        estimatedWords: 100,
        readTime: '1 min',
        scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
        pauseNumber: 2,
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to MongoDB');

        // clear existing? Maybe just add if empty
        const count = await Content.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} items. Skipping seed.`);
            // Optional: clear
            // await Content.deleteMany({});
            // console.log('Cleared Content collection');
        } else {
            await Content.insertMany(SAMPLE_CONTENT);
            console.log('Seeded database with sample content');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
