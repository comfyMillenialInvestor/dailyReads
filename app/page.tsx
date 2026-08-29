'use client';

import { useState } from 'react';
import { DailyReadsCarousel } from '@/components/DailyReadsCarousel';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Button } from '@/components/ui/button';
import { Sparkles, Twitter } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Home() {
  const { data: session } = useSession();
  const isPaid = (session?.user as any)?.isPaid || false;
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useLanguage();

  const handleThemeSelect = (theme: string | null) => {
    setCurrentTheme(theme);
  };

  const handleRandomRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setCurrentTheme(null);
  };

  return (
    <div className="flex flex-col items-center space-y-8 md:space-y-10">
      <div className="text-center space-y-3 md:space-y-4 max-w-2xl mx-auto mt-4 px-2">
        <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">
          {t('home.hero.title')}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg italic">
          {t('home.hero.subtitle')}
        </p>
      </div>

      <DailyReadsCarousel
        theme={currentTheme}
        refreshKey={refreshKey}
        onRefreshRandom={handleRandomRefresh}
      />

      <div className="w-full max-w-4xl mx-auto space-y-6 px-2">
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={handleRandomRefresh}
            className="group"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t('home.getRandomTexts')}
          </Button>
          <p className="text-sm text-muted-foreground">{t('home.chooseTopicBelow')}</p>
        </div>

        <ThemeSelector
          currentTheme={currentTheme}
          onSelectTheme={handleThemeSelect}
        />

        <div className="text-center mt-12 p-6 md:p-8 bg-muted/30 rounded-2xl border border-border/50 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-base md:text-lg uppercase tracking-widest text-primary/80">{t('home.buildHabit')}</h3>
            <p className="text-muted-foreground italic font-serif text-sm md:text-base">
              {t('home.bookmarkHint')}
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
                {t('home.followX')}
              </a>

              {!isPaid && (
                <>
                  <span className="hidden md:block opacity-30">|</span>
                  <Link href="/portal/subscribe" className="hover:text-primary transition-colors flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4 text-primary/60" />
                    {t('home.ritualMembership')}
                  </Link>
                </>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              {t('home.bookmarkShortcut')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
