import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import XSuggestion from '@/lib/models/XSuggestion';
import { generateSuggestion, generateDailyBatch } from '@/lib/x-voice/suggestion-engine';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const filter: any = {};
        if (status) {
            filter.status = status;
        }

        const suggestions = await XSuggestion.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            suggestions,
        });
    } catch (error: any) {
        console.error('Error in GET /api/admin/x-voice/suggestions:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch suggestions' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            type = 'post',
            slot = 'manual',
            targetTweetInput,
            customContext,
            readingStreak,
            isBatch = false,
        } = body;

        if (isBatch) {
            const batch = await generateDailyBatch(slot as 'morning' | 'evening', readingStreak);
            return NextResponse.json({
                success: true,
                suggestions: batch,
            });
        }

        const suggestion = await generateSuggestion({
            type,
            slot,
            targetTweetInput,
            customContext,
            readingStreak,
        });

        return NextResponse.json({
            success: true,
            suggestion,
        });
    } catch (error: any) {
        console.error('Error in POST /api/admin/x-voice/suggestions:', error);
        return NextResponse.json({ error: error?.message || 'Failed to generate suggestion' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { id, status, finalText, suggestedText, rejectionReason } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing suggestion ID' }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (finalText !== undefined) updateData.finalText = finalText;
        if (suggestedText !== undefined) updateData.suggestedText = suggestedText;
        if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

        const updated = await XSuggestion.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({
            success: true,
            suggestion: updated,
        });
    } catch (error: any) {
        console.error('Error in PATCH /api/admin/x-voice/suggestions:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update suggestion' }, { status: 500 });
    }
}
