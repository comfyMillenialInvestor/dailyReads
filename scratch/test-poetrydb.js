async function testPoetryDB() {
    const res = await fetch('https://poetrydb.org/author/Keats/title');
    const data = await res.json();
    console.log(`Keats titles count: ${data.length}`);
    console.log('Sample titles:', data.slice(0, 5));
}
testPoetryDB().catch(console.error);
