async function exploreDwyl() {
    const res = await fetch('https://raw.githubusercontent.com/dwyl/quotes/main/quotes.json');
    const quotes = await res.json();
    console.log('Total dwyl quotes:', quotes.length);

    const lit = quotes.filter(q => /book|read|literature|writer|writing|author|story|poem|poetry/i.test(q.text));
    const mystery = quotes.filter(q => /mystery|mysterious|secret|unknown|enigma|riddle|clue|puzzle/i.test(q.text));
    const fantasy = quotes.filter(q => /fantasy|imagination|dream|magic|wonder|fairy|myth/i.test(q.text));
    const env = quotes.filter(q => /nature|earth|forest|tree|mountain|ocean|river|wild|environment|planet|animal/i.test(q.text));
    const pol = quotes.filter(q => /politic|liberty|freedom|justice|democracy|law|government|state|citizen|republic|tyranny/i.test(q.text));
    const art = quotes.filter(q => /art|artist|beauty|music|paint|painting|sculpture|create|creative/i.test(q.text));

    console.log('DWYL Literature matches:', lit.length);
    console.log('DWYL Mystery matches:', mystery.length);
    console.log('DWYL Fantasy matches:', fantasy.length);
    console.log('DWYL Environment matches:', env.length);
    console.log('DWYL Politics matches:', pol.length);
    console.log('DWYL Art matches:', art.length);
}

exploreDwyl();
