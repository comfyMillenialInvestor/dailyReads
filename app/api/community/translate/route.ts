import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/lib/auth';

function getOpenAIClient() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    return new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.deepseek.com/v1',
    });
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, type = 'short_story', sourceLang = 'de' } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Titel und Inhalt sind für die Übersetzung erforderlich.' },
                { status: 400 }
            );
        }

        // We only offer German and English
        const targetLang = sourceLang === 'de' ? 'en' : 'de';
        const targetLangLabel = targetLang === 'en' ? 'English' : 'German';
        const sourceLangLabel = sourceLang === 'de' ? 'German' : 'English';

        const openai = getOpenAIClient();

        const prompt = `You are an expert literary translator specializing in creative writing, poetry, short stories, and reflective quotes.
Translate the following ${type.replace('_', ' ')} from ${sourceLangLabel} into natural, elegant, and evocative ${targetLangLabel}.

Guidelines:
- Maintain the original tone, cadence, rhythm, emotional resonance, and metaphorical richness.
- If it is a poem, preserve line breaks, stanzas, and poetic metre/meter.
- If it is a quote, ensure it sounds punchy and profound.
- If it is a short story, maintain paragraph formatting and literary prose.
- Return ONLY valid JSON with no markdown backticks, matching this exact structure:
{"title": "Translated Title", "content": "Translated Content"}`;

        const userMessage = `Title: ${title}

Content:
${content}`;

        const completion = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.3,
            max_tokens: 3500,
        });

        const rawResponse = completion.choices[0]?.message?.content?.trim() || '';

        let parsed: { title?: string; content?: string } = {};

        try {
            // Strip any unexpected markdown code fences if present
            const cleanJson = rawResponse.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
            parsed = JSON.parse(cleanJson);
        } catch (e) {
            console.warn('Could not parse JSON from translation response, falling back:', rawResponse);
            parsed = {
                title: title,
                content: rawResponse || content,
            };
        }

        const translatedTitle = parsed.title?.trim() || title;
        const translatedContent = parsed.content?.trim() || content;

        if (sourceLang === 'de') {
            return NextResponse.json({
                success: true,
                title_de: title,
                content_de: content,
                title_en: translatedTitle,
                content_en: translatedContent,
            });
        } else {
            return NextResponse.json({
                success: true,
                title_en: title,
                content_en: content,
                title_de: translatedTitle,
                content_de: translatedContent,
            });
        }
    } catch (error: any) {
        console.error('Translation error:', error);
        return NextResponse.json(
            { error: error?.message || 'Fehler bei der automatischen Übersetzung.' },
            { status: 500 }
        );
    }
}
