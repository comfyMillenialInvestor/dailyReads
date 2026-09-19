import { TwitterApi } from 'twitter-api-v2';
import dbConnect from '@/lib/db';
import XPostTracked from '@/lib/models/XPostTracked';

export function getTwitterClient() {
    const {
        X_CONSUMER_KEY,
        X_CONSUMER_KEY_SECRET,
        X_ACCESS_TOKEN,
        X_ACCESS_TOKEN_SECRET,
    } = process.env;

    if (!X_CONSUMER_KEY || !X_CONSUMER_KEY_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
        throw new Error('Missing Twitter OAuth1 credentials in environment (X_CONSUMER_KEY, X_CONSUMER_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET)');
    }

    return new TwitterApi({
        appKey: X_CONSUMER_KEY,
        appSecret: X_CONSUMER_KEY_SECRET,
        accessToken: X_ACCESS_TOKEN,
        accessSecret: X_ACCESS_TOKEN_SECRET,
    });
}

/**
 * Retrieves the authenticated user on X
 */
export async function getAuthenticatedUser() {
    const client = getTwitterClient();
    const me = await client.v2.me();
    return me.data;
}

/**
 * Helper to extract tweet ID from an X URL or a raw ID string
 */
export function extractTweetId(input: string): string | null {
    const trimmed = input.trim();
    // Matches https://x.com/username/status/1234567890 or https://twitter.com/...
    const urlMatch = trimmed.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/i);
    if (urlMatch) {
        return urlMatch[1];
    }
    // Pure digit string
    if (/^\d+$/.test(trimmed)) {
        return trimmed;
    }
    return null;
}

/**
 * Fetches a single tweet by ID or URL to provide target context for a reply
 */
export async function fetchTweetContext(tweetIdOrUrl: string) {
    const tweetId = extractTweetId(tweetIdOrUrl);
    if (!tweetId) {
        throw new Error('Invalid tweet ID or URL');
    }

    const client = getTwitterClient();
    const res = await client.v2.singleTweet(tweetId, {
        'tweet.fields': ['created_at', 'author_id', 'conversation_id', 'text'],
        expansions: ['author_id'],
        'user.fields': ['name', 'username'],
    });

    const tweetData = res.data;
    if (!tweetData) {
        throw new Error(`Could not find tweet with ID: ${tweetId}`);
    }

    const author = res.includes?.users?.find((u) => u.id === tweetData.author_id);

    return {
        id: tweetData.id,
        text: tweetData.text,
        createdAt: tweetData.created_at,
        conversationId: tweetData.conversation_id,
        author: author ? `@${author.username} (${author.name})` : 'Unknown Author',
        authorUsername: author?.username || '',
        url: `https://x.com/i/status/${tweetData.id}`,
    };
}

/**
 * Synchronizes the authenticated user's published tweets & replies from X into MongoDB.
 * Excludes retweets so that only the user's actual writing is preserved.
 * Distinguishes between standalone original posts and replies.
 */
export async function syncUserTimeline(maxResults = 100) {
    await dbConnect();
    const client = getTwitterClient();
    const me = await client.v2.me();
    const userId = me.data.id;

    // Fetch user timeline
    const timeline = await client.v2.userTimeline(userId, {
        max_results: Math.min(Math.max(maxResults, 5), 100),
        exclude: ['retweets'],
        'tweet.fields': ['created_at', 'conversation_id', 'in_reply_to_user_id', 'referenced_tweets'],
    });

    const tweets = timeline.data?.data || [];
    let syncedCount = 0;
    let originalCount = 0;
    let repliesCount = 0;

    for (const t of tweets) {
        const isReply = Boolean(
            t.in_reply_to_user_id ||
            t.referenced_tweets?.some((r) => r.type === 'replied_to')
        );

        const repliedToRef = t.referenced_tweets?.find((r) => r.type === 'replied_to');
        const inReplyToTweetId = repliedToRef ? repliedToRef.id : undefined;

        const type: 'original' | 'reply' = isReply ? 'reply' : 'original';
        if (isReply) {
            repliesCount++;
        } else {
            originalCount++;
        }

        await XPostTracked.findOneAndUpdate(
            { tweetId: t.id },
            {
                $setOnInsert: {
                    tweetId: t.id,
                    text: t.text,
                    type,
                    inReplyToUserId: t.in_reply_to_user_id,
                    inReplyToTweetId,
                    conversationId: t.conversation_id,
                    source: 'synced_from_x',
                    createdAt: t.created_at ? new Date(t.created_at) : new Date(),
                },
            },
            { upsert: true, new: true }
        );

        syncedCount++;
    }

    return {
        user: {
            id: me.data.id,
            name: me.data.name,
            username: me.data.username,
        },
        syncedCount,
        originalCount,
        repliesCount,
        totalFetched: tweets.length,
    };
}

