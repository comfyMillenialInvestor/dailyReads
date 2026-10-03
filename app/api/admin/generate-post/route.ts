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
- Der Account macht eine 70-Tage-Bradbury-Challenge (oder länger).
- Jeden Tag wird 1 Poem + 1 Essay/Idea + 1 Story gelesen.
- Der Ton ist ruhig, ehrlich, leicht literarisch, reflektiert und menschlich (kein Marketing-Hype, keine Buzzwords, keine übertriebenen Emojis).
- Der User ist deutschsprachig, schreibt aber auf Englisch. Kurze, natürliche deutsche Redewendungen oder Einschübe sind erlaubt und willkommen, wenn sie authentisch wirken (z.B. „In Germany we say: Mehr sein als scheinen“ oder „Ein ruhiger Vormittag“).
- Die Website dailyreads.io bietet eine dedizierte /today-Seite (sowie /day/\${day}) mit den exakten drei Texten des Tages, sowie Lese-Historie für Accounts.
- Die CTAs sollen sanft und einladend sein, niemals aggressiv oder werblich.

Aufgabe:
Erstelle 3 verschiedene Post-Varianten für den heutigen Tag (Day \${day}) sowie einen optionalen 3-Tweet-Thread.

Strukturen:

Variante A – Quote / Idea First (oft die stärkste):
1. Starke Quote oder zentrale Idee
2. Kurzer persönlicher Kommentar
3. Day-Number + Kontext
4. Soft CTA (z.B. "Three pieces waiting for today's pause → dailyreads.io/today")

Variante B – Ritual + Persönlich:
1. "Day \${day} of 70 — Bradbury Method" (oder Ritual)
2. Kurze Erwähnung der drei Stücke + 1 persönlicher Satz
3. Soft CTA (z.B. "Today's readings live at dailyreads.io/today")

Variante C – Reflection / Teaser:
1. Persönlicher Gedanke oder Neugier-Satz zuerst
2. Bezug zu einem der Texte
3. Day + CTA (z.B. "Join today's pause → dailyreads.io/today")

Regeln:
- Jeder Post MUSS eigenständig funktionieren und maximal 280 Zeichen lang sein (inklusive Leerzeichen und Link).
- Keine vagen Listen ohne Kontext.
- Baue die persönliche Note des Users ein, falls vorhanden.
- CTA-Stärke: \${ctaStrength}
  * soft: "Three pieces waiting for today's pause → dailyreads.io/today"
  * medium: "I read these three today. You can read them here → dailyreads.io/today"
  * strong: "Join today's Bradbury pause (Day \${day}) & keep your streak → dailyreads.io/today"

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
    "Tweet 1 (Hook / Quote / Gedanke + Day \${day})",
    "Tweet 2 (Die drei Stücke kurz mit Autoren + persönlicher Kommentar)",
    "Tweet 3 (Abschlussgedanke + CTA → dailyreads.io/today)"
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
