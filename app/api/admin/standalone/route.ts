import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content, { IContent } from '@/lib/models/Content';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const requestedType = searchParams.get('type') || 'all'; // 'quote' | 'poem' | 'all'
        const requestedTheme = searchParams.get('theme') || '';

        const filter: any = {};

        if (requestedType === 'poem') {
            filter.type = 'poem';
        } else if (requestedType === 'quote') {
            filter.type = { $in: ['idea', 'quote'] };
        } else {
            filter.type = { $in: ['poem', 'idea', 'quote'] };
        }

        if (requestedTheme && requestedTheme !== 'all') {
            filter.theme = requestedTheme;
        }

        // Aggregate random sample from MongoDB
        const randomDocs = await Content.aggregate([
            { $match: filter },
            { $sample: { size: 1 } }
        ]);

        if (!randomDocs || randomDocs.length === 0) {
            return NextResponse.json({ error: 'No items found matching criteria' }, { status: 404 });
        }

        const doc: IContent = randomDocs[0];

        // Format post for X
        let cleanText = doc.content || '';
        // If markdown quote format "> \"text\"\n\n— **Author**", extract the quote
        const quoteMatch = cleanText.match(/^>\s*"([^"]+)"/);
        const extractedQuote = quoteMatch ? quoteMatch[1] : cleanText.replace(/^[>#*\s]+/, '').trim();

        let suggestedTweet = '';
        let isThread = false;
        let threadTweets: string[] = [];

        if (doc.type === 'poem') {
            // Check length of poem
            const poemLines = cleanText.split('\n').filter(l => l.trim().length > 0);
            if (poemLines.length <= 6 && cleanText.length < 220) {
                suggestedTweet = `${cleanText}\n\n— ${doc.author}, "${doc.title}"`;
            } else {
                // Short excerpt for tweet, or thread
                const excerpt = poemLines.slice(0, 4).join('\n');
                suggestedTweet = `"${excerpt}"\n\n— ${doc.author}, from "${doc.title}"`;
                
                // If it's a great classic poem, we can also offer a 2-part thread
                if (poemLines.length > 4) {
                    const part1 = `"${poemLines.slice(0, 4).join('\n')}"\n\n— ${doc.author}, "${doc.title}" (1/2)`;
                    const part2 = `${poemLines.slice(4, 10).join('\n')}\n\nRead more at dailyreads.io (2/2)`;
                    threadTweets = [part1, part2];
                }
            }
        } else {
            // Quote or Idea
            if (extractedQuote.length <= 220) {
                suggestedTweet = `"${extractedQuote}"\n\n— ${doc.author}${doc.source ? ` (${doc.source})` : ''}`;
            } else {
                suggestedTweet = `"${extractedQuote.slice(0, 210)}..."\n\n— ${doc.author}`;
            }
        }

        // Add soft tagline / link if room
        if (suggestedTweet.length <= 230) {
            suggestedTweet += `\n\nCurated pause → dailyreads.io`;
        }

        return NextResponse.json({
            item: {
                id: doc._id?.toString(),
                type: doc.type,
                theme: doc.theme,
                title: doc.title,
                author: doc.author,
                source: doc.source || '',
                content: doc.content,
                content_en: doc.content_en || doc.content,
                content_de: doc.content_de || doc.content,
                title_en: doc.title_en || doc.title,
                title_de: doc.title_de || doc.title
            },
            suggestedTweet,
            threadTweets: threadTweets.length > 0 ? threadTweets : undefined,
            charCount: suggestedTweet.length
        });
    } catch (error: any) {
        console.error('Error in /api/admin/standalone:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch standalone item' }, { status: 500 });
    }
}
