import { Metadata } from 'next';
import { TodayView } from '@/components/TodayView';

interface DayPageProps {
    params: Promise<{ dayNumber: string }>;
}

export async function generateMetadata({ params }: DayPageProps): Promise<Metadata> {
    const { dayNumber } = await params;
    return {
        title: `Day ${dayNumber} — Daily Reads Bradbury Ritual`,
        description: `Read the three pieces from Day ${dayNumber} of the Bradbury Challenge: 1 poem, 1 essay/idea, 1 short story.`,
        openGraph: {
            title: `Day ${dayNumber} — Bradbury Reading Ritual`,
            description: `1 poem • 1 essay or idea • 1 short story. Read Day ${dayNumber} on DailyReads.`,
            url: `https://dailyreads.io/day/${dayNumber}`,
            siteName: 'DailyReads',
        },
        twitter: {
            card: 'summary_large_image',
            title: `Day ${dayNumber} — Bradbury Reading Ritual`,
            description: `1 poem • 1 essay or idea • 1 short story. Read Day ${dayNumber} on DailyReads.`,
            creator: '@dailyReads_io',
        }
    };
}

export default async function DayPage({ params }: DayPageProps) {
    const { dayNumber } = await params;
    const parsedDay = parseInt(dayNumber, 10);
    return <TodayView dayNumber={isNaN(parsedDay) ? undefined : parsedDay} />;
}
