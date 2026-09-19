const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'dailyReads';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

// Curated lists of target authors and categorizations
const PHILOSOPHERS = [
    'Socrates', 'Plato', 'Aristotle', 'Confucius', 'Lao Tzu', 'Laozi', 'Sun Tzu', 
    'Epicurus', 'Cicero', 'Plutarch', 'Thomas Aquinas', 'Niccolò Machiavelli', 'Machiavelli',
    'Michel de Montaigne', 'Montaigne', 'Francis Bacon', 'René Descartes', 'Descartes', 
    'Baruch Spinoza', 'Spinoza', 'John Locke', 'Voltaire', 'David Hume', 
    'Jean-Jacques Rousseau', 'Rousseau', 'Immanuel Kant', 'Kant', 'Arthur Schopenhauer', 
    'Schopenhauer', 'Ralph Waldo Emerson', 'Emerson', 'Henry David Thoreau', 'Thoreau', 
    'Friedrich Nietzsche', 'Nietzsche', 'Bertrand Russell', 'Ludwig Wittgenstein', 
    'Wittgenstein', 'Jean-Paul Sartre', 'Sartre', 'Albert Camus', 'Camus', 'Kierkegaard',
    'Søren Kierkegaard', 'Hannah Arendt', 'Simone de Beauvoir', 'Marcus Aurelius', 'Seneca',
    'Epictetus', 'Heraclitus', 'Parmenides', 'Diogenes', 'Zeno of Citium', 'Chrysippus',
    'Musonius Rufus'
];

const SCIENTISTS = [
    'Albert Einstein', 'Richard Feynman', 'Charles Darwin', 'Isaac Newton', 'Galileo Galilei',
    'Marie Curie', 'Carl Sagan', 'Louis Pasteur', 'Nikola Tesla', 'Leonardo da Vinci',
    'Johannes Kepler', 'Blaise Pascal', 'Max Planck', 'Niels Bohr', 'Stephen Hawking',
    'Alan Turing', 'Werner Heisenberg', 'Michael Faraday', 'James Clerk Maxwell',
    'Alexander von Humboldt', 'Gregor Mendel', 'Erwin Schrödinger', 'Robert Oppenheimer',
    'Enrico Fermi', 'Francis Crick', 'James Watson', 'Rosalind Franklin', 'Ada Lovelace',
    'Rachel Carson', 'Jane Goodall', 'Claude Shannon', 'John von Neumann'
];

const FINANCE_ECONOMY = [
    'Warren Buffett', 'Charlie Munger', 'Benjamin Graham', 'Peter Lynch', 'John Bogle',
    'Adam Smith', 'Benjamin Franklin', 'John Maynard Keynes', 'Milton Friedman', 
    'Thomas Sowell', 'Friedrich Hayek', 'Joseph Schumpeter', 'David Ricardo', 
    'Nassim Nicholas Taleb', 'Howard Marks', 'Ray Dalio', 'Morgan Housel', 'Philip Fisher',
    'Paul Volcker', 'Felix Dennis'
];

