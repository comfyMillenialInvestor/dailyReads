import { NextResponse } from 'next/server';
import { generateDailyBatch } from '@/lib/x-voice/suggestion-engine';

/**
 * Endpoint for running 2x daily automated suggestion batches.
 * Can be triggered via external cron job, Vercel cron, or internal scheduler.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const forceSlot = searchParams.get('slot');

        // Automatically determine morning vs evening based on Europe/Berlin time if not specified
        const currentHour = parseInt(
            new Intl.DateTimeFormat('en-GB', {
                hour: 'numeric',
                hourCycle: 'h23',
                timeZone: 'Europe/Berlin',
            }).format(new Date()),
            10
        );

        const slot: 'morning' | 'evening' =
            forceSlot === 'morning' || forceSlot === 'evening'
                ? forceSlot
                : currentHour < 14
                ? 'morning'
                : 'evening';

        const suggestions = await generateDailyBatch(slot);

        return NextResponse.json({
            success: true,
            slot,
            count: suggestions.length,
            suggestions,
        });
    } catch (error: any) {
        console.error('Error in cron/x-suggestions:', error);
        return NextResponse.json({ error: error?.message || 'Failed to generate daily suggestions' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    return GET(req);
}
