import { Metadata } from 'next';
import { TodayView } from '@/components/TodayView';

export const metadata: Metadata = {
    title: "Today's Daily Reads — Bradbury Ritual",
    description: "Read today's poem, essay, and short story. A quiet 15-minute literary ritual.",
    openGraph: {
        title: "Today's Daily Reads — Bradbury Ritual",
        description: "1 poem • 1 essay or idea • 1 short story. Join today's pause.",
        url: 'https://dailyreads.io/today',
        siteName: 'DailyReads',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Today's Daily Reads — Bradbury Ritual",
        description: "1 poem • 1 essay or idea • 1 short story. Read today's selections.",
        creator: '@dailyReads_io',
    },
};

export default function TodayPage() {
    return <TodayView />;
}
