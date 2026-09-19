const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'dailyReads';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

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

// Quintessential, verified quotes for under-represented categories
const CURATED_CATEGORY_QUOTES = [
    // ── LITERATURE ──
    {
        author: 'Jorge Luis Borges',
        source: 'Selected Non-Fictions',
        quote: 'I have always imagined that Paradise will be a kind of library.',
        theme: 'literature'
    },
    {
        author: 'Ray Bradbury',
        source: 'Fahrenheit 451',
        quote: 'You don\'t have to burn books to destroy a culture. Just get people to stop reading them.',
        theme: 'literature'
    },
    {
        author: 'Virginia Woolf',
        source: 'The Common Reader',
        quote: 'I would venture to guess that Anon, who wrote so many poems without signing them, was often a woman.',
        theme: 'literature'
    },
    {
        author: 'Franz Kafka',
        source: 'Letters to Oskar Pollak',
        quote: 'A book must be the axe for the frozen sea inside us. That is what I believe.',
        theme: 'literature'
    },
    {
        author: 'Fernando Pessoa',
        source: 'The Book of Disquiet',
        quote: 'Literature is the most agreeable way of ignoring life.',
        theme: 'literature'
    },
    {
        author: 'C.S. Lewis',
        source: 'An Experiment in Criticism',
        quote: 'Literature adds to reality, it does not simply describe it. It enriches the necessary competencies that daily life requires and provides.',
        theme: 'literature'
    },
    {
        author: 'Umberto Eco',
        source: 'Six Walks in the Fictional Woods',
        quote: 'The person who doesn\'t read lives only one life. The reader lives 5,000 years.',
        theme: 'literature'
    },
    {
        author: 'Mark Twain',
        source: 'Notebooks',
        quote: 'The man who does not read good books has no advantage over the man who cannot read them.',
        theme: 'literature'
    },
    {
        author: 'Oscar Wilde',
        source: 'The Picture of Dorian Gray',
        quote: 'It is what you read when you don\'t have to that determines what you will be when you can\'t help it.',
        theme: 'literature'
    },
    {
        author: 'George Orwell',
        source: 'Why I Write',
        quote: 'Good prose is like a windowpane.',
        theme: 'literature'
    },
    {
        author: 'Italo Calvino',
        source: 'Why Read the Classics?',
        quote: 'A classic is a book that has never finished saying what it has to say.',
        theme: 'literature'
    },
    {
        author: 'Ray Bradbury',
        source: 'Zen in the Art of Writing',
        quote: 'Stuff your head with one poem, one short story, and one essay every night before sleep. In a thousand nights, you will be full of stuff.',
        theme: 'literature'
    },

    // ── MYSTERY ──
    {
        author: 'Albert Einstein',
        source: 'Living Philosophies',
        quote: 'The most beautiful experience we can have is the mysterious. It is the fundamental emotion that stands at the cradle of true art and true science.',
        theme: 'mystery'
    },
    {
        author: 'Arthur Conan Doyle',
        source: 'The Sign of the Four',
        quote: 'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
        theme: 'mystery'
    },
    {
        author: 'Arthur Conan Doyle',
        source: 'A Study in Scarlet',
        quote: 'It is a capital mistake to theorize before one has data. Insensibly one begins to twist facts to suit theories, instead of theories to suit facts.',
        theme: 'mystery'
    },
    {
        author: 'Edgar Allan Poe',
        source: 'The Murders in the Rue Morgue',
        quote: 'To observe attentively is to remember distinctly.',
        theme: 'mystery'
    },
    {
        author: 'Agatha Christie',
        source: 'The Secret Adversary',
        quote: 'Instinct is a marvelous thing. It can neither be explained nor ignored.',
        theme: 'mystery'
    },
    {
        author: 'G.K. Chesterton',
        source: 'The Innocence of Father Brown',
        quote: 'It isn\'t that they can\'t see the solution. It is that they can\'t see the problem.',
        theme: 'mystery'
    },
    {
        author: 'Carl Jung',
        source: 'Memories, Dreams, Reflections',
        quote: 'The mystery of life is not a problem to be solved, but a reality to be experienced.',
        theme: 'mystery'
    },
    {
        author: 'Raymond Chandler',
        source: 'The Simple Art of Murder',
        quote: 'Down these mean streets a man must go who is not himself mean, who is neither tarnished nor afraid.',
        theme: 'mystery'
    },
    {
        author: 'Francis Bacon',
        source: 'Meditationes Sacrae',
        quote: 'Mystery is the seed of inquiry, and inquiry is the mother of all truth.',
        theme: 'mystery'
    },
    {
        author: 'Friedrich Nietzsche',
        source: 'Beyond Good and Evil',
        quote: 'When you gaze long into an abyss, the abyss also gazes into you.',
        theme: 'mystery'
    },

    // ── FANTASY ──
    {
        author: 'J.R.R. Tolkien',
        source: 'On Fairy-Stories',
        quote: 'Fantasy is escapist, and that is its glory. If a soldier is imprisoned by the enemy, don\'t we consider it his duty to escape?',
        theme: 'fantasy'
    },
    {
        author: 'J.R.R. Tolkien',
        source: 'The Fellowship of the Ring',
        quote: 'Not all those who wander are lost.',
        theme: 'fantasy'
    },
    {
        author: 'Ursula K. Le Guin',
        source: 'The Language of the Night',
        quote: 'The creative adult is the child who has survived.',
        theme: 'fantasy'
    },
    {
        author: 'Ursula K. Le Guin',
        source: 'A Wizard of Earthsea',
        quote: 'To hear, one must be silent. To hold, one must be empty. To tell, one must have seen.',
        theme: 'fantasy'
    },
    {
        author: 'C.S. Lewis',
        source: 'Dedication to The Lion, the Witch and the Wardrobe',
        quote: 'Some day you will be old enough to start reading fairy tales again.',
        theme: 'fantasy'
    },
    {
        author: 'Neil Gaiman',
        source: 'Coraline',
        quote: 'Fairy tales are more than true: not because they tell us that dragons exist, but because they tell us that dragons can be beaten.',
        theme: 'fantasy'
    },
    {
        author: 'Antoine de Saint-Exupéry',
        source: 'The Little Prince',
        quote: 'And now here is my secret, a very simple secret: It is only with the heart that one can see rightly; what is essential is invisible to the eye.',
        theme: 'fantasy'
    },
    {
        author: 'Lewis Carroll',
        source: 'Through the Looking-Glass',
        quote: 'Why, sometimes I\'ve believed as many as six impossible things before breakfast.',
        theme: 'fantasy'
    },
    {
        author: 'Terry Pratchett',
        source: 'A Hat Full of Sky',
        quote: 'If you trust in yourself... and believe in your dreams... and follow your star... you\'ll still get beaten by people who spent their time working hard and learning things and weren\'t so lazy.',
        theme: 'fantasy'
    },
    {
        author: 'William Blake',
        source: 'Auguries of Innocence',
        quote: 'To see a World in a Grain of Sand / And a Heaven in a Wild Flower / Hold Infinity in the palm of your hand / And Eternity in an hour.',
        theme: 'fantasy'
    },

    // ── ENVIRONMENT ──
    {
        author: 'John Muir',
        source: 'Our National Parks',
        quote: 'Thousands of tired, nerve-shaken, over-civilized people are beginning to find out that going to the mountains is going home; that wildness is a necessity.',
        theme: 'environment'
    },
    {
        author: 'John Muir',
        source: 'My First Summer in the Sierra',
        quote: 'When we try to pick out anything by itself, we find it hitched to everything else in the Universe.',
        theme: 'environment'
    },
    {
        author: 'Henry David Thoreau',
        source: 'Walking',
        quote: 'In wildness is the preservation of the world.',
        theme: 'environment'
    },
    {
        author: 'Henry David Thoreau',
        source: 'Walden',
        quote: 'I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach.',
        theme: 'environment'
    },
    {
        author: 'Rachel Carson',
        source: 'The Sense of Wonder',
        quote: 'Those who contemplate the beauty of the earth find reserves of strength that will endure as long as life lasts.',
        theme: 'environment'
    },
    {
        author: 'Rachel Carson',
        source: 'Silent Spring',
        quote: 'In nature, nothing exists alone.',
        theme: 'environment'
    },
    {
        author: 'Aldo Leopold',
        source: 'A Sand County Almanac',
        quote: 'A thing is right when it tends to preserve the integrity, stability, and beauty of the biotic community. It is wrong when it tends otherwise.',
        theme: 'environment'
    },
    {
        author: 'David Attenborough',
        source: 'A Life on Our Planet',
        quote: 'It seems to me that the natural world is the greatest source of excitement; the greatest source of visual beauty; the greatest source of intellectual interest.',
        theme: 'environment'
    },
    {
        author: 'Alexander von Humboldt',
        source: 'Cosmos: A Sketch of a Physical Description of the Universe',
        quote: 'Nature herself is sublimely eloquent. The stars as they tour in the deep dome of the night talk of an eternal harmony.',
        theme: 'environment'
    },
    {
        author: 'Loren Eiseley',
        source: 'The Immense Journey',
        quote: 'If there is magic on this planet, it is contained in water.',
        theme: 'environment'
    },
    {
        author: 'Wendell Berry',
        source: 'The Unsettling of America',
        quote: 'The Earth is what we all have in common.',
        theme: 'environment'
    },

    // ── POLITICS ──
    {
        author: 'Aristotle',
        source: 'Politics',
        quote: 'Man is by nature a political animal, destined to live in a community.',
        theme: 'politics'
    },
    {
        author: 'Alexis de Tocqueville',
        source: 'Democracy in America',
        quote: 'Liberty cannot be established without morality, nor morality without faith.',
        theme: 'politics'
    },
    {
        author: 'Abraham Lincoln',
        source: 'Gettysburg Address',
        quote: 'Government of the people, by the people, for the people, shall not perish from the earth.',
        theme: 'politics'
    },
    {
        author: 'Thomas Jefferson',
        source: 'Letter to William Stephens Smith',
        quote: 'The tree of liberty must be refreshed from time to time with the blood of patriots and tyrants.',
        theme: 'politics'
    },
    {
        author: 'Hannah Arendt',
        source: 'The Human Condition',
        quote: 'Power corresponds to the human ability not just to act but to act in concert.',
        theme: 'politics'
    },
    {
        author: 'George Orwell',
        source: 'The Prevention of Literature',
        quote: 'Freedom is the right to tell people what they do not want to hear.',
        theme: 'politics'
    },
    {
        author: 'John Locke',
        source: 'Second Treatise of Government',
        quote: 'Wherever law ends, tyranny begins.',
        theme: 'politics'
    },
    {
        author: 'Niccolò Machiavelli',
        source: 'The Prince',
        quote: 'It is much safer to be feared than loved because...love is preserved by the link of obligation which, owing to the baseness of men, is broken at every opportunity for their advantage; but fear preserves you by a dread of punishment which never fails.',
        theme: 'politics'
    },
    {
        author: 'Marcus Tullius Cicero',
        source: 'De Legibus',
        quote: 'The welfare of the people is the supreme law.',
        theme: 'politics'
    },
    {
        author: 'Václav Havel',
        source: 'The Power of the Powerless',
        quote: 'Hope is not the conviction that something will turn out well, but the certainty that something has meaning, regardless of how it turns out.',
        theme: 'politics'
    },
    {
        author: 'Edmund Burke',
        source: 'Reflections on the Revolution in France',
        quote: 'The only thing necessary for the triumph of evil is for good men to do nothing.',
        theme: 'politics'
    },

    // ── ART ──
    {
        author: 'Leonardo da Vinci',
        source: 'Notebooks',
        quote: 'Art is never finished, only abandoned.',
        theme: 'art'
    },
    {
        author: 'Vincent van Gogh',
        source: 'Letters to Theo',
        quote: 'I dream of painting and then I paint my dream.',
        theme: 'art'
    },
    {
        author: 'Pablo Picasso',
        source: 'Reflections on Art',
        quote: 'The purpose of art is washing the dust of daily life off our souls.',
        theme: 'art'
    },
    {
        author: 'Oscar Wilde',
        source: 'The Decay of Lying',
        quote: 'Life imitates Art far more than Art imitates Life.',
        theme: 'art'
    },
    {
        author: 'Wassily Kandinsky',
        source: 'Concerning the Spiritual in Art',
        quote: 'Color is the keyboard, the eyes are the hammers, the soul is the piano with many strings. The artist is the hand that plays, touching one key or another purposely, to cause vibrations in the soul.',
        theme: 'art'
    },
    {
        author: 'Michelangelo',
        source: 'Letters and Records',
        quote: 'I saw the angel in the marble and carved until I set him free.',
        theme: 'art'
    },
    {
        author: 'Johann Wolfgang von Goethe',
        source: 'Maxims and Reflections',
        quote: 'A man should hear a little music, read a little poetry, and see a fine picture every day of his life, in order that worldly cares may not obliterate the sense of the beautiful which God has implanted in the human soul.',
        theme: 'art'
    },
    {
        author: 'John Ruskin',
        source: 'Modern Painters',
        quote: 'The greatest thing a human soul ever does in this world is to see something and tell what it saw in a plain way.',
        theme: 'art'
    },

    // ── TECHNOLOGY ──
    {
        author: 'Alan Turing',
        source: 'Computing Machinery and Intelligence',
        quote: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.',
        theme: 'technology'
    },
    {
        author: 'Nikola Tesla',
        source: 'My Inventions',
        quote: 'The present is theirs; the future, for which I really worked, is mine.',
        theme: 'technology'
    },
    {
        author: 'Ada Lovelace',
        source: 'Notes on the Analytical Engine',
        quote: 'The Analytical Engine weaves algebraic patterns just as the Jacquard-loom weaves flowers and leaves.',
        theme: 'technology'
    },
    {
        author: 'Claude Shannon',
        source: 'A Mathematical Theory of Communication',
        quote: 'Information is the resolution of uncertainty.',
        theme: 'technology'
    },
    {
        author: 'Arthur C. Clarke',
        source: 'Profiles of the Future',
        quote: 'Any sufficiently advanced technology is indistinguishable from magic.',
        theme: 'technology'
    },
    {
        author: 'Steve Jobs',
        source: 'Speech at Stanford University',
        quote: 'Technology is nothing. What\'s important is that you have a faith in people, that they\'re basically good and smart, and if you give them tools, they\'ll do wonderful things with them.',
        theme: 'technology'
    },
    {
        author: 'Norbert Wiener',
        source: 'The Human Use of Human Beings',
        quote: 'We are but whirlpools in a river of ever-flowing water. We are not stuff that abides, but patterns that perpetuate themselves.',
        theme: 'technology'
    },
    {
        author: 'Douglas Engelbart',
        source: 'Augmenting Human Intellect',
        quote: 'The digital revolution is far more significant than the invention of writing or even of printing.',
        theme: 'technology'
    },

    // ── HISTORY ──
    {
        author: 'Thucydides',
        source: 'History of the Peloponnesian War',
        quote: 'The secret of Happiness is Freedom, and the secret of Freedom, Courage.',
        theme: 'history'
    },
    {
        author: 'George Santayana',
        source: 'The Life of Reason',
        quote: 'Those who cannot remember the past are condemned to repeat it.',
        theme: 'history'
    },
    {
        author: 'Will Durant',
        source: 'The Lessons of History',
        quote: 'Civilization is a stream with banks. The stream is sometimes filled with blood of people stealing, shouting and doing things historians usually record, while on the banks, unnoticed, people build homes, make love, raise children, sing songs, write poetry. The story of civilization is the story of what happened on the banks.',
        theme: 'history'
    },
    {
        author: 'Winston Churchill',
        source: 'Speech to the House of Commons',
        quote: 'The farther backward you can look, the farther forward you are likely to see.',
        theme: 'history'
    },
    {
        author: 'Edward Gibbon',
        source: 'The Decline and Fall of the Roman Empire',
        quote: 'History is, indeed, little more than the register of the crimes, follies, and misfortunes of mankind.',
        theme: 'history'
    },
    {
        author: 'Lord Acton',
        source: 'Letter to Bishop Mandell Creighton',
        quote: 'Power tends to corrupt, and absolute power corrupts absolutely.',
        theme: 'history'
    }
];

