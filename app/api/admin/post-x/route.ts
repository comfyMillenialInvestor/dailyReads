import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

/**
 * POST /api/admin/post-x
 *
 * Publishes a tweet using Twitter OAuth 1.0a (consumer key/secret +
 * user access token & secret). All four values must be present in the
 * environment:
 *   - X_CONSUMER_KEY
 *   - X_CONSUMER_KEY_SECRET
 *   - X_ACCESS_TOKEN
 *   - X_ACCESS_TOKEN_SECRET
 */
export async function POST(req: Request) {
  try {
    const { post } = await req.json();
    if (!post || typeof post !== 'string') {
      return NextResponse.json({ error: 'Invalid post payload' }, { status: 400 });
    }

    const {
      X_CONSUMER_KEY,
      X_CONSUMER_KEY_SECRET,
      X_ACCESS_TOKEN,
      X_ACCESS_TOKEN_SECRET,
    } = process.env;

    if (!X_CONSUMER_KEY || !X_CONSUMER_KEY_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
      return NextResponse.json(
        { error: 'Missing Twitter OAuth1 credentials in env' },
        { status: 500 },
      );
    }

    const client = new TwitterApi({
      appKey: X_CONSUMER_KEY,
      appSecret: X_CONSUMER_KEY_SECRET,
      accessToken: X_ACCESS_TOKEN,
      accessSecret: X_ACCESS_TOKEN_SECRET,
    });

    const rwClient = client.readWrite;
    await rwClient.v2.tweet(post);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('X posting failed:', error);
    // Surface Twitter API error details
    const detail = error?.data?.detail || error?.data?.title || error?.message || 'Unknown error';
    const code = error?.code || error?.data?.status || 500;
    console.error('X API detail:', JSON.stringify(error?.data || {}));
    return NextResponse.json({ error: `Failed to post to X: ${detail}` }, { status: code });
  }
}
