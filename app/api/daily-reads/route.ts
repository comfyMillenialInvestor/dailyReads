import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content, { ContentType } from '@/lib/models/Content';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const theme = searchParams.get('theme');
        const random = searchParams.get('random') === 'true';

        // We need 1 story, 1 poem, 1 essay
        const types: ContentType[] = ['short_story', 'poem', 'essay'];
        const results = [];

        for (const type of types) {
            let query: any = { type };

            // Apply theme filter if provided
            if (theme) {
                query.theme = theme;
            }

            // If random requested, we use aggregation $sample
            // But simple implementation: find matching documents and pick one random
            // For MVP with small DB, this is fine. For larger DB, $sample aggregate is better.

            let doc;

            // Use aggregation for random sampling
            const matchStage: any = { type };
            if (theme) matchStage.theme = theme;

            const aggregation = await Content.aggregate([
                { $match: matchStage },
                { $sample: { size: 1 } }
            ]);

            if (aggregation.length > 0) {
                doc = aggregation[0];
            } else {
                // Fallback: if no content for specific theme, try random of that type (ignoring theme)
                // Or return null, client handles it. 
                // Let's try to fetch random of that type regardless of theme if theme not found
                // But the requirement says "fetcht 3 Texte... aus diesem spezifischen Theme"
                // If not found, we might want to return nothing for that slot or a fallback.
                // Let's stick to returning what we found, maybe the carousel handles missing slides?
                // Or better: Fallback to any content of that type if strictly no themed content found?
                // Let's strictly follow "aus diesem spezifischen Theme". If null, so be it.
            }

            if (doc) {
                results.push(doc);
            }
        }

        // If we didn't find enough items (e.g. DB empty or theme has no items), 
        // we might want to return what we have or sample randoms if none found?
        // User requirement: "startseite: Zeige die 3 Texte"
        // Ideally we seed the DB.

        return NextResponse.json(results);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch daily reads' },
            { status: 500 }
        );
    }
}
