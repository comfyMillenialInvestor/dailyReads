import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Completion from '@/lib/models/Completion';

/**
 * DELETE /api/user/delete
 * GDPR Art. 17 - Right to Erasure ("Right to be Forgotten")
 * Deletes the user account and all associated data
 */
export async function DELETE() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const userId = session.user.id;

        // Delete all completions for this user
        const completionResult = await Completion.deleteMany({ userId });
        console.log(`Deleted ${completionResult.deletedCount} completions for user ${userId}`);

        // Delete the user account
        const userResult = await User.findByIdAndDelete(userId);

        if (!userResult) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`Successfully deleted user account: ${session.user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Account and all associated data have been permanently deleted',
            deletedCompletions: completionResult.deletedCount
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
