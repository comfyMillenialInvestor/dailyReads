import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

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
        const body = await req.json();
        const {
            day = 34,
            texts = [],
            personalNote = '',
            mood = '',
            ctaStrength = 'soft',
            pattern = 'austere',
            preferredVariant
        } = body;

        // Determine day of the week in Europe/Berlin
        const now = new Date();
        const dayOfWeekIndex = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).getDay();
        // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
        const weekdayRotations: Record<number, { preferred: 'A' | 'B' | 'C', styleDesc: string }> = {
            1: { preferred: 'A', styleDesc: 'Monday: Quote / Idea First (A) — energetic philosophical anchor' },
            2: { preferred: 'B', styleDesc: 'Tuesday: Ritual + Personal (B) — consistent Bradbury habit focus' },
            3: { preferred: 'C', styleDesc: 'Wednesday: Reflection / Teaser (C) — curious, contemplative midweek note' },
            4: { preferred: 'A', styleDesc: 'Thursday: Quote / Idea First (A) — strong resonant thought' },
            5: { preferred: 'B', styleDesc: 'Friday: Ritual + Personal (B) — reflecting on closing the week strong' },
            6: { preferred: 'C', styleDesc: 'Saturday: Behind-the-scenes / Process (C) — slower weekend pace, personal notes' },
            0: { preferred: 'A', styleDesc: 'Sunday: Gentle Quote or Pause (A) — unhurried, reflective entry' },
        };

        const weekdayDefault = weekdayRotations[dayOfWeekIndex] || { preferred: 'A', styleDesc: 'Quote / Idea First' };
        const recommendedVariantTarget = preferredVariant || weekdayDefault.preferred;

        const systemPrompt = `
Du bist der Social-Media-Assistent für den X-Account @dailyReads_io.

Kontext:
- Der User liest jeden Tag 1 Poem + 1 Essay/Idea + 1 Story.
- Der Ton ist ruhig, ehrlich, literarisch, reflektiert und menschlich (kein Marketing-Hype, keine Buzzwords, keine übertriebenen Emojis).
- WICHTIG ZUM FORMAT: Der Day-Formatierungsstil ist strikt "Day ${day}" (z.B. "Day 62" - NIEMALS "Day ${day} of 70" oder "out of...").
- Die Standard-Struktur ist wie dieses reale Beispiel:
  “Holy Thursday” by Blake — children walking two by two, a quiet hymn. On a Saturday, it feels like a reminder to slow down. 
  Day 62

  Three pieces waiting for today's pause → dailyreads.eu/today
- Die Website-URL für die tägliche Auswahl ist IMMER: dailyreads.eu/today

Aufgabe:
Erstelle 3 verschiedene Post-Varianten für den heutigen Tag (Day ${day}) sowie einen optionalen 3-Tweet-Thread.

Strukturen:

Variante A – Text Reflection & Resonance (User-Favorit):
1. Ein prägnanter Satz zu einem der drei Werke mit Autorenbezug (z.B. “Holy Thursday” by Blake — children walking two by two, a quiet hymn. On a [Wochentag], it feels like a reminder to slow down.)
2. "Day ${day}"
3. "Three pieces waiting for today's pause → dailyreads.eu/today"

Variante B – Quote / Idea First:
1. Starke Quote oder Kerngedanke aus einem der Texte
2. Kurzer persönlicher Bezug
3. "Day ${day}"
4. "Three pieces waiting for today's pause → dailyreads.eu/today"

Variante C – Atmospheric Routine:
1. Kurze ruhige Beobachtung des Lesemoments oder Themas
2. Die Stücke kurz angedeutet
3. "Day ${day}"
4. "Three pieces waiting for today's pause → dailyreads.eu/today"

Regeln:
- STRICT: Immer "Day ${day}" verwenden. NIEMALS "of 70" oder "out of 70".
- STRICT: CTA-Link ist IMMER "dailyreads.eu/today".
- Jeder Post MUSS maximal 280 Zeichen lang sein (inklusive Leerzeichen und Link).
- Keine vagen Listen ohne Kontext.
- Baue die persönliche Note des Users ein, falls vorhanden.
- CTA-Stärke: ${ctaStrength}
  * soft: "Three pieces waiting for today's pause → dailyreads.eu/today"
  * medium: "Today's readings live → dailyreads.eu/today"
  * strong: "Join today's pause → dailyreads.eu/today"

Output-Format:
Gib deine Antwort AUSSCHLIESSLICH als valides JSON-Objekt zurück mit folgenden Feldern:
{
  "variantA": {
    "text": "Post-Text für Variante A (max 280 Zeichen)",
    "charCount": 178
  },
  "variantB": {
    "text": "Post-Text für Variante B (max 280 Zeichen)",
    "charCount": 185
  },
  "variantC": {
    "text": "Post-Text für Variante C (max 280 Zeichen)",
    "charCount": 160
  },
  "thread": [
    "Tweet 1 (Hook / Gedanke + Day ${day})",
    "Tweet 2 (Die drei Stücke kurz mit Autoren + persönlicher Kommentar)",
    "Tweet 3 (Abschlussgedanke + CTA → dailyreads.eu/today)"
  ],
  "recommended": "A",
  "recommendationReason": "Ein prägnanter Satz, warum diese Variante heute am stärksten ist."
}
`;

        const userPayload = {
            day_number: day,
            weekday_context: weekdayDefault.styleDesc,
            texts: texts.map((t: any) => ({
                type: t.type || 'text',
                title: t.title || '',
                author: t.author || '',
                note: t.note || ''
            })),
            personalNote: personalNote || '',
            mood: mood || '',
            ctaStrength
        };

        const response = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(userPayload, null, 2) }
            ],
            temperature: 0.6,
            response_format: { type: 'json_object' }
        });

        const rawContent = response.choices[0].message.content || '{}';
        let parsed: any = {};

        try {
            parsed = JSON.parse(rawContent);
        } catch (e) {
            console.warn('Direct JSON parse failed, extracting via regex:', e);
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            }
        }

        // Clean character counts
        if (parsed.variantA?.text) parsed.variantA.charCount = parsed.variantA.text.length;
        if (parsed.variantB?.text) parsed.variantB.charCount = parsed.variantB.text.length;
        if (parsed.variantC?.text) parsed.variantC.charCount = parsed.variantC.text.length;

        const recommended = parsed.recommended || recommendedVariantTarget;
        const recommendedText = parsed[`variant${recommended}`]?.text || parsed.variantA?.text || '';

        return NextResponse.json({
            success: true,
            day,
            recommended,
            recommendationReason: parsed.recommendationReason || `${weekdayDefault.styleDesc} fits today's rhythm best.`,
            variantA: parsed.variantA || { text: '', charCount: 0 },
            variantB: parsed.variantB || { text: '', charCount: 0 },
            variantC: parsed.variantC || { text: '', charCount: 0 },
            thread: Array.isArray(parsed.thread) ? parsed.thread : [],
            post: recommendedText, // backward compatibility with challenge page
        });
    } catch (error: any) {
        console.error('DeepSeek generation failed:', error);
        return NextResponse.json({ error: error?.message || 'Failed to generate post' }, { status: 500 });
    }
}