// Additional high-caliber finance quotes curated directly to ensure strong representation
const CURATED_FINANCE_QUOTES = [
    {
        author: 'Warren Buffett',
        source: 'Berkshire Hathaway Shareholder Letter',
        quote: 'Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.',
        theme: 'economy'
    },
    {
        author: 'Warren Buffett',
        source: 'Berkshire Hathaway Shareholder Letter',
        quote: 'Price is what you pay. Value is what you get.',
        theme: 'economy'
    },
    {
        author: 'Warren Buffett',
        source: 'Chairman Reflections',
        quote: 'It is far better to buy a wonderful company at a fair price than a fair company at a wonderful price.',
        theme: 'economy'
    },
    {
        author: 'Warren Buffett',
        source: 'Berkshire Hathaway Shareholder Letter',
        quote: 'The stock market is a device for transferring money from the impatient to the patient.',
        theme: 'economy'
    },
    {
        author: 'Warren Buffett',
        source: 'Speech at Columbia Business School',
        quote: 'Risk comes from not knowing what you are doing.',
        theme: 'economy'
    },
    {
        author: 'Charlie Munger',
        source: 'Poor Charlie\'s Almanack',
        quote: 'Spend each day trying to be a little wiser than you were when you woke up. Discharge your duties faithfully and well. Step by step you get ahead, but not necessarily in fast spurts.',
        theme: 'personal growth'
    },
    {
        author: 'Charlie Munger',
        source: 'Poor Charlie\'s Almanack',
        quote: 'Invert, always invert: Turn a situation or problem upside down. What happens if all our plans fail? Where don’t we want to go, and how do you get there?',
        theme: 'philosophy'
    },
    {
        author: 'Charlie Munger',
        source: 'USC Law School Commencement',
        quote: 'The best thing a human being can do is to help another human being know more.',
        theme: 'personal growth'
    },
    {
        author: 'Benjamin Graham',
        source: 'The Intelligent Investor',
        quote: 'In the short run, the market is a voting machine, but in the long run, it is a weighing machine.',
        theme: 'economy'
    },
    {
        author: 'Benjamin Graham',
        source: 'The Intelligent Investor',
        quote: 'The investor\'s chief problem—and even his worst enemy—is likely to be himself.',
        theme: 'economy'
    },
    {
        author: 'Benjamin Graham',
        source: 'The Intelligent Investor',
        quote: 'Confronted with a challenge to distill the secret of sound investment into three words, we venture the motto, MARGIN OF SAFETY.',
        theme: 'economy'
    },
    {
        author: 'Adam Smith',
        source: 'The Wealth of Nations',
        quote: 'It is not from the benevolence of the butcher, the brewer, or the baker that we expect our dinner, but from their regard to their own interest.',
        theme: 'economy'
    },
    {
        author: 'Adam Smith',
        source: 'The Theory of Moral Sentiments',
        quote: 'To feel much for others and little for ourselves; to restrain our selfishness and exercise our benevolent affections, constitutes the perfection of human nature.',
        theme: 'philosophy'
    },
    {
        author: 'John Bogle',
        source: 'Common Sense on Mutual Funds',
        quote: 'Don\'t look for the needle in the haystack. Just buy the haystack!',
        theme: 'economy'
    },
    {
        author: 'John Bogle',
        source: 'Enough: True Measures of Money, Business, and Life',
        quote: 'Time is your friend; impulse is your enemy. Take advantage of compound interest and don\'t be captivated by the siren song of the market.',
        theme: 'economy'
    },
    {
        author: 'Peter Lynch',
        source: 'One Up On Wall Street',
        quote: 'Know what you own, and know why you own it.',
        theme: 'economy'
    },
    {
        author: 'Peter Lynch',
        source: 'One Up On Wall Street',
        quote: 'In this business, if you\'re good, you\'re right six times out of ten. You\'re never going to be right nine times out of ten.',
        theme: 'economy'
    },
    {
        author: 'Benjamin Franklin',
        source: 'The Way to Wealth',
        quote: 'An investment in knowledge pays the best interest.',
        theme: 'personal growth'
    },
    {
        author: 'Benjamin Franklin',
        source: 'Poor Richard\'s Almanack',
        quote: 'Beware of little expenses; a small leak will sink a great ship.',
        theme: 'economy'
    },
    {
        author: 'Howard Marks',
        source: 'The Most Important Thing',
        quote: 'You can\'t do the same things others do and expect to outperform. Being different is a prerequisite.',
        theme: 'economy'
    },
    {
        author: 'Morgan Housel',
        source: 'The Psychology of Money',
        quote: 'Doing well with money has a little to do with how smart you are and a lot to do with how you behave.',
        theme: 'economy'
    },
    {
        author: 'Morgan Housel',
        source: 'The Psychology of Money',
        quote: 'Spending money to show people how much money you have is the fastest way to have less money.',
        theme: 'economy'
    },
    {
        author: 'Nassim Nicholas Taleb',
        source: 'Antifragile: Things That Gain from Disorder',
        quote: 'Wind extinguishes a candle and energizes fire. Likewise with randomness, uncertainty, chaos: you want to use them, not hide from them.',
        theme: 'philosophy'
    },
    {
        author: 'Nassim Nicholas Taleb',
        source: 'Skin in the Game',
        quote: 'Don\'t tell me what you think, tell me what you have in your portfolio.',
        theme: 'economy'
    },
    {
        author: 'John Maynard Keynes',
        source: 'The General Theory of Employment, Interest and Money',
        quote: 'The market can remain irrational longer than you can remain solvent.',
        theme: 'economy'
    },
    {
        author: 'Thomas Sowell',
        source: 'Basic Economics',
        quote: 'There are no solutions. There are only trade-offs.',
        theme: 'economy'
    }
];

