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

        // We need 1 story, 1 poem, 1 essay
        const types: ContentType[] = ['short_story', 'poem', 'essay'];
        const results = [];

        // Debug: Log database contents
        console.log('\n=== DATABASE INSPECTION ===');
        console.log(`Using collection: ${Content.collection.name}`);
        for (const type of types) {
            const count = await Content.countDocuments({ type });
            console.log(`Total ${type} in database: ${count}`);
        }
        console.log('===========================\n');


        for (const type of types) {
            let doc;

            // Build match query
            const matchStage: any = { type };
            if (theme) matchStage.theme = theme;

            console.log(`\n--- Querying for type: ${type} ---`);
            console.log('Match criteria:', JSON.stringify(matchStage));

            // Count total documents matching criteria
            const totalCount = await Content.countDocuments(matchStage);
            console.log(`Total ${type} documents matching criteria: ${totalCount}`);

            // Use MongoDB's $sample for true random selection
            // $sample uses a pseudo-random cursor which provides better randomness
            const pipeline: any[] = [
                { $match: matchStage },
                { $sample: { size: 1 } }
            ];

            const docs = await Content.aggregate(pipeline);

            if (docs.length > 0) {
                doc = docs[0];
                console.log(`✓ Found via main query: "${doc.title}" (ID: ${doc._id})`);
            } else if (theme) {
                // Fallback: try without theme filter
                console.log(`⚠ No ${type} found with theme "${theme}", trying fallback without theme...`);
                const fallbackMatchStage = { type };
                const fallbackCount = await Content.countDocuments(fallbackMatchStage);
                console.log(`Total ${type} documents in fallback: ${fallbackCount}`);

                const fallbackPipeline: any[] = [
                    { $match: fallbackMatchStage },
                    { $sample: { size: 1 } }
                ];

                const fallbackDocs = await Content.aggregate(fallbackPipeline);
                if (fallbackDocs.length > 0) {
                    doc = fallbackDocs[0];
                    console.log(`✓ Found via fallback: "${doc.title}" (ID: ${doc._id})`);
                }
            } else {
                console.log(`✗ No ${type} documents found at all!`);
            }

            if (doc) {
                results.push(doc);
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
