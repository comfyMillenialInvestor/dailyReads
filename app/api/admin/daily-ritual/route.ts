import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyRitual from '@/lib/models/DailyRitual';
import Content from '@/lib/models/Content';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const dayParam = searchParams.get('day');

        if (dayParam) {
            const ritual = await DailyRitual.findOne({ dayNumber: parseInt(dayParam, 10) }).populate('contentIds');
            return NextResponse.json({ ritual });
        }

        // Return latest 10 rituals
        const rituals = await DailyRitual.find().sort({ dayNumber: -1 }).limit(10).populate('contentIds');
        return NextResponse.json({ rituals });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch rituals' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const {
            dayNumber,
            date,
            contentIds,
            note,
            mood,
            publishedToX,
            xPostText,
            selectedVariant
        } = body;

        if (!dayNumber || !Array.isArray(contentIds) || contentIds.length === 0) {
            return NextResponse.json({ error: 'Missing dayNumber or contentIds' }, { status: 400 });
        }

        // Normalize date to midnight in Europe/Berlin
        let targetDate: Date;
        if (date) {
            targetDate = new Date(date);
        } else {
            const now = new Date();
            targetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
            targetDate.setHours(0, 0, 0, 0);
        }

        // Upsert by dayNumber
        const ritual = await DailyRitual.findOneAndUpdate(
            { dayNumber: Number(dayNumber) },
            {
                $set: {
                    dayNumber: Number(dayNumber),
                    date: targetDate,
                    contentIds,
                    note: note || '',
                    mood: mood || '',
                    ...(publishedToX !== undefined && { publishedToX }),
                    ...(xPostText !== undefined && { xPostText }),
                    ...(selectedVariant !== undefined && { selectedVariant }),
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).populate('contentIds');

        // Also set scheduledDate on these contents for legacy sync
        await Content.updateMany(
            { _id: { $in: contentIds } },
            { $set: { scheduledDate: targetDate } }
        );

        return NextResponse.json({
            success: true,
            message: `Day ${dayNumber} ritual saved & live on /today and /day/${dayNumber}!`,
            ritual
        });
    } catch (error: any) {
        console.error('Error saving daily ritual:', error);
        return NextResponse.json({ error: error?.message || 'Failed to save daily ritual' }, { status: 500 });
    }
}
