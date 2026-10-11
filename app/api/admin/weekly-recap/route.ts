import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyRitual from '@/lib/models/DailyRitual';
import '@/lib/models/Content';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const weekParam = searchParams.get('week'); // e.g. 1, 2, 5, 6
        const endDayParam = searchParams.get('endDay'); // e.g. 42

        let rituals: any[] = [];
        let weekNumber = 1;
        let startDay = 1;
        let endDay = 7;

        if (endDayParam) {
            endDay = parseInt(endDayParam, 10);
            startDay = Math.max(1, endDay - 6);
            weekNumber = Math.ceil(endDay / 7);
            rituals = await DailyRitual.find({
                dayNumber: { $gte: startDay, $lte: endDay }
            }).sort({ dayNumber: 1 }).populate('contentIds');
        } else if (weekParam) {
            weekNumber = parseInt(weekParam, 10);
            startDay = (weekNumber - 1) * 7 + 1;
            endDay = weekNumber * 7;
            rituals = await DailyRitual.find({
                dayNumber: { $gte: startDay, $lte: endDay }
            }).sort({ dayNumber: 1 }).populate('contentIds');
        } else {
            // Default to the latest recorded rituals up to 7
            rituals = await DailyRitual.find()
                .sort({ dayNumber: -1 })
                .limit(7)
                .populate('contentIds');
            rituals.reverse();
            if (rituals.length > 0) {
                endDay = rituals[rituals.length - 1].dayNumber;
                startDay = rituals[0].dayNumber;
                weekNumber = Math.ceil(endDay / 7);
            }
        }

        // Collect authors and notable titles from the week
        const authors = new Set<string>();
        const stories: string[] = [];
        const poems: string[] = [];
        const ideas: string[] = [];

        rituals.forEach(r => {
            if (Array.isArray(r.contentIds)) {
                r.contentIds.forEach((c: any) => {
                    if (c && c.author) authors.add(c.author);
                    if (c && c.type === 'short_story') stories.push(`"${c.title}" (${c.author})`);
                    if (c && c.type === 'poem') poems.push(`"${c.title}" (${c.author})`);
                    if (c && c.type === 'idea') ideas.push(c.author);
                });
            }
        });

        const authorList = Array.from(authors).slice(0, 4).join(', ');

        // Format single tweet recap
        const singleRecap = `Bradbury Method — Week ${weekNumber} Recap (Days ${startDay}–${endDay}) 📚\n\n` +
            `7 stories. 7 poems. 7 ideas.\n` +
            `Notable voices this week: ${authorList || 'Plato, Poe, Dickinson, Frost'}.\n\n` +
            `Building the habit one pause at a time → dailyreads.io`;

        // Format a 2-3 tweet thread
        const thread1 = `Week ${weekNumber} complete on the Bradbury 70-day challenge (Days ${startDay}–${endDay}).\n\n` +
            `21 pieces explored: 7 short stories, 7 poems, 7 essays & ideas.\n\n` +
            `The power of a midday pause is consistency, not bingeing. Here is what stayed with me (1/2) 🧵`;

        const thread2 = `Highlights from the week:\n` +
            `• Poems: ${poems.slice(0, 2).join(', ') || 'Frost, Dickinson'}\n` +
            `• Stories: ${stories.slice(0, 2).join(', ') || 'Classic short stories'}\n\n` +
            `All daily logs & today's reading live at dailyreads.io (2/2)`;

        return NextResponse.json({
            weekNumber,
            startDay,
            endDay,
            daysCount: rituals.length,
            singleRecap,
            thread: [thread1, thread2],
            ritualsSummary: rituals.map(r => ({
                dayNumber: r.dayNumber,
                items: (r.contentIds || []).map((c: any) => ({
                    title: c.title,
                    author: c.author,
                    type: c.type
                }))
            }))
        });
    } catch (error: any) {
        console.error('Error in /api/admin/weekly-recap:', error);
        return NextResponse.json({ error: error?.message || 'Failed to generate weekly recap' }, { status: 500 });
    }
}
