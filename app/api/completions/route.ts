import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Completion from '@/lib/models/Completion';

export async function POST(request: NextRequest) {
    const session = await auth();
    console.log(`[API] completions POST request. Session: ${session ? session.user?.email : 'NONE'}`);

    const userId = session?.user?.id;
    const isPaid = (session?.user as any)?.isPaid || false;
    const userEmail = session?.user?.email;

    if (!userId) {
        console.warn(`[API] completions POST rejected: Unauthorized (No userId in session)`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        // We still need the user document for streak logic, but we trust the session's isPaid status
        // which includes our test@test.com override.
        if (!isPaid) {
            return NextResponse.json({ error: 'Subscription required for tracking' }, { status: 403 });
        }

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Get current date in CET (Central European Time)
        // This ensures the ritual follows the lunch break window logic
        const now = new Date();
        const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
        cetDate.setHours(0, 0, 0, 0); // Normalize to midnight for calendar comparison

        // Check if already completed today
        const existing = await Completion.findOne({ userId: user._id, date: cetDate });
        if (existing) {
            return NextResponse.json({ message: 'Already completed today', alreadyDone: true });
        }

        // Streak logic
        let newStreak = 1;
        if (user.lastCompletionDate) {
            const lastDate = new Date(user.lastCompletionDate.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
            lastDate.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(cetDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Completed yesterday, continue streak
                newStreak = user.currentStreak + 1;
            } else if (diffDays === 0) {
                // Already completed today (handled above, but for robustness)
                newStreak = user.currentStreak;
            } else {
                // Missed a day (or more), reset streak to 1
                newStreak = 1;
            }
        }

        // Save completion record
        await Completion.create({
            userId: user._id,
            date: cetDate,
        });

        // Update user stats
        user.currentStreak = newStreak;
        if (newStreak > user.longestStreak) {
            user.longestStreak = newStreak;
        }
        user.lastCompletionDate = cetDate;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'You showed up today.',
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak
        });

    } catch (error) {
        console.error('Completion Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        // Get completions for the last 30 days
        const completions = await Completion.find({ userId })
            .sort({ date: -1 })
            .limit(30);

        return NextResponse.json(completions);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
