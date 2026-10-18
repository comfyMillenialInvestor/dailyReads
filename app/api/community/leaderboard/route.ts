import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content from '@/lib/models/Content';
import Vote from '@/lib/models/Vote';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const session = await auth();
        const { searchParams } = new URL(request.url);

        const sortParam = searchParams.get('sort') || 'top';
        const typeParam = searchParams.get('type') || 'all';
        const sourceParam = searchParams.get('source') || 'all'; // 'all' | 'community' | 'classic'
        const limitParam = parseInt(searchParams.get('limit') || '50', 10);

        // Determine voterId for reading user's personal vote status
        let voterId = '';
        if (session?.user?.id) {
            voterId = `usr_${session.user.id}`;
        } else {
            const voterCookie = request.cookies.get('dr_voter_id')?.value;
            if (voterCookie) {
                voterId = voterCookie;
            }
        }

        const matchQuery: any = {
            status: { $ne: 'archived' },
        };

        if (sourceParam === 'community') {
            matchQuery.$or = [{ theme: 'community' }, { isCommunity: true }];
        } else if (sourceParam === 'classic') {
            matchQuery.isCommunity = { $ne: true };
            matchQuery.theme = { $ne: 'community' };
        }

        if (typeParam && typeParam !== 'all') {
            if (typeParam === 'quote') {
                matchQuery.type = { $in: ['quote', 'idea'] };
            } else {
                matchQuery.type = typeParam;
            }
        }

        let sortQuery: any = { score: -1, upvotes: -1, createdAt: -1 };
        if (sortParam === 'newest') {
            sortQuery = { createdAt: -1 };
        } else if (sortParam === 'upvoted') {
            sortQuery = { upvotes: -1, score: -1 };
        }

        const items = await Content.find(matchQuery)
            .sort(sortQuery)
            .limit(Math.min(limitParam, 100))
            .lean();

        // If voterId is present, fetch voter's votes for these items
        let userVotesMap: Record<string, number> = {};
        if (voterId && items.length > 0) {
            const contentIds = items.map((it: any) => it._id);
            const userVotes = await Vote.find({
                voterId,
                contentId: { $in: contentIds },
            }).lean();

            for (const v of userVotes) {
                userVotesMap[v.contentId.toString()] = v.direction;
            }
        }

        const results = items.map((item: any, index: number) => ({
            ...item,
            rank: index + 1,
            userVote: userVotesMap[item._id.toString()] || 0,
        }));

        return NextResponse.json({
            success: true,
            items: results,
            totalCount: results.length,
        });
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
