async function checkPoetryDbClassicAuthors() {
    const classicAuthors = [
        'William Shakespeare',
        'William Wordsworth',
        'Emily Dickinson',
        'Oscar Wilde',
        'Edgar Allan Poe',
        'Walt Whitman',
        'John Keats',
        'Percy Bysshe Shelley',
        'George Gordon, Lord Byron',
        'William Blake',
        'Lord Alfred Tennyson',
        'Robert Browning',
        'Elizabeth Barrett Browning',
        'Christina Rossetti',
        'Samuel Coleridge',
        'John Donne',
        'John Milton',
        'Henry Wadsworth Longfellow',
        'Ralph Waldo Emerson',
        'Henry David Thoreau',
        'Matthew Arnold',
        'Robert Burns',
        'Robert Herrick',
        'Robert Louis Stevenson',
        'Christopher Marlowe',
        'Andrew Marvell',
        'Ben Jonson',
        'Thomas Gray',
        'Paul Laurence Dunbar',
        'Alexander Pope'
    ];

    console.log(`Checking ${classicAuthors.length} classic authors on PoetryDB...`);
    let totalPoems = 0;
    for (const author of classicAuthors) {
        try {
            const encoded = encodeURIComponent(author);
            const res = await fetch(`https://poetrydb.org/author/${encoded}/title`);
            const data = await res.json();
            const count = Array.isArray(data) ? data.length : 0;
            console.log(`- ${author}: ${count} poems`);
            totalPoems += count;
        } catch (e) {
            console.error(`Error fetching for ${author}:`, e.message);
        }
    }
    console.log(`Total poems available across these classic authors: ${totalPoems}`);
}

checkPoetryDbClassicAuthors().catch(console.error);
