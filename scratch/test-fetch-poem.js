async function testFetchPoem() {
    const res = await fetch('https://poetrydb.org/author,title/Shakespeare;Sonnet%2018');
    const data = await res.json();
    console.log('Poem result:', data[0]);
}
testFetchPoem().catch(console.error);