function determineTheme(author, text) {
    const lowerText = text.toLowerCase();
    const lowerAuthor = author.toLowerCase();

    // Check scientists
    if (SCIENTISTS.some(s => lowerAuthor.includes(s.toLowerCase()))) {
        return 'science';
    }

    // Check finance
    if (FINANCE_ECONOMY.some(f => lowerAuthor.includes(f.toLowerCase()))) {
        return 'economy';
    }

    // Check stoics
    if (/marcus aurelius|seneca|epictetus|musonius|zeno|chrysippus/i.test(author)) {
        if (/nature|universe|cosmic/i.test(lowerText)) return 'philosophy';
        if (/grief|sorrow|anger|fear|patience|calm|virtue|habit/i.test(lowerText)) return 'personal growth';
        return 'philosophy';
    }

    // Check text keywords
    if (/science|physics|nature|universe|experiment|mathematics|discovery|evolution|atom/i.test(lowerText)) {
        return 'science';
    }
    if (/money|wealth|economy|invest|market|business|profit|loss|dollar|capital|interest/i.test(lowerText)) {
        return 'economy';
    }
    if (/history|century|past|civilization|empire|war|peace|generation/i.test(lowerText)) {
        return 'history';
    }
    if (/grow|habit|discipline|learn|character|courage|will|strength|mind/i.test(lowerText)) {
        return 'personal growth';
    }
    if (/art|beauty|music|painting|poem|literature|story/i.test(lowerText)) {
        return 'art';
    }
    if (/politic|liberty|freedom|justice|law|state|society|citizen/i.test(lowerText)) {
        return 'politics';
    }

    return 'philosophy';
}

