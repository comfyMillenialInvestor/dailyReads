const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

async function testDeepSeek() {
    const openai = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1',
    });

    const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Translate to German: "The journey of a thousand miles begins with a single step."' }],
        max_tokens: 100
    });

    console.log('DeepSeek translation:', completion.choices[0].message.content);
}

testDeepSeek().catch(console.error);
