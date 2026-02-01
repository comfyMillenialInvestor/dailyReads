import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1',
});

export async function POST(req: Request) {
    try {
        const { day, texts } = await req.json();

        const prompt = `
        Bradbury Method — X Post Writing Prompt

        Purpose:
        The post exists to signal daily consistency and quietly mark the day. 
        Think: a private practice that happens to be public. It is a bell, not a billboard.

        Day ${day} — Bradbury Method

        Texts read today:
        ${texts.map((t: any) => `- ${t.title} by ${t.author}`).join('\n')}

        Core Writing Rules:
        - Minimalist, neutral, slightly austere tone.
        - NO emojis, hashtags, exclamation points, or hype.
        - NO calls to action, links, or marketing language.
        - NO summaries, reviews, or explanations of the texts.
        - Use em dashes (—), not hyphens.
        - Titles and authors must be accurate.
        - Preserve line breaks.

        Canonical Structure:
        Day ${day} — Bradbury Method

        Poem: "{Title}" — {Author}
        Essay: "{Title}" — {Author}
        Story: "{Title}" — {Author}

        Read during the midday pause.

        (Optional: The final line may be replaced with ONE short observational sentence, max 10 words, calm and unexplained. Use sparingly.)

        Constraint: Maximum 60 words. Silence is better than explanation.
        Guiding Principle: Mark the day. Do not explain it.

        Formatting Note: Use double line breaks between the header and the list, and between the list and the closing sentence.
        `;

        const response = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'You are an austere literary assistant. You mark the day through the Bradbury Method. You do not explain, persuade, or promote.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5, // Lower temperature for more consistency
        });

        const post = response.choices[0].message.content;

        return NextResponse.json({ post });
    } catch (error: any) {
        console.error('DeepSeek generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate post' }, { status: 500 });
    }
}
