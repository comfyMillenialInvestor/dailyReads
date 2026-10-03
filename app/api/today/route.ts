import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyRitual from '@/lib/models/DailyRitual';
import Content from '@/lib/models/Content';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        // Ensure Content model is registered for populate
        if (!Content) {
            console.warn('Content model initialized');
        }

        const searchParams = request.nextUrl.searchParams;
        const dayParam = searchParams.get('day');

        let ritual = null;

        if (dayParam) {
            const dayNum = parseInt(dayParam, 10);
            if (!isNaN(dayNum)) {
                ritual = await DailyRitual.findOne({ dayNumber: dayNum }).populate('contentIds');
            }
        }

        // If not requested by specific day or not found by day, find today's ritual in Europe/Berlin time
        if (!ritual) {
            const now = new Date();
            const startOfDay = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);

            ritual = await DailyRitual.findOne({
                date: { $gte: startOfDay, $lt: endOfDay }
            }).populate('contentIds');
        }

        // Fallback: fetch the latest available DailyRitual
        if (!ritual) {
            ritual = await DailyRitual.findOne()
                .sort({ date: -1, dayNumber: -1 })
                .populate('contentIds');
        }

        if (!ritual) {
            return NextResponse.json({
                found: false,
                message: 'No daily ritual found yet.',
                items: []
            });
        }

        // Check if previous or next days exist
        const [prevRitual, nextRitual] = await Promise.all([
            DailyRitual.findOne({ dayNumber: ritual.dayNumber - 1 }).select('dayNumber'),
            DailyRitual.findOne({ dayNumber: ritual.dayNumber + 1 }).select('dayNumber'),
        ]);

        return NextResponse.json({
            found: true,
            ritualId: ritual._id,
            dayNumber: ritual.dayNumber,
            date: ritual.date,
            note: ritual.note || '',
            mood: ritual.mood || '',
            publishedToX: ritual.publishedToX || false,
            xPostText: ritual.xPostText || '',
            items: ritual.contentIds || [],
            prevDay: prevRitual ? prevRitual.dayNumber : null,
            nextDay: nextRitual ? nextRitual.dayNumber : null,
        });
    } catch (error: any) {
        console.error('Error fetching today ritual:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch today ritual' },
            { status: 500 }
        );
    }
}
