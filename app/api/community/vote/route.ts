import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content from '@/lib/models/Content';
import Vote from '@/lib/models/Vote';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const session = await auth();
        let body: any = {};
        try {
            body = await request.json();
        } catch {
            body = {};
        }
        const { contentId, direction } = body;

        if (!contentId || typeof direction !== 'number' || ![-1, 0, 1].includes(direction)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const content = await Content.findById(contentId);
        if (!content) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }

        // Determine voter identifier
        let voterId = '';
        let newCookieValue: string | null = null;

        if (session?.user?.id) {
            voterId = `usr_${session.user.id}`;
        } else {
            const existingCookie = request.cookies.get('dr_voter_id')?.value;
            if (existingCookie && existingCookie.startsWith('anon_')) {
                voterId = existingCookie;
            } else {
                const randomId = crypto.randomUUID();
                voterId = `anon_${randomId}`;
                newCookieValue = voterId;
            }
        }

        const existingVote = await Vote.findOne({ contentId, voterId });
        let userVote: number = 0;

        if (direction === 0) {
            // Remove vote
            if (existingVote) {
                if (existingVote.direction === 1) {
                    await Content.findByIdAndUpdate(contentId, { $inc: { upvotes: -1, score: -1 } });
                } else if (existingVote.direction === -1) {
                    await Content.findByIdAndUpdate(contentId, { $inc: { downvotes: -1, score: 1 } });
                }
                await Vote.deleteOne({ _id: existingVote._id });
            }
            userVote = 0;
        } else if (direction === 1) {
            // Upvote
            if (!existingVote) {
                await Vote.create({
                    contentId,
                    voterId,
                    userId: session?.user?.id || undefined,
                    direction: 1,
                });
                await Content.findByIdAndUpdate(contentId, { $inc: { upvotes: 1, score: 1 } });
                userVote = 1;
            } else if (existingVote.direction === 1) {
                // Toggle off
                await Vote.deleteOne({ _id: existingVote._id });
                await Content.findByIdAndUpdate(contentId, { $inc: { upvotes: -1, score: -1 } });
                userVote = 0;
            } else if (existingVote.direction === -1) {
                // Switch from downvote to upvote
                existingVote.direction = 1;
                await existingVote.save();
                await Content.findByIdAndUpdate(contentId, { $inc: { downvotes: -1, upvotes: 1, score: 2 } });
                userVote = 1;
            }
        } else if (direction === -1) {
            // Downvote
            if (!existingVote) {
                await Vote.create({
                    contentId,
                    voterId,
                    userId: session?.user?.id || undefined,
                    direction: -1,
                });
                await Content.findByIdAndUpdate(contentId, { $inc: { downvotes: 1, score: -1 } });
                userVote = -1;
            } else if (existingVote.direction === -1) {
                // Toggle off
                await Vote.deleteOne({ _id: existingVote._id });
                await Content.findByIdAndUpdate(contentId, { $inc: { downvotes: -1, score: 1 } });
                userVote = 0;
            } else if (existingVote.direction === 1) {
                // Switch from upvote to downvote
                existingVote.direction = -1;
                await existingVote.save();
                await Content.findByIdAndUpdate(contentId, { $inc: { upvotes: -1, downvotes: 1, score: -2 } });
                userVote = -1;
            }
        }

        const updatedContent = await Content.findById(contentId).select('score upvotes downvotes');

        const response = NextResponse.json({
            success: true,
            score: updatedContent?.score ?? 0,
            upvotes: updatedContent?.upvotes ?? 0,
            downvotes: updatedContent?.downvotes ?? 0,
            userVote,
        });

        if (newCookieValue) {
            response.cookies.set('dr_voter_id', newCookieValue, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 365 * 24 * 60 * 60,
                path: '/',
            });
        }

        return response;
    } catch (error) {
        console.error('Error recording vote:', error);
        return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
    }
}
