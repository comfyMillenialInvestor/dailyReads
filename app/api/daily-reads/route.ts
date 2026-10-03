import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content, { ContentType } from '@/lib/models/Content';
import crypto from 'crypto';

import DailyRitual from '@/lib/models/DailyRitual';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const theme = searchParams.get('theme');
        const random = searchParams.get('random') === 'true';

        // Ritual Logic: Check for scheduled content or active DailyRitual for today (CET)
        const now = new Date();
        const startOfDay = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        if (!random && !theme) {
            const ritual = await DailyRitual.findOne({
                date: { $gte: startOfDay, $lt: endOfDay }
            }).populate('contentIds');

            if (ritual && Array.isArray(ritual.contentIds) && ritual.contentIds.length > 0) {
                return NextResponse.json(ritual.contentIds);
            }

            const scheduled = await Content.find({
                scheduledDate: { $gte: startOfDay, $lt: endOfDay }
            }).sort({ type: 1 }); // Sort by type to keep order consistent

            if (scheduled.length > 0) {
                return NextResponse.json(scheduled);
            }
        }

        // Target word count is ~1800 words (calibrated for a mindful 15-20 minute lunch break)
        const TARGET_WORDS = 1800;

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
        let ideas = await fetchPool('idea');
        if (ideas.length === 0) {
            ideas = await fetchPool('quote');
        }

        const results = [];

        if (stories.length > 0 && poems.length > 0 && ideas.length > 0) {
            let bestCombo: any[] = [];
            let closestDiff = Infinity;

            for (const story of stories) {
                const sWords = story.estimatedWords || (story.content ? story.content.split(/\s+/).length : 1500);
                for (const poem of poems) {
                    const pWords = poem.estimatedWords || (poem.content ? poem.content.split(/\s+/).length : 150);
                    for (const idea of ideas) {
                        const iWords = idea.estimatedWords || (idea.content ? idea.content.split(/\s+/).length : 50);

                        const totalWords = sWords + pWords + iWords;
                        const diff = Math.abs(totalWords - TARGET_WORDS);

                        if (diff < closestDiff) {
                            closestDiff = diff;
                            bestCombo = [story, poem, idea];
                        }
                    }
                }
            }
            results.push(...bestCombo);
            console.log(`✓ Selected optimal 20-min combination (Story + Poem + Idea, Diff: ${closestDiff} words from target)`);
        } else {
            // Fallback: simple standalone queries if any pool is empty
            const types: ContentType[] = ['short_story', 'poem', 'idea'];
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