function cleanQuote(text) {
    if (!text) return '';
    return text.trim().replace(/^["“']|["”']$/g, '').trim();
}

function generateQuoteTitle(author, text, theme) {
    // Produce a clean, elegant title like:
    // "Seneca on Fortune" or a punchy phrase from the quote
    const cleaned = cleanQuote(text);
    const words = cleaned.split(/\s+/);
    if (words.length <= 6) {
        return cleaned;
    }
    const topic = theme.charAt(0).toUpperCase() + theme.slice(1);
    return `${author} on ${topic}`;
}

async function fetchAwesomeStoicism() {
    console.log('Fetching awesome-stoicism dataset...');
    try {
        const res = await fetch('https://raw.githubusercontent.com/DavidWells/awesome-stoicism/master/quotes.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log(`✓ Fetched ${data.length} quotes from awesome-stoicism`);
        return data.map(item => ({
            quote: cleanQuote(item.quote),
            author: item.author?.trim() || 'Stoic Philosopher',
            source: item.source?.trim() || 'Stoic Reflections',
            theme: determineTheme(item.author || '', item.quote || '')
        }));
    } catch (e) {
        console.error('Error fetching awesome-stoicism:', e.message);
        return [];
    }
}

async function fetchJamesFTQuotes() {
    console.log('Fetching JamesFT quotes dataset...');
    try {
        const res = await fetch('https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log(`✓ Fetched ${data.length} total quotes from JamesFT`);

        // Filter for philosophers, scientists, finance, and profound thinkers
        const targetAuthorsRegex = new RegExp(
            [...PHILOSOPHERS, ...SCIENTISTS, ...FINANCE_ECONOMY].join('|'),
            'i'
        );

        const filtered = data.filter(q => {
            if (!q.quoteText || !q.quoteAuthor) return false;
            return targetAuthorsRegex.test(q.quoteAuthor);
        });

        console.log(`✓ Filtered ${filtered.length} high-relevance quotes from target philosophers, scientists & economists`);

        return filtered.map(item => ({
            quote: cleanQuote(item.quoteText),
            author: item.quoteAuthor.trim(),
            source: 'Selected Quotations',
            theme: determineTheme(item.quoteAuthor, item.quoteText)
        }));
    } catch (e) {
        console.error('Error fetching JamesFT quotes:', e.message);
        return [];
    }
}

async function importQuotes() {
    if (!MONGO_URI) {
        console.error('Missing MONGO_URI');
        process.exit(1);
    }

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Fetch datasets
        const stoicQuotes = await fetchAwesomeStoicism();
        const famousQuotes = await fetchJamesFTQuotes();
        const curatedFinance = CURATED_FINANCE_QUOTES.map(q => ({
            quote: cleanQuote(q.quote),
            author: q.author,
            source: q.source,
            theme: q.theme || 'economy'
        }));

        const allCandidates = [...curatedFinance, ...stoicQuotes, ...famousQuotes];
        console.log(`Total quote candidates assembled: ${allCandidates.length}`);

        // Deduplicate candidates by author + first 40 chars of quote
        const seen = new Set();
        const uniqueQuotes = [];

        for (const candidate of allCandidates) {
            if (!candidate.quote || candidate.quote.length < 15) continue;
            const key = `${candidate.author.toLowerCase()}::${candidate.quote.toLowerCase().slice(0, 40)}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueQuotes.push(candidate);
            }
        }

        console.log(`Unique candidates after deduplication: ${uniqueQuotes.length}`);

        // Check for existing quotes in DB to avoid duplicates
        const existingQuotes = await collection.find({ type: 'quote' }, { projection: { author: 1, content: 1 } }).toArray();
        const existingSet = new Set(existingQuotes.map(q => `${q.author.toLowerCase()}::${cleanQuote(q.content).toLowerCase().slice(0, 40)}`));
        console.log(`Existing quotes in database: ${existingQuotes.length}`);

        const docsToInsert = [];
        for (const q of uniqueQuotes) {
            const key = `${q.author.toLowerCase()}::${q.quote.toLowerCase().slice(0, 40)}`;
            if (existingSet.has(key)) continue;

            const words = q.quote.split(/\s+/).length;
            const title = generateQuoteTitle(q.author, q.quote, q.theme);

            docsToInsert.push({
                type: 'quote',
                theme: q.theme,
                title: title,
                author: q.author,
                source: q.source,
                content: `> "${q.quote}"\n\n— **${q.author}**${q.source ? `, *${q.source}*` : ''}`,
                estimatedWords: words,
                readTime: '1 min',
                title_en: title,
                content_en: `> "${q.quote}"\n\n— **${q.author}**${q.source ? `, *${q.source}*` : ''}`,
                title_de: title,
                content_de: `> "${q.quote}"\n\n— **${q.author}**${q.source ? `, *${q.source}*` : ''}`,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        if (docsToInsert.length === 0) {
            console.log('No new quotes to insert.');
        } else {
            console.log(`Inserting ${docsToInsert.length} new quotes into ${DB_NAME}.${COLLECTION_NAME}...`);
            const insertResult = await collection.insertMany(docsToInsert);
            console.log(`✓ Inserted ${insertResult.insertedCount} quotes!`);
        }

        // Summary by theme and author
        const totalQuotes = await collection.countDocuments({ type: 'quote' });
        console.log(`\n=== Total Quotes in Database: ${totalQuotes} ===`);

        const themeCounts = await collection.aggregate([
            { $match: { type: 'quote' } },
            { $group: { _id: '$theme', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        console.log('Breakdown by theme:');
        themeCounts.forEach(t => console.log(`  - ${t._id}: ${t.count}`));

        const topAuthors = await collection.aggregate([
            { $match: { type: 'quote' } },
            { $group: { _id: '$author', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();

        console.log('\nTop 10 Authors in Quotes:');
        topAuthors.forEach(a => console.log(`  - ${a._id}: ${a.count}`));

    } catch (err) {
        console.error('Import quotes failed:', err);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n✓ MongoDB connection closed');
    }
}

importQuotes();
