import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content, { ContentType } from '@/lib/models/Content';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const theme = searchParams.get('theme');
        const random = searchParams.get('random') === 'true';

        // Ritual Logic: Check for scheduled content for today (CET)
        const now = new Date();
        const startOfDay = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        if (!random && !theme) {
            const scheduled = await Content.find({
                scheduledDate: { $gte: startOfDay, $lt: endOfDay }
            }).sort({ type: 1 }); // Sort by type to keep order consistent

            if (scheduled.length > 0) {
                return NextResponse.json(scheduled);
            }
        }

        // Target word count is 4000 words (~20 minutes of reading time at 200 words/minute)
        const TARGET_WORDS = 4000;

        const fetchPool = async (type: ContentType) => {
            const matchStage: any = { type };
            if (theme) matchStage.theme = theme;
            
            let docs = await Content.aggregate([
                { $match: matchStage },
                { $sample: { size: 15 } }
            ]);
            
            if (docs.length === 0 && theme) {
                // Fallback: try without theme filter
                docs = await Content.aggregate([
                    { $match: { type } },
                    { $sample: { size: 15 } }
                ]);
            }
            return docs;
        };

        const stories = await fetchPool('short_story');
        const poems = await fetchPool('poem');
        const essays = await fetchPool('essay');

        const results = [];

        if (stories.length > 0 && poems.length > 0 && essays.length > 0) {
            let bestCombo: any[] = [];
            let closestDiff = Infinity;

            for (const story of stories) {
                const sWords = story.estimatedWords || (story.content ? story.content.split(/\s+/).length : 2000);
                for (const poem of poems) {
                    const pWords = poem.estimatedWords || (poem.content ? poem.content.split(/\s+/).length : 150);
                    for (const essay of essays) {
                        const eWords = essay.estimatedWords || (essay.content ? essay.content.split(/\s+/).length : 1500);

                        const totalWords = sWords + pWords + eWords;
                        const diff = Math.abs(totalWords - TARGET_WORDS);

                        if (diff < closestDiff) {
                            closestDiff = diff;
                            bestCombo = [story, poem, essay];
                        }
                    }
                }
            }
            results.push(...bestCombo);
            console.log(`✓ Selected optimal 20-min combination (Diff: ${closestDiff} words from target)`);
        } else {
            // Fallback: simple standalone queries if any pool is empty
            const types: ContentType[] = ['short_story', 'poem', 'essay'];
            for (const type of types) {
                const matchStage: any = { type };
                if (theme) matchStage.theme = theme;
                const docs = await Content.aggregate([
                    { $match: matchStage },
                    { $sample: { size: 1 } }
                ]);
                if (docs.length > 0) {
                    results.push(docs[0]);
                }
            }
        }

        console.log(`Returning ${results.length} items for request (random: ${random}, theme: ${theme})`);
        return NextResponse.json(results);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch daily reads' },
            { status: 500 }
        );
    }
}
