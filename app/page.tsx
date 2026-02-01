'use client';

import { useState } from 'react';
import { DailyReadsCarousel } from '@/components/DailyReadsCarousel';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Button } from '@/components/ui/button';
import { Sparkles, Twitter } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();
  const isPaid = (session?.user as any)?.isPaid || false;
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleThemeSelect = (theme: string | null) => {
    setCurrentTheme(theme);
  };

  const handleRandomRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setCurrentTheme(null);
  };

  return (
    <div className="flex flex-col items-center space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto mt-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
          Your Daily Creative Lunch Break Ritual
        </h1>
        <p className="text-muted-foreground text-lg italic">
          A 20-minute creative pause for your lunch break.
          Best read between 12:30 and 13:00 CET.
        </p>
      </div>

      <DailyReadsCarousel
        theme={currentTheme}
        refreshKey={refreshKey}
        onRefreshRandom={handleRandomRefresh}
      />

      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={handleRandomRefresh}
            className="group"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Get 3 Random Texts
          </Button>
          <p className="text-sm text-muted-foreground">or choose a topic below</p>
        </div>

        <ThemeSelector
          currentTheme={currentTheme}
          onSelectTheme={handleThemeSelect}
        />

        <div className="text-center mt-12 p-8 bg-muted/30 rounded-2xl border border-border/50 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-lg uppercase tracking-widest text-primary/80">Build a Habit</h3>
            <p className="text-muted-foreground italic font-serif">
              Bookmark this page and come back daily for new perspectives.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <a
                href="https://x.com/dailyreads"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <Twitter className="h-4 w-4" />
                Follow us on X
              </a>

              {!isPaid && (
                <>
                  <span className="hidden md:block opacity-30">|</span>
                  <Link href="/portal/subscribe" className="hover:text-primary transition-colors flex items-center gap-2 font-medium">
                    < Sparkles className="h-4 w-4 text-primary/60" />
                    Ritual Membership for History & Streak
                  </Link>
                </>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              (Press Ctrl+D to bookmark)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
