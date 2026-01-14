'use client';

import { useState } from 'react';
import { DailyReadsCarousel } from '@/components/DailyReadsCarousel';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleThemeSelect = (theme: string | null) => {
    setCurrentTheme(theme);
    // Explicit theme selection doesn't necessarily mean "random refresh" 
    // but the carousel will refetch because 'theme' prop changed.
  };

  const handleRandomRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    // If we want FULL random regardless of theme, we might want to clear theme?
    // Requirement: "bei Klick fetcht er 3 neue random Texte (eins pro Type) aus der DB und updated das Carousel"
    // Usually "random" implies no specific theme filter, or random WITHIN theme?
    // "Möglichkeit, explizit Texte aus einem Themengebiet zu erhalten... Auswahl fetcht 3 Texte... aus diesem spezifischen Theme"
    // "Zusätzlich: Ein Button “Get 3 Random Texts”"
    // This implies the Random button clears the theme.
    // setCurrentTheme(null); // Optional: clear theme if Random clicked.
    // However, if I am in "Philosophy" and click "Get 3 Random", maybe I want 3 random philosophy texts?
    // Let's assume "Get 3 Random Texts" means "Surprise me" (Global Random).
    // So I will clear theme.
    setCurrentTheme(null);
  };

  return (
    <div className="flex flex-col items-center space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto mt-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
          Your Daily Dose of Wisdom
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover a short story, a poem, and an essay every day.
          Curated content to expand your mind in minutes.
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

        <div className="text-center mt-12 p-6 bg-muted/30 rounded-xl border border-border/50">
          <h3 className="font-bold mb-2">Build a Habit</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bookmark this page and come back daily for new perspectives.
          </p>
          <p className="text-xs text-muted-foreground">
            (Press Ctrl+D to bookmark)
          </p>
        </div>
      </div>
    </div>
  );
}