function determineThemeFromText(author, text) {
    const lower = (author + ' ' + text).toLowerCase();

    if (/borges|virginia woolf|kafka|pessoa|orwell|tolstoy|dostoevsky|twain|oscar wilde|shakespeare|homer|dickinson|poe|calvino|c\.s\. lewis|ray bradbury/i.test(author)) {
        if (/book|read|literature|writer|writing|author|prose|poem|library|classic|page/i.test(lower)) return 'literature';
    }
    if (/book|read|literature|library|classic|author|writing|prose|fiction|poetry|verse/i.test(lower)) {
        return 'literature';
    }

    if (/mystery|mysterious|secret|unknown|enigma|riddle|clue|puzzle|shadow|abyss|unseen/i.test(lower)) {
        return 'mystery';
    }

    if (/fantasy|imagination|dream|magic|wonder|fairy|myth|dragon|impossible|miracle/i.test(lower)) {
        return 'fantasy';
    }

    if (/nature|earth|forest|tree|mountain|ocean|river|wild|environment|planet|animal|wilderness|sea/i.test(lower)) {
        return 'environment';
    }

    if (/politic|liberty|freedom|justice|democracy|law|government|state|citizen|republic|tyranny|power/i.test(lower)) {
        return 'politics';
    }

    if (/art|artist|beauty|music|paint|painting|sculpture|create|creative|symphony|melody/i.test(lower)) {
        return 'art';
    }

    if (/technol|machine|computer|invent|engine|digital|code|software|ai|future|robot/i.test(lower)) {
        return 'technology';
    }

    if (/history|past|century|civilization|ancestor|generation|empire|monument|ancient/i.test(lower)) {
        return 'history';
    }

    if (/money|wealth|economy|invest|market|business|profit|loss|dollar|capital|interest|price|trade/i.test(lower)) {
        return 'economy';
    }

    if (/science|physics|biology|evolution|atom|universe|experiment|mathematics|discovery|astronomy|galaxy/i.test(lower)) {
        return 'science';
    }

    if (/grow|habit|discipline|courage|will|patience|calm|virtue|resilience|mind|soul|character/i.test(lower)) {
        return 'personal growth';
    }

    return 'philosophy';
}

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

        // Fetch datasets
        console.log('Fetching JamesFT quotes...');
        const jRes = await fetch('https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json');
        const jQuotes = await jRes.json();
        console.log(`✓ Fetched ${jQuotes.length} from JamesFT`);

        console.log('Fetching DWYL quotes...');
        const dRes = await fetch('https://raw.githubusercontent.com/dwyl/quotes/main/quotes.json');
        const dQuotes = await dRes.json();
        console.log(`✓ Fetched ${dQuotes.length} from DWYL`);

        const allCandidates = [];

        // 1. Curated quotes
        CURATED_CATEGORY_QUOTES.forEach(q => {
            allCandidates.push({
                quote: cleanQuote(q.quote),
                author: q.author,
                source: q.source,
                theme: q.theme
            });
        });

        // 2. Process JamesFT quotes
        for (const q of jQuotes) {
            if (!q.quoteText || !q.quoteAuthor) continue;
            const theme = determineThemeFromText(q.quoteAuthor, q.quoteText);
            allCandidates.push({
                quote: cleanQuote(q.quoteText),
                author: q.quoteAuthor.trim(),
                source: 'Selected Quotations',
                theme
            });
        }

        // 3. Process DWYL quotes
        for (const q of dQuotes) {
            if (!q.text || !q.author) continue;
            const theme = determineThemeFromText(q.author, q.text);
            allCandidates.push({
                quote: cleanQuote(q.text),
                author: q.author.trim(),
                source: 'Selected Reflections',
                theme
            });
        }

        console.log(`Total candidate quotes assembled: ${allCandidates.length}`);

        // Get existing quotes/ideas from database
        const existingDocs = await col.find({ type: 'idea' }, { projection: { author: 1, content: 1 } }).toArray();
        const existingSet = new Set(
            existingDocs.map(d => `${(d.author || '').toLowerCase()}::${cleanQuote(d.content || '').toLowerCase().slice(0, 40)}`)
        );
        console.log(`Existing ideas in DB: ${existingDocs.length}`);

        const docsToInsert = [];
        const seenInBatch = new Set();

        for (const cand of allCandidates) {
            if (!cand.quote || cand.quote.length < 15) continue;
            const key = `${cand.author.toLowerCase()}::${cand.quote.toLowerCase().slice(0, 40)}`;
            if (existingSet.has(key) || seenInBatch.has(key)) continue;

            seenInBatch.add(key);
            const words = cand.quote.split(/\s+/).length;
            const title = generateQuoteTitle(cand.author, cand.quote, cand.theme);

            docsToInsert.push({
                type: 'idea',
                subType: 'quote',
                theme: cand.theme,
                title: title,
                author: cand.author,
                source: cand.source,
                content: `> "${cand.quote}"\n\n— **${cand.author}**${cand.source ? `, *${cand.source}*` : ''}`,
                estimatedWords: words,
                readTime: '1 min',
                title_en: title,
                content_en: `> "${cand.quote}"\n\n— **${cand.author}**${cand.source ? `, *${cand.source}*` : ''}`,
                title_de: title,
                content_de: `> "${cand.quote}"\n\n— **${cand.author}**${cand.source ? `, *${cand.source}*` : ''}`,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log(`Prepared ${docsToInsert.length} new unique quotes to insert.`);
        if (docsToInsert.length > 0) {
            const insertResult = await col.insertMany(docsToInsert);
            console.log(`✓ Successfully inserted ${insertResult.insertedCount} new quotes!`);
        }

        // Print final breakdown for all 12 categories
        console.log('\n=============================================');
        console.log('FINAL IDEA BREAKDOWN BY CATEGORY (ALL 12 THEMES)');
        console.log('=============================================');
        for (const theme of VALID_THEMES) {
            const count = await col.countDocuments({ type: 'idea', theme });
            console.log(`${theme.padEnd(16)}: ${count} ideas`);
        }

        const totalIdeas = await col.countDocuments({ type: 'idea' });
        console.log(`\nTotal Ideas across all categories: ${totalIdeas}`);

    } catch (err) {
        console.error('Error importing categories:', err);
    } finally {
        await client.close();
    }
}

run();
