import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import XPostTracked from '@/lib/models/XPostTracked';
import { syncUserTimeline, getAuthenticatedUser } from '@/lib/x-voice/x-client';

export async function GET() {
    try {
        await dbConnect();
        const totalCount = await XPostTracked.countDocuments();
        const originalCount = await XPostTracked.countDocuments({ type: 'original' });
        const repliesCount = await XPostTracked.countDocuments({ type: 'reply' });
        const latestPost = await XPostTracked.findOne().sort({ createdAt: -1 }).lean();

        let userInfo = null;
        try {
            userInfo = await getAuthenticatedUser();
        } catch (e: any) {
            console.warn('Could not fetch X user info:', e?.message);
        }

        return NextResponse.json({
            success: true,
            stats: {
                totalCount,
                originalCount,
                repliesCount,
                lastSyncAt: latestPost?.createdAt || null,
            },
            user: userInfo,
        });
    } catch (error: any) {
        console.error('Error in GET /api/admin/x-voice/sync:', error);
        return NextResponse.json({ error: error?.message || 'Failed to get sync stats' }, { status: 500 });
    }
}

export async function POST() {
    try {
        const result = await syncUserTimeline(100);
        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error: any) {
        console.error('Error in POST /api/admin/x-voice/sync:', error);
        return NextResponse.json({ error: error?.message || 'Failed to sync timeline from X' }, { status: 500 });
    }
}
