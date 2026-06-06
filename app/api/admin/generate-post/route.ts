import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'DeepSeek API key is missing. Please set DEEPSEEK_API_KEY in environment variables.' }, { status: 500 });
    }

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.deepseek.com/v1',
    });

    try {
        const { day, texts, pattern } = await req.json();

        let patternInstructions = '';
        if (pattern === 'atmospheric') {
            patternInstructions = `The final line must be ONE short physical/environmental observation, max 10 words, calm, natural, and unexplained. It should reference the physical act of reading or the surroundings (e.g. weather, time of day, noise, coffee).
            Examples:
            - Rain on the glass; coffee growing cold.
            - Low light. The heater hums in the corner.
            - Long shadows stretch across the page.
            - Wind outside. Pages turn in silence.
            DO NOT use overly poetic or AI-like clichés. Keep it extremely plain, realistic, and grounded.`;
        } else if (pattern === 'resonance') {
            patternInstructions = `The final line must be ONE short conceptual connection or note on the relationship or contrast between the three pieces, max 12 words. Do not explain them or review them.
            Examples:
            - Technology advances, but the wheelbarrow remains.
            - Different centuries, but the same quiet grief.
            - Three voices, speaking of the same silence.
            DO NOT write marketing summaries. Make it cryptic, brief, and human.`;
        } else {
            patternInstructions = `The final line must be exactly: "Read during the midday pause."`;
        }

        const prompt = `
        Bradbury Method — X Post Writing Prompt

        Purpose:
        The post exists to signal daily consistency and quietly mark the day. 
        Think: a private practice that happens to be public. It is a bell, not a billboard.

        Day ${day} — Bradbury Challenge

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

        [Closing Sentence]

        Constraint: Maximum 60 words. Silence is better than explanation.
        Guiding Principle: Mark the day. Do not explain it.

        Specific Instructions for the [Closing Sentence] (${pattern} pattern):
        ${patternInstructions}

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
