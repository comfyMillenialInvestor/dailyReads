import { NextResponse } from 'next/server';
import { fetchHomeTimelineFeed, searchRelevantTweets } from '@/lib/x-voice/x-client';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const source = searchParams.get('source') || 'home';
        const query = searchParams.get('query') || undefined;

        let tweets = [];
        if (source === 'search') {
            tweets = await searchRelevantTweets(query, 15);
        } else {
            tweets = await fetchHomeTimelineFeed(15);
        }

        return NextResponse.json({
            success: true,
            source,
            count: tweets.length,
            tweets,
        });
    } catch (error: any) {
        console.error('Error in GET /api/admin/x-voice/feed:', error);
        return NextResponse.json(
            { error: error?.data?.detail || error?.message || 'Failed to fetch feed tweets' },
            { status: 500 }
        );
    }
}
