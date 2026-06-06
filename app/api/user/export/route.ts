import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Completion from '@/lib/models/Completion';

/**
 * GET /api/user/export
 * GDPR Art. 20 - Right to Data Portability
 * Returns all user data in a machine-readable JSON format
 */
export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const userId = session.user.id;

        // Fetch user data (excluding password hash)
        const user = await User.findById(userId).select('-password').lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch all completions
        const completions = await Completion.find({ userId }).lean();

        // Prepare export data
        const exportData = {
            exportedAt: new Date().toISOString(),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                isPaid: user.isPaid,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                lastCompletionDate: user.lastCompletionDate,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            completions: completions.map(c => ({
                id: c._id,
                date: c.date,
                pauseNumber: c.pauseNumber,
                contentIds: c.contentIds,
                createdAt: c.createdAt,
            })),
            statistics: {
                totalCompletions: completions.length,
                memberSince: user.createdAt,
            }
        };

        // Return as downloadable JSON
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="daily-reads-export-${new Date().toISOString().split('T')[0]}.json"`,
            },
        });

    } catch (error) {
        console.error('Data export error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
