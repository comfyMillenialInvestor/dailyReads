import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(req: Request) {
    try {
        const { post } = await req.json();

        if (!process.env.X_API_KEY || !process.env.X_API_SECRET || !process.env.X_ACCESS_TOKEN || !process.env.X_ACCESS_SECRET) {
            return NextResponse.json({ error: 'X API credentials missing' }, { status: 500 });
        }

        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: process.env.X_ACCESS_TOKEN,
            accessSecret: process.env.X_ACCESS_SECRET,
        });

        const rwClient = client.readWrite;
        await rwClient.v2.tweet(post);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('X posting failed:', error);
        return NextResponse.json({ error: 'Failed to post to X' }, { status: 500 });
    }
}