export interface DiscoveredTweet {
    id: string;
    text: string;
    createdAt?: string;
    authorName: string;
    authorUsername: string;
    authorAvatar?: string;
    url: string;
    source: 'home' | 'search';
    metrics?: {
        retweetCount?: number;
        replyCount?: number;
        likeCount?: number;
    };
}

/**
 * Fetches recent tweets from the authenticated user's home timeline/feed
 * to find posts to comment on.
 */
export async function fetchHomeTimelineFeed(maxResults = 20): Promise<DiscoveredTweet[]> {
    const client = getTwitterClient();
    const res = await client.v2.homeTimeline({
        max_results: Math.min(Math.max(maxResults, 5), 50),
        exclude: ['retweets'],
        'tweet.fields': ['created_at', 'author_id', 'text', 'conversation_id', 'public_metrics'],
        expansions: ['author_id'],
        'user.fields': ['name', 'username', 'profile_image_url'],
    });

    const usersMap = new Map();
    res.includes?.users?.forEach((u) => usersMap.set(u.id, u));

    const tweets = (res.data?.data || []).filter((t) => !t.text.startsWith('RT @'));
    return tweets.map((t) => {
        const author = usersMap.get(t.author_id);
        return {
            id: t.id,
            text: t.text,
            createdAt: t.created_at,
            authorName: author?.name || 'User',
            authorUsername: author?.username || 'user',
            authorAvatar: author?.profile_image_url,
            url: `https://x.com/${author?.username || 'i'}/status/${t.id}`,
            source: 'home' as const,
            metrics: t.public_metrics ? {
                retweetCount: t.public_metrics.retweet_count,
                replyCount: t.public_metrics.reply_count,
                likeCount: t.public_metrics.like_count,
            } : undefined,
        };
    });
}

/**
 * Searches recent conversational tweets on literature, reading, books, or custom queries
 * to discover accounts and posts to comment on and build organic relationships.
 */
export async function searchRelevantTweets(
    customQuery?: string,
    maxResults = 20
): Promise<DiscoveredTweet[]> {
    const client = getTwitterClient();
    const cleanQuery = customQuery && customQuery.trim() ? customQuery.trim() : '';
    const query = cleanQuery
        ? `(${cleanQuery}) -is:retweet -is:reply lang:en`
        : '(reading OR "short story" OR "essay" OR "poetry" OR "currently reading" OR "favorite book") -is:retweet -is:reply lang:en';

    const res = await client.v2.search(query, {
        max_results: Math.min(Math.max(maxResults, 10), 50),
        'tweet.fields': ['created_at', 'author_id', 'text', 'conversation_id', 'public_metrics'],
        expansions: ['author_id'],
        'user.fields': ['name', 'username', 'profile_image_url'],
    });

    const usersMap = new Map();
    res.includes?.users?.forEach((u) => usersMap.set(u.id, u));

    const tweets = (res.data?.data || []).filter((t) => !t.text.startsWith('RT @'));
    return tweets.map((t) => {
        const author = usersMap.get(t.author_id);
        return {
            id: t.id,
            text: t.text,
            createdAt: t.created_at,
            authorName: author?.name || 'User',
            authorUsername: author?.username || 'user',
            authorAvatar: author?.profile_image_url,
            url: `https://x.com/${author?.username || 'i'}/status/${t.id}`,
            source: 'search' as const,
            metrics: t.public_metrics ? {
                retweetCount: t.public_metrics.retweet_count,
                replyCount: t.public_metrics.reply_count,
                likeCount: t.public_metrics.like_count,
            } : undefined,
        };
    });
}

/**
 * Publishes a tweet (standalone or reply) to X via official API
 */
export async function publishToX({
    text,
    inReplyToTweetId,
}: {
    text: string;
    inReplyToTweetId?: string;
}) {
    if (!text || typeof text !== 'string') {
        throw new Error('Tweet text cannot be empty');
    }

    const client = getTwitterClient();
    const rwClient = client.readWrite;

    let response;
    if (inReplyToTweetId) {
        response = await rwClient.v2.tweet({
            text,
            reply: {
                in_reply_to_tweet_id: inReplyToTweetId,
            },
        });
    } else {
        response = await rwClient.v2.tweet(text);
    }

    return response.data;
}
