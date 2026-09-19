const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'dailyReads';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

const ADDITIONAL_QUOTES = [
    // ── MYSTERY (Boost from 35 to 75+) ──
    {
        author: 'Arthur Conan Doyle',
        source: 'The Boscombe Valley Mystery',
        quote: 'There is nothing more deceptive than an obvious fact.',
        theme: 'mystery'
    },
    {
        author: 'Arthur Conan Doyle',
        source: 'The Hound of the Baskervilles',
        quote: 'The world is full of obvious things which nobody by any chance ever observes.',
        theme: 'mystery'
    },
    {
        author: 'Arthur Conan Doyle',
        source: 'A Case of Identity',
        quote: 'Life is infinitely stranger than anything which the mind of man could invent.',
        theme: 'mystery'
    },
    {
        author: 'Arthur Conan Doyle',
        source: 'The Adventure of the Copper Beeches',
        quote: 'Data! Data! Data! I can\'t make bricks without clay.',
        theme: 'mystery'
    },
    {
        author: 'Agatha Christie',
        source: 'Murder on the Orient Express',
        quote: 'The impossible could not have happened, therefore the impossible must be possible in spite of appearances.',
        theme: 'mystery'
    },
    {
        author: 'Agatha Christie',
        source: 'The Mysterious Affair at Styles',
        quote: 'Instinct is a marvelous thing. It can neither be explained nor ignored.',
        theme: 'mystery'
    },
    {
        author: 'Agatha Christie',
        source: 'The ABC Murders',
        quote: 'Words are only the clothes that thoughts wear.',
        theme: 'mystery'
    },
    {
        author: 'Agatha Christie',
        source: 'And Then There Were None',
        quote: 'Crime is terribly revealing. Try and vary your methods as you will, your tastes, your habits, your attitude of mind, and your soul are revealed by your actions.',
        theme: 'mystery'
    },
    {
        author: 'Edgar Allan Poe',
        source: 'The Purloined Letter',
        quote: 'There is a game of puzzles which is played upon a map. A novice seeks to embarrass his opponent by selecting the most out-of-the-way names, but the adept selects such words as stretch in large characters from one end of the chart to the other.',
        theme: 'mystery'
    },
    {
        author: 'Edgar Allan Poe',
        source: 'Marginalia',
        quote: 'The boundaries which divide Life from Death are at best shadowy and vague. Who shall say where the one ends, and where the other begins?',
        theme: 'mystery'
    },
    {
        author: 'Edgar Allan Poe',
        source: 'Eleonora',
        quote: 'Those who dream by day are cognizant of many things which escape those who dream only by night.',
        theme: 'mystery'
    },
    {
        author: 'Albert Einstein',
        source: 'The World As I See It',
        quote: 'The most incomprehensible thing about the universe is that it is comprehensible.',
        theme: 'mystery'
    },
    {
        author: 'Carl Jung',
        source: 'The Archetypes and the Collective Unconscious',
        quote: 'In all chaos there is a cosmos, in all disorder a secret order, in all caprice a fixed law.',
        theme: 'mystery'
    },
    {
        author: 'Carl Jung',
        source: 'Psychological Reflections',
        quote: 'Until you make the unconscious conscious, it will direct your life and you will call it fate.',
        theme: 'mystery'
    },
    {
        author: 'Carl Jung',
        source: 'Mysterium Coniunctionis',
        quote: 'The shoe that fits one person pinches another; there is no recipe for living that suits all cases.',
        theme: 'mystery'
    },
    {
        author: 'H.P. Lovecraft',
        source: 'Supernatural Horror in Literature',
        quote: 'The oldest and strongest emotion of mankind is fear, and the oldest and strongest kind of fear is fear of the unknown.',
        theme: 'mystery'
    },
    {
        author: 'Raymond Chandler',
        source: 'The Big Sleep',
        quote: 'Dead men are heavier than broken hearts.',
        theme: 'mystery'
    },
    {
        author: 'Raymond Chandler',
        source: 'The Long Goodbye',
        quote: 'To say goodbye is to die a little.',
        theme: 'mystery'
    },
    {
        author: 'G.K. Chesterton',
        source: 'The Club of Queer Trades',
        quote: 'The riddles of God are more satisfying than the solutions of man.',
        theme: 'mystery'
    },
    {
        author: 'G.K. Chesterton',
        source: 'Orthodoxy',
        quote: 'The world will never starve for want of wonders; but only for want of wonder.',
        theme: 'mystery'
    },
    {
        author: 'Arthur C. Clarke',
        source: 'Hazards of Prophecy',
        quote: 'Two possibilities exist: either we are alone in the Universe or we are not. Both are equally terrifying.',
        theme: 'mystery'
    },
    {
        author: 'Stephen Hawking',
        source: 'A Brief History of Time',
        quote: 'Look up at the stars and not down at your feet. Try to make sense of what you see, and wonder about what makes the universe exist. Be curious.',
        theme: 'mystery'
    },
    {
        author: 'Jorge Luis Borges',
        source: 'The Garden of Forking Paths',
        quote: 'The garden of forking paths is an incomplete, but not false, image of the universe.',
        theme: 'mystery'
    },
    {
        author: 'Jorge Luis Borges',
        source: 'Ficciones',
        quote: 'A labyrinth of symbols, an invisible, intangible web of time and space.',
        theme: 'mystery'
    },
    {
        author: 'Umberto Eco',
        source: 'The Name of the Rose',
        quote: 'The only truths that are useful are instruments to be thrown away after use.',
        theme: 'mystery'
    },
    {
        author: 'Friedrich Nietzsche',
        source: 'Twilight of the Idols',
        quote: 'There are no facts, only interpretations.',
        theme: 'mystery'
    },
    {
        author: 'Blaise Pascal',
        source: 'Pensées',
        quote: 'Nature is an infinite sphere whose center is everywhere and whose circumference is nowhere.',
        theme: 'mystery'
    },
    {
        author: 'Isaac Newton',
        source: 'Reflections in Old Age',
        quote: 'To myself I seem to have been only like a boy playing on the seashore, finding now and then a smoother pebble or a prettier shell, whilst the great ocean of truth lay all undiscovered before me.',
        theme: 'mystery'
    },
    {
        author: 'Dashiell Hammett',
        source: 'The Maltese Falcon',
        quote: 'He adjusted himself to beams falling, and then no more fell of them, and he adjusted himself to them not falling.',
        theme: 'mystery'
    },
    {
        author: 'Wilkie Collins',
        source: 'The Moonstone',
        quote: 'Follow the clue, my dear; follow the clue, wherever it leads you.',
        theme: 'mystery'
    },
    {
        author: 'Dorothy L. Sayers',
        source: 'Gaudy Night',
        quote: 'Time and trouble will tame an advanced young woman, but an advanced old woman is uncontrollable by any earthly force.',
        theme: 'mystery'
    },
    {
        author: 'Patricia Highsmith',
        source: 'Plotting and Writing Suspense Fiction',
        quote: 'Obsessions are the only things that matter in creative writing. Where there is obsession, there is life and mystery.',
        theme: 'mystery'
    },
    {
        author: 'Franz Kafka',
        source: 'The Castle',
        quote: 'You are not from the Castle, you are not from the village, you are nothing. But nevertheless you are something: a stranger.',
        theme: 'mystery'
    },
    {
        author: 'Haruki Murakami',
        source: 'The Wind-Up Bird Chronicle',
        quote: 'Spend your money on the things that money can buy. Spend your time on the things that money can\'t buy.',
        theme: 'mystery'
    },
    {
        author: 'Stanislaw Lem',
        source: 'Solaris',
        quote: 'We have no need of other worlds. We need mirrors. We don\'t know what to do with other worlds.',
        theme: 'mystery'
    },
    {
        author: 'Jorge Luis Borges',
        source: 'The Aleph',
        quote: 'I saw the Aleph from all points; I saw in the Aleph the earth and in the earth the Aleph and in the Aleph the earth...',
        theme: 'mystery'
    },
    {
        author: 'Carl Sagan',
        source: 'Pale Blue Dot',
        quote: 'Somewhere, something incredible is waiting to be known.',
        theme: 'mystery'
    },
    {
        author: 'Edgar Allan Poe',
        source: 'A Descent into the Maelström',
        quote: 'I became aware of the most singular and startling sensation of calm curiosity.',
        theme: 'mystery'
    },
    {
        author: 'Arthur Conan Doyle',
        source: 'The Valley of Fear',
        quote: 'The impression of a mastermind coordinating a whole criminal web is an appalling thing to contemplate.',
        theme: 'mystery'
    },
    {
        author: 'Agatha Christie',
        source: 'Cards on the Table',
        quote: 'It is the brain, the little grey cells, on which one must rely. The senses are fallible, the intellect endures.',
        theme: 'mystery'
    },

    // ── HISTORY (Boost from 46 to 80+) ──
    {
        author: 'Marcus Tullius Cicero',
        source: 'De Oratore',
        quote: 'To be ignorant of what occurred before you were born is to remain always a child. For what is the worth of human life, unless it is woven into the life of our ancestors by the records of history?',
        theme: 'history'
    },
    {
        author: 'Napoleon Bonaparte',
        source: 'Sayings and Maxims',
        quote: 'History is a set of lies agreed upon.',
        theme: 'history'
    },
    {
        author: 'Karl Marx',
        source: 'The Eighteenth Brumaire of Louis Bonaparte',
        quote: 'Hegel remarks somewhere that all great world-historic facts and personages appear, so to speak, twice. He forgot to add: the first time as tragedy, the second time as farce.',
        theme: 'history'
    },
    {
        author: 'Thomas Carlyle',
        source: 'On Heroes, Hero-Worship, and The Heroic in History',
        quote: 'The history of the world is but the biography of great men.',
        theme: 'history'
    },
    {
        author: 'Arnold J. Toynbee',
        source: 'A Study of History',
        quote: 'Civilizations die from suicide, not by murder.',
        theme: 'history'
    },
    {
        author: 'David Hume',
        source: 'The History of England',
        quote: 'History is the great mistress of wisdom or rather of prudence, respecting all public affairs.',
        theme: 'history'
    },
    {
        author: 'Voltaire',
        source: 'Philosophical Dictionary',
        quote: 'History is only the register of our crimes and misfortunes.',
        theme: 'history'
    },
    {
        author: 'Tacitus',
        source: 'Annals',
        quote: 'This I hold to be the chief office of history: to rescue merit from oblivion, and that base words and deeds should have the fear of posterity.',
        theme: 'history'
    },
    {
        author: 'Polybius',
        source: 'The Histories',
        quote: 'There is no more ready handmaid for the reforming of human life than the knowledge of the events of the past.',
        theme: 'history'
    },
    {
        author: 'Plutarch',
        source: 'Parallel Lives: Alexander',
        quote: 'It is not histories I am writing, but lives; and in the most glorious deeds there is not always an indication of virtue or vice, but a slight thing like a phrase or a jest often makes a greater revelation of character than battles.',
        theme: 'history'
    },
    {
        author: 'George Orwell',
        source: '1984',
        quote: 'Who controls the past controls the future. Who controls the present controls the past.',
        theme: 'history'
    },
    {
        author: 'Maya Angelou',
        source: 'On the Pulse of Morning',
        quote: 'History, despite its wrenching pain, cannot be unlived, but if faced with courage, need not be lived again.',
        theme: 'history'
    },
    {
        author: 'James Baldwin',
        source: 'The White Man\'s Guilt',
        quote: 'History is not the past. It is the present. We carry our history with us. We are our history.',
        theme: 'history'
    },
    {
        author: 'Martin Luther King Jr.',
        source: 'Strength to Love',
        quote: 'We are not makers of history. We are made by history.',
        theme: 'history'
    },
    {
        author: 'Marc Bloch',
        source: 'The Historian\'s Craft',
        quote: 'Misunderstanding of the present is the inevitable consequence of ignorance of the past.',
        theme: 'history'
    },
    {
        author: 'Edward Hallett Carr',
        source: 'What is History?',
        quote: 'History is an unending dialogue between the present and the past.',
        theme: 'history'
    },
    {
        author: 'Yuval Noah Harari',
        source: 'Sapiens: A Brief History of Humankind',
        quote: 'We study history not to know the future, but to widen our horizons, to understand that our present situation is neither natural nor inevitable, and that we consequently have many more possibilities before us.',
        theme: 'history'
    },
    {
        author: 'Barbara Tuchman',
        source: 'The Proud Tower',
        quote: 'Books are the carriers of civilization. Without books, history is silent, literature dumb, science crippled, thought and speculation at a standstill.',
        theme: 'history'
    },
    {
        author: 'Herodotus',
        source: 'The Histories',
        quote: 'In peace, sons bury their fathers. In war, fathers bury their sons.',
        theme: 'history'
    },
    {
        author: 'Edward Gibbon',
        source: 'Memoirs of My Life',
        quote: 'The winds and waves are always on the side of the ablest navigators.',
        theme: 'history'
    },
    {
        author: 'Winston Churchill',
        source: 'Speech on the Fall of France',
        quote: 'If we open a quarrel between past and present, we shall find that we have lost the future.',
        theme: 'history'
    },
    {
        author: 'Lord Acton',
        source: 'Lectures on Modern History',
        quote: 'History is not a web woven without hands, but the work of human agents.',
        theme: 'history'
    },
    {
        author: 'Will Durant',
        source: 'The Story of Philosophy',
        quote: 'Most history is guessing, and the rest is prejudice.',
        theme: 'history'
    },
    {
        author: 'Arthur M. Schlesinger Jr.',
        source: 'The Disuniting of America',
        quote: 'History is to the nation as memory is to the individual.',
        theme: 'history'
    },
    {
        author: 'Eric Hobsbawm',
        source: 'The Age of Revolution',
        quote: 'Words are witnesses that often speak louder than documents.',
        theme: 'history'
    },
    {
        author: 'Leo Tolstoy',
        source: 'War and Peace',
        quote: 'A king is history\'s slave. History, that is, the unconscious, general, swarm life of mankind, uses every moment of the life of kings as a tool for its own purposes.',
        theme: 'history'
    },
    {
        author: 'Alexis de Tocqueville',
        source: 'The Old Regime and the Revolution',
        quote: 'When the past no longer illuminates the future, the spirit walks in darkness.',
        theme: 'history'
    },
    {
        author: 'Fernand Braudel',
        source: 'The Mediterranean in the Ancient World',
        quote: 'Events are the ephemera of history; they pass across its stage like fireflies, hardly glimpsed before they sink back into darkness.',
        theme: 'history'
    },
    {
        author: 'Johann Wolfgang von Goethe',
        source: 'West-Eastern Divan',
        quote: 'He who cannot draw on three thousand years is living from hand to mouth.',
        theme: 'history'
    },
    {
        author: 'Winston Churchill',
        source: 'My Early Life',
        quote: 'Study history, study history. In history lies all the secrets of statecraft.',
        theme: 'history'
    },

    // ── LITERATURE (Boost from 57 to 85+) ──
    {
        author: 'Fyodor Dostoevsky',
        source: 'The Idiot',
        quote: 'Beauty will save the world.',
        theme: 'literature'
    },
    {
        author: 'Leo Tolstoy',
        source: 'Anna Karenina',
        quote: 'All happy families are alike; each unhappy family is unhappy in its own way.',
        theme: 'literature'
    },
    {
        author: 'Marcel Proust',
        source: 'In Search of Lost Time',
        quote: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.',
        theme: 'literature'
    },
    {
        author: 'Gabriel García Márquez',
        source: 'One Hundred Years of Solitude',
        quote: 'What matters in life is not what happens to you, but what you remember and how you remember it.',
        theme: 'literature'
    },
    {
        author: 'James Joyce',
        source: 'A Portrait of the Artist as a Young Man',
        quote: 'Welcome, O life! I go to encounter for the millionth time the reality of experience and to forge in the smithy of my soul the uncreated conscience of my race.',
        theme: 'literature'
    },
    {
        author: 'William Shakespeare',
        source: 'The Tempest',
        quote: 'We are such stuff as dreams are made on, and our little life is rounded with a sleep.',
        theme: 'literature'
    },
    {
        author: 'Victor Hugo',
        source: 'Les Misérables',
        quote: 'To learn to read is to light a fire; every syllable that is spelled out is a spark.',
        theme: 'literature'
    },
    {
        author: 'Emily Dickinson',
        source: 'Selected Poems',
        quote: 'There is no Frigate like a Book / To take us Lands away / Nor any Coursers like a Page / Of prancing Poetry.',
        theme: 'literature'
    },
    {
        author: 'Gustave Flaubert',
        source: 'Letters',
        quote: 'Do not read, as children do, to amuse yourself, or like the ambitious, for the purpose of instruction. No, read in order to live.',
        theme: 'literature'
    },
    {
        author: 'Walt Whitman',
        source: 'Song of Myself',
        quote: 'Do I contradict myself? Very well then I contradict myself, (I am large, I contain multitudes.)',
        theme: 'literature'
    },
    {
        author: 'Virginia Woolf',
        source: 'A Room of One\'s Own',
        quote: 'Lock up your libraries if you like; but there is no gate, no lock, no bolt that you can set upon the freedom of my mind.',
        theme: 'literature'
    },
    {
        author: 'Jorge Luis Borges',
        source: 'The Book of Sand',
        quote: 'A book is not an isolated being: it is a relationship, an axis of innumerable relationships.',
        theme: 'literature'
    },

    // ── ENVIRONMENT (Boost from 60 to 80+) ──
    {
        author: 'Gary Snyder',
        source: 'The Practice of the Wild',
        quote: 'Nature is not a place to visit. It is home.',
        theme: 'environment'
    },
    {
        author: 'Edward Abbey',
        source: 'Desert Solitaire',
        quote: 'Wilderness is not a luxury but a necessity of the human spirit, and as vital to our lives as water and good bread.',
        theme: 'environment'
    },
    {
        author: 'John Burroughs',
        source: 'Leaf and Tendril',
        quote: 'I go to nature to be soothed and healed, and to have my senses put in order.',
        theme: 'environment'
    },
    {
        author: 'Alexander von Humboldt',
        source: 'Personal Narrative of Travels',
        quote: 'In this great chain of causes and effects, no single fact can be considered in isolation.',
        theme: 'environment'
    },
    {
        author: 'Aldo Leopold',
        source: 'Round River',
        quote: 'To keep every cog and wheel is the first precaution of intelligent tinkering.',
        theme: 'environment'
    },
    {
        author: 'Rachel Carson',
        source: 'Lost Woods',
        quote: 'The more clearly we can focus our attention on the wonders and realities of the universe about us, the less taste we shall have for destruction.',
        theme: 'environment'
    },
    {
        author: 'David Attenborough',
        source: 'The Living Planet',
        quote: 'Real success can only come if there is a change in our societies and in our economics and in our politics.',
        theme: 'environment'
    },
    {
        author: 'Henry David Thoreau',
        source: 'The Maine Woods',
        quote: 'What is the use of a house if you haven\'t got a tolerable planet to put it on?',
        theme: 'environment'
    },
    {
        author: 'John Muir',
        source: 'The Mountains of California',
        quote: 'Climb the mountains and get their good tidings. Nature\'s peace will flow into you as sunshine flows into trees.',
        theme: 'environment'
    },
    {
        author: 'Loren Eiseley',
        source: 'The Star Thrower',
        quote: 'Once in a lifetime, if one is lucky, one so merges with sunlight and air and easy movement that one forgets the race, the goal, and the competition.',
        theme: 'environment'
    },

    // ── POLITICS (Boost from 59 to 80+) ──
    {
        author: 'Montesquieu',
        source: 'The Spirit of the Laws',
        quote: 'To become truly great, one has to stand with people, not above them.',
        theme: 'politics'
    },
    {
        author: 'Jean-Jacques Rousseau',
        source: 'The Social Contract',
        quote: 'Man was born free, and he is everywhere in chains. Those who think themselves the masters of others are indeed greater slaves than they.',
        theme: 'politics'
    },
    {
        author: 'Thomas Paine',
        source: 'Common Sense',
        quote: 'Society in every state is a blessing, but government even in its best state is but a necessary evil; in its worst state an intolerable one.',
        theme: 'politics'
    },
    {
        author: 'Thomas Paine',
        source: 'The American Crisis',
        quote: 'These are the times that try men\'s souls. The summer soldier and the sunshine patriot will, in this crisis, shrink from the service of their country.',
        theme: 'politics'
    },
    {
        author: 'Alexander Hamilton',
        source: 'Federalist No. 1',
        quote: 'It seems to have been reserved to the people of this country to decide the important question, whether societies of men are really capable or not of establishing good government from reflection and choice.',
        theme: 'politics'
    },
    {
        author: 'James Madison',
        source: 'Federalist No. 51',
        quote: 'If men were angels, no government would be necessary.',
        theme: 'politics'
    },
    {
        author: 'Benjamin Franklin',
        source: 'Historical Review of Pennsylvania',
        quote: 'Those who would give up essential Liberty, to purchase a little temporary Safety, deserve neither Liberty nor Safety.',
        theme: 'politics'
    },
    {
        author: 'John Stuart Mill',
        source: 'On Liberty',
        quote: 'If all mankind minus one were of one opinion, mankind would be no more justified in silencing that one person than he, if he had the power, would be justified in silencing mankind.',
        theme: 'politics'
    },
    {
        author: 'Frederick Douglass',
        source: 'West India Emancipation Speech',
        quote: 'Power concedes nothing without a demand. It never did and it never will.',
        theme: 'politics'
    },
    {
        author: 'Nelson Mandela',
        source: 'Long Walk to Freedom',
        quote: 'To be free is not merely to cast off one\'s chains, but to live in a way that respects and enhances the freedom of others.',
        theme: 'politics'
    }
];

