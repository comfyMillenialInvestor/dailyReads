async function explore() {
    const res = await fetch('https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json');
    const quotes = await res.json();
    console.log('Total JamesFT quotes:', quotes.length);

    // Check words in quotes
    const lit = quotes.filter(q => /book|read|literature|writer|writing|author|story|poem|poetry/i.test(q.quoteText));
    const mystery = quotes.filter(q => /mystery|mysterious|secret|unknown|enigma|riddle|clue|puzzle/i.test(q.quoteText));
    const fantasy = quotes.filter(q => /fantasy|imagination|dream|magic|wonder|fairy|myth/i.test(q.quoteText));
    const env = quotes.filter(q => /nature|earth|forest|tree|mountain|ocean|river|wild|environment|planet|animal/i.test(q.quoteText));
    const pol = quotes.filter(q => /politic|liberty|freedom|justice|democracy|law|government|state|citizen|republic|tyranny/i.test(q.quoteText));
    const art = quotes.filter(q => /art|artist|beauty|music|paint|painting|sculpture|create|creative/i.test(q.quoteText));
    const tech = quotes.filter(q => /technol|machine|computer|invent|science|tool|engine|future/i.test(q.quoteText));
    const hist = quotes.filter(q => /history|past|century|civilization|ancestor|generation|memory/i.test(q.quoteText));

    console.log('Literature matches:', lit.length);
    console.log('Mystery matches:', mystery.length);
    console.log('Fantasy matches:', fantasy.length);
    console.log('Environment matches:', env.length);
    console.log('Politics matches:', pol.length);
    console.log('Art matches:', art.length);
    console.log('Technology matches:', tech.length);
    console.log('History matches:', hist.length);
}

explore();
