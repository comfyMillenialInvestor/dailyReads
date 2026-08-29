'use client';

import { BookOpen, PenTool, Quote, Library, Heart, Sparkles, Linkedin, Twitter } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Ueber() {
    const { t } = useLanguage();

    return (
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16 py-8 px-2">
            {/* Hero Section */}
            <section className="text-center space-y-6">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-muted/50 rounded-full border border-border/50">
                        <Library className="h-8 w-8 text-primary/80" />
                    </div>
                </div>
                <h1 className="text-3xl md:text-6xl font-serif font-bold tracking-tight">
                    {t('about.hero.title')}
                </h1>
                <p className="text-lg md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                    {t('about.hero.subtitle')}
                </p>
            </section>

            {/* Concept Grid */}
            <section className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="group p-6 md:p-8 bg-muted/30 rounded-2xl border border-border/50 transition-all hover:bg-muted/50 hover:-translate-y-1">
                    <PenTool className="h-6 w-6 mb-4 text-primary/60 group-hover:text-primary transition-colors" />
                    <h3 className="text-lg md:text-xl font-bold mb-3">{t('about.shortStory.title')}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {t('about.shortStory.desc')}
                    </p>
                </div>
                <div className="group p-6 md:p-8 bg-muted/30 rounded-2xl border border-border/50 transition-all hover:bg-muted/50 hover:-translate-y-1">
                    <Quote className="h-6 w-6 mb-4 text-primary/60 group-hover:text-primary transition-colors" />
                    <h3 className="text-lg md:text-xl font-bold mb-3">{t('about.poetry.title')}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {t('about.poetry.desc')}
                    </p>
                </div>
                <div className="group p-6 md:p-8 bg-muted/30 rounded-2xl border border-border/50 transition-all hover:bg-muted/50 hover:-translate-y-1">
                    <BookOpen className="h-6 w-6 mb-4 text-primary/60 group-hover:text-primary transition-colors" />
                    <h3 className="text-lg md:text-xl font-bold mb-3">{t('about.essay.title')}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {t('about.essay.desc')}
                    </p>
                </div>
            </section>

            {/* Sources & Philosophy */}
            <section className="bg-primary/5 rounded-3xl p-6 md:p-12 border border-primary/10">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary uppercase tracking-wider">
                            <Sparkles className="h-3 w-3" />
                            <span>{t('about.collection')}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold">{t('about.collection.title')}</h2>
                        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
                            <p dangerouslySetInnerHTML={{ __html: t('about.collection.p1') }} />
                            <p className="text-xs md:text-sm italic border-l-2 border-primary/20 pl-4" dangerouslySetInnerHTML={{ __html: t('about.collection.note') }} />
                            <p dangerouslySetInnerHTML={{ __html: t('about.collection.p2') }} />
                        </div>

                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative p-6 md:p-8 bg-card rounded-2xl border border-border/50 shadow-sm italic text-base md:text-lg leading-relaxed text-center">
                            {t('about.collection.quote')}
                            <div className="mt-4 not-italic font-bold text-sm text-primary/60">{t('about.collection.quoteAuthor')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission / Who We Are */}
            <section className="max-w-2xl mx-auto text-center space-y-6">
                <div className="inline-block p-2 bg-muted/50 rounded-full border border-border/50 mb-2">
                    <Heart className="h-5 w-5 text-destructive/70" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">{t('about.passion.title')}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {t('about.passion.desc')}
                </p>
                <div className="pt-8 flex flex-col items-center space-y-6">
                    <div className="h-px w-24 bg-border/50" />
                    <div className="flex items-center gap-4">
                        <a href="https://linkedin.com/company/dailyreads" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted/50 rounded-full border border-border/50 hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                            <Linkedin className="h-5 w-5" />
                        </a>
                        <a href="https://x.com/dailyreads" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted/50 rounded-full border border-border/50 hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                            <Twitter className="h-5 w-5" />
                        </a>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium tracking-tight uppercase">{t('about.builtFor')}</p>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{t('about.est')}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
