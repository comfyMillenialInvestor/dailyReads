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

async function testAllThemes() {
    console.log('Testing /api/daily-reads for all 12 themes...\n');
    for (const theme of VALID_THEMES) {
        try {
            const res = await fetch(`http://localhost:3000/api/daily-reads?theme=${encodeURIComponent(theme)}`);
            const items = await res.json();
            const ideaItem = items.find(it => it.type === 'idea');
            console.log(`✓ [${theme.padEnd(16)}] Returned ${items.length} items | Idea: "${ideaItem?.title}" by ${ideaItem?.author} (~${ideaItem?.estimatedWords} words)`);
        } catch (e) {
            console.error(`✗ [${theme}] Error:`, e.message);
        }
    }
}

testAllThemes();