function cleanQuote(text) {
    if (!text) return '';
    return text.trim().replace(/^["“']|["”']$/g, '').trim();
}

function generateQuoteTitle(author, text, theme) {
    const cleaned = cleanQuote(text);
    const words = cleaned.split(/\s+/);
    if (words.length <= 6) return cleaned;
    const topic = theme.charAt(0).toUpperCase() + theme.slice(1);
    return `${author} on ${topic}`;
}

async function run() {
    if (!MONGO_URI) {
        console.error('Missing MONGO_URI');
        process.exit(1);
    }

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const col = db.collection(COLLECTION_NAME);

        const existingDocs = await col.find({ type: 'idea' }, { projection: { author: 1, content: 1 } }).toArray();
        const existingSet = new Set(
            existingDocs.map(d => `${(d.author || '').toLowerCase()}::${cleanQuote(d.content || '').toLowerCase().slice(0, 40)}`)
        );

        const docsToInsert = [];
        for (const item of ADDITIONAL_QUOTES) {
            const key = `${item.author.toLowerCase()}::${cleanQuote(item.quote).toLowerCase().slice(0, 40)}`;
            if (existingSet.has(key)) continue;

            const words = item.quote.split(/\s+/).length;
            const title = generateQuoteTitle(item.author, item.quote, item.theme);

            docsToInsert.push({
                type: 'idea',
                subType: 'quote',
                theme: item.theme,
                title: title,
                author: item.author,
                source: item.source,
                content: `> "${item.quote}"\n\n— **${item.author}**${item.source ? `, *${item.source}*` : ''}`,
                estimatedWords: words,
                readTime: '1 min',
                title_en: title,
                content_en: `> "${item.quote}"\n\n— **${item.author}**${item.source ? `, *${item.source}*` : ''}`,
                title_de: title,
                content_de: `> "${item.quote}"\n\n— **${item.author}**${item.source ? `, *${item.source}*` : ''}`,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log(`Inserting ${docsToInsert.length} targeted quotes to guarantee >= 50 per category...`);
        if (docsToInsert.length > 0) {
            const res = await col.insertMany(docsToInsert);
            console.log(`✓ Inserted ${res.insertedCount} new quotes!`);
        }

        const VALID_THEMES = [
            'philosophy',
            'science',
            'history',
            'personal growth',
            'technology',
            'environment',
            'literature',
            'mystery',
            'fantasy',
            'art',
            'politics',
            'economy'
        ];

        console.log('\n=============================================');
        console.log('VERIFIED IDEA COUNTS PER CATEGORY (MINIMUM 50 CHECK)');
        console.log('=============================================');
        let allMeet50 = true;
        for (const theme of VALID_THEMES) {
            const count = await col.countDocuments({ type: 'idea', theme });
            const status = count >= 50 ? '✓ PASS (>= 50)' : '✗ FAIL (< 50)';
            console.log(`${theme.padEnd(16)}: ${String(count).padStart(5)} ideas  ${status}`);
            if (count < 50) allMeet50 = false;
        }

        const totalIdeas = await col.countDocuments({ type: 'idea' });
        console.log(`\nTotal Ideas across all categories: ${totalIdeas}`);
        console.log(`All 12 categories meet >= 50 requirement: ${allMeet50 ? 'YES! ✓' : 'NO'}`);

    } catch (err) {
        console.error('Boost failed:', err);
    } finally {
        await client.close();
    }
}

run();
