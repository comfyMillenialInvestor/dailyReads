async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/daily-reads?random=true');
        const data = await res.json();
        console.log(`Returned ${data.length} items:`);
        data.forEach((d, i) => {
            console.log(`${i + 1}. [${d.type}${d.subType ? ':' + d.subType : ''}] "${d.title}" by ${d.author} (~${d.estimatedWords} words)`);
        });
        const total = data.reduce((acc, d) => acc + (d.estimatedWords || 0), 0);
        console.log(`\nTotal words: ${total} (~${Math.round(total / 150)} min reading time)`);
    } catch (e) {
        console.error('API test failed:', e);
    }
}

testApi();
