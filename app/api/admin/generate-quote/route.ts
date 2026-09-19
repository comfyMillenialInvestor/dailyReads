import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/lib/db';
import Completion from '@/lib/models/Completion';
import '@/lib/models/Content'; // Ensure model registration
import Content, { IContent } from '@/lib/models/Content';

export async function GET(req: Request) {
    try {
        await dbConnect();
        
        // Find completions with populated contentIds
        const completions = await Completion.find({})
            .populate('contentIds')
            .sort({ date: -1 })
            .limit(7)
            .lean();

        if (!completions || completions.length === 0) {
            return NextResponse.json({ 
                error: 'No reading completions found in database.',
                texts: [] 
            }, { status: 404 });
        }

        // Check if there is one for today (Europe/Berlin)
        const now = new Date();
        const todayStr = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).toDateString();
        
        const todays = completions.find((c: any) => {
            const compDateStr = new Date(c.date).toDateString();
            return compDateStr === todayStr;
        }) || completions[0]; // fallback to most recent if none completed today yet

        const rawTexts = Array.isArray(todays.contentIds) ? todays.contentIds : [];
        const texts = rawTexts.map((t: any) => ({
            id: t._id ? t._id.toString() : '',
            title: t.title || 'Untitled',
            author: t.author || 'Unknown',
            type: t.type || 'text',
            theme: t.theme || '',
            hasContent: Boolean(t.content && t.content.length > 50),
            preview: t.content ? t.content.slice(0, 150) + '...' : ''
        }));

        return NextResponse.json({
            isToday: new Date(todays.date).toDateString() === todayStr,
            completionDate: todays.date,
            texts
        });
    } catch (error: any) {
        console.error('Error fetching today readings for quotes:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Missing DEEPSEEK_API_KEY in environment' }, { status: 500 });
    }

    try {
        await dbConnect();
        const body = await req.json().catch(() => ({}));
        const { contentId, customQuoteText, customAuthor, customTitle, streakDay, style = 'minimal' } = body;

        let sourceTitle = customTitle || '';
        let sourceAuthor = customAuthor || '';
        let textPassage = customQuoteText || '';

        // If a specific contentId was requested or none provided, find the content
        if (contentId) {
            const found = await Content.findById(contentId).lean() as IContent | null;
            if (found) {
                sourceTitle = found.title;
                sourceAuthor = found.author;
                textPassage = found.content;
            }
        } else if (!textPassage) {
            // Pick from latest completion
            const completions = await Completion.find({})
                .populate('contentIds')
                .sort({ date: -1 })
                .limit(1)
                .lean();

            if (completions.length > 0 && Array.isArray(completions[0].contentIds) && completions[0].contentIds.length > 0) {
                // Select text with richest content
                const candidates = completions[0].contentIds as any[];
                const chosen = candidates.find((c: any) => c.content && c.content.length > 100) || candidates[0];
                if (chosen) {
                    sourceTitle = chosen.title;
                    sourceAuthor = chosen.author;
                    textPassage = chosen.content || '';
                }
            }
        }

        if (!textPassage && !sourceTitle) {
            return NextResponse.json({ 
                error: 'No reading text found to extract quotes from. Please complete a daily read first or enter title & author.' 
            }, { status: 400 });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://api.deepseek.com/v1',
        });

        const systemPrompt = `You are a literary editor curating beautiful, evocative, and thought-provoking quotes from daily reading sessions for an X (Twitter) audience.

Rules:
1. Find 3 distinct quotes from the provided text.
2. The quotes should be poignant, poetic, philosophical, or striking. Not generic or dry exposition.
3. Keep the quote itself accurate to the text (do not invent quotes if full text is provided; if only a summary or short excerpt is provided, craft a reverent quote that captures the essence).
4. Each quote option must be formatted cleanly for an X post:
   Format:
   "[Quote text]"

   — [Author], [Title]
   ${streakDay ? `Day ${streakDay} • Bradbury Challenge` : ''}

5. CRITICAL: The entire post must be UNDER 280 CHARACTERS.
6. NO hashtags, NO emojis, NO promotional hype.
7. Return valid JSON only with array "quotes". Each item has "quote", "author", "title", "formattedPost", and "characterCount".`;

        const userPrompt = `Extract quotes from the following reading:
Title: ${sourceTitle}
Author: ${sourceAuthor}

Text excerpt / content:
${textPassage ? textPassage.slice(0, 4000) : 'Title and author only'}

Generate 3 quote options formatted for X.`;

        const completion = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 600,
        });

        const rawContent = completion.choices[0]?.message?.content || '{}';
        let parsed: any = {};
        try {
            parsed = JSON.parse(rawContent);
        } catch {
            parsed = { quotes: [] };
        }

        const quotes = Array.isArray(parsed.quotes) ? parsed.quotes : [];

        // Ensure character count is accurate
        const formattedQuotes = quotes.map((q: any) => ({
            quote: q.quote || '',
            author: q.author || sourceAuthor,
            title: q.title || sourceTitle,
            formattedPost: q.formattedPost || `"${q.quote}"\n\n— ${q.author || sourceAuthor}, ${q.title || sourceTitle}`,
            characterCount: (q.formattedPost || `"${q.quote}"\n\n— ${q.author || sourceAuthor}, ${q.title || sourceTitle}`).length
        }));

        return NextResponse.json({
            success: true,
            sourceTitle,
            sourceAuthor,
            quotes: formattedQuotes
        });

    } catch (error: any) {
        console.error('Quote generation error:', error);
        return NextResponse.json({ error: error.message || 'Quote generation failed' }, { status: 500 });
    }
}
