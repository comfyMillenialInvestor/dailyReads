import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

/**
 * GET /api/admin/twitter/auth
 *
 * Initiates the OAuth 1.0a flow for posting on X.
 * It creates a request token and redirects the user to Twitter's
 * authentication page. The callback URL must be configured in the
 * Twitter developer portal and match `process.env.TWITTER_CALLBACK_URL`.
 */
export async function GET() {
  const { X_API_KEY, X_API_SECRET, TWITTER_CALLBACK_URL } = process.env;
  if (!X_API_KEY || !X_API_SECRET || !TWITTER_CALLBACK_URL) {
    return NextResponse.json({ error: 'Missing Twitter OAuth credentials or callback URL' }, { status: 500 });
  }

  const client = new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
  });

  try {
    const { oauth_token, oauth_token_secret, url } = await client.generateAuthLink(TWITTER_CALLBACK_URL);
    // Store the temporary secret in a cookie (encrypted) for the callback step
    const response = NextResponse.redirect(url);
    response.cookies.set('twitter_oauth_secret', oauth_token_secret, { httpOnly: true, sameSite: 'lax', path: '/' });
    // Also set the request token so we can verify it later (optional)
    response.cookies.set('twitter_oauth_token', oauth_token, { httpOnly: true, sameSite: 'lax', path: '/' });
    return response;
  } catch (error: any) {
    console.error('Twitter auth initiation failed:', error);
    return NextResponse.json({ error: 'Failed to start Twitter OAuth' }, { status: 500 });
  }
}
