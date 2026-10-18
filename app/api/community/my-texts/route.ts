import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content from '@/lib/models/Content';
import Vote from '@/lib/models/Vote';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const texts = await Content.find({
            userId: session.user.id,
            $or: [{ isCommunity: true }, { theme: 'community' }],
        }).sort({ createdAt: -1 });

        return NextResponse.json(texts);
    } catch (error) {
        console.error('Error fetching author texts:', error);
        return NextResponse.json({ error: 'Failed to fetch texts' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing text id' }, { status: 400 });
        }

        await dbConnect();
        const text = await Content.findOne({ _id: id, userId: session.user.id });

        if (!text) {
            return NextResponse.json(
                { error: 'Text nicht gefunden oder keine Berechtigung zum Löschen.' },
                { status: 404 }
            );
        }

        // Delete text and any related votes
        await Content.deleteOne({ _id: text._id });
        await Vote.deleteMany({ contentId: text._id });

        return NextResponse.json({ success: true, message: 'Text wurde erfolgreich gelöscht.' });
    } catch (error) {
        console.error('Error deleting text:', error);
        return NextResponse.json({ error: 'Failed to delete text' }, { status: 500 });
    }
}
