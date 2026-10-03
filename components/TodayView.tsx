'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Quote, Sparkles, Twitter, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { TextReaderModal } from '@/components/TextReaderModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import confetti from 'canvas-confetti';
import type { IContent } from '@/lib/models/Content';

interface TodayViewProps {
    dayNumber?: number;
}

export function TodayView({ dayNumber }: TodayViewProps) {
    const { data: session, update: updateSession } = useSession();
    const isPaid = (session?.user as any)?.isPaid || false;
    const { lang, t } = useLanguage();

    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [readerItem, setReaderItem] = React.useState<IContent | null>(null);
    const [completed, setCompleted] = React.useState(false);
    const [isCompleting, setIsCompleting] = React.useState(false);

    const fetchRitual = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = dayNumber ? `/api/today?day=${dayNumber}` : '/api/today';
            const res = await fetch(url);
            const json = await res.json();
            if (json.found === false) {
                setError(json.message || 'No ritual recorded yet for this day.');
            } else {
                setData(json);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load today reading');
        } finally {
            setLoading(false);
        }
    }, [dayNumber]);

    React.useEffect(() => {
        fetchRitual();
    }, [fetchRitual]);

    const handleComplete = async () => {
        if (!data || !data.items || completed) return;
        setIsCompleting(true);
        try {
            const contentIds = data.items.map((i: any) => i._id);
            const res = await fetch('/api/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentIds })
            });
            const resJson = await res.json();
            if (resJson.success || resJson.alreadyDone) {
                setCompleted(true);
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                await updateSession();
            }
        } catch (e) {
            console.error('Error completing:', e);
        } finally {
            setIsCompleting(false);
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'short_story':
                return { label: lang === 'de' ? 'Kurzgeschichte' : 'Short Story', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
            case 'poem':
                return { label: lang === 'de' ? 'Gedicht' : 'Poem', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
            case 'idea':
            case 'quote':
                return { label: lang === 'de' ? 'Idee / Zitat' : 'Idea / Essay', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
            default:
                return { label: type, bg: 'bg-muted text-muted-foreground border-border/40' };
        }
    };

    const shareUrl = typeof window !== 'undefined'
        ? (dayNumber ? `${window.location.origin}/day/${dayNumber}` : `${window.location.origin}/today`)
        : 'https://dailyreads.io/today';

    const tweetText = data?.dayNumber
        ? `Day ${data.dayNumber} of the Bradbury Method on @dailyReads_io. Three thoughtful reads for today's pause: ${shareUrl}`
        : `Today's three reads on @dailyReads_io: ${shareUrl}`;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-serif italic">
                    {lang === 'de' ? 'Lade die heutigen Texte...' : "Gathering today's readings..."}
                </p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
                <div className="p-8 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
                    <BookOpen className="h-10 w-10 text-muted-foreground/60 mx-auto" />
                    <h2 className="text-xl font-serif font-bold">
                        {lang === 'de' ? 'Kein Ritual gefunden' : 'No Reading Ritual Found Yet'}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {error || (lang === 'de' ? 'Für diesen Tag wurden noch keine festen 3 Texte kuratiert.' : 'No fixed reads curated for this day yet.')}
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/">
                            <Button className="w-full sm:w-auto">
                                {lang === 'de' ? 'Zurück zur Startseite' : 'Explore Daily Reads'}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const items: IContent[] = data.items || [];

    return (
        <div className="max-w-4xl mx-auto py-6 md:py-12 px-3 md:px-6 space-y-8 md:space-y-12 animate-in fade-in duration-500">
            {/* Header with Day Number and Navigation */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    {data.prevDay ? (
                        <Link href={`/day/${data.prevDay}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Day {data.prevDay}</span>
                        </Link>
                    ) : (
                        <span className="opacity-0">---</span>
                    )}

                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-wider uppercase">
                        Bradbury Challenge
                    </span>

                    {data.nextDay ? (
                        <Link href={`/day/${data.nextDay}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <span>Day {data.nextDay}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    ) : (
                        <span className="opacity-0">---</span>
                    )}
                </div>

                <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
                    Day {data.dayNumber}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base font-serif italic">
                    {lang === 'de'
                        ? '1 Gedicht • 1 Idee • 1 Kurzgeschichte'
                        : 'One poem. One essay or idea. One short story.'}
                </p>
            </div>

            {/* Optional Personal Note / Curator Reflection */}
            {data.note && (
                <div className="max-w-2xl mx-auto p-5 md:p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-foreground space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 uppercase font-semibold">
                        <Quote className="h-3.5 w-3.5" />
                        <span>{lang === 'de' ? 'Persönliche Tagesnotiz' : 'Curator Note'}</span>
                        {data.mood && <span className="opacity-70 font-normal lowercase">• {data.mood}</span>}
                    </div>
                    <p className="font-serif italic text-sm md:text-base leading-relaxed text-foreground/90">
                        "{data.note}"
                    </p>
                </div>
            )}

            {/* The 3 Reading Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {items.map((item, idx) => {
                    const badge = getTypeBadge(item.type);
                    const title = lang === 'de' && item.title_de ? item.title_de : (item.title_en || item.title);
                    const content = lang === 'de' && item.content_de ? item.content_de : (item.content_en || item.content);
                    const snippet = content ? content.replace(/[#*`_>]/g, '').slice(0, 160) + '...' : '';

                    return (
                        <Card
                            key={item._id?.toString() || idx}
                            className="flex flex-col justify-between border-border/50 bg-card hover:border-primary/40 transition-all hover:shadow-md rounded-2xl overflow-hidden group"
                        >
                            <CardHeader className="space-y-3 pb-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium font-sans ${badge.bg}`}>
                                        {badge.label}
                                    </span>
                                    {item.readTime && (
                                        <span className="text-[11px] text-muted-foreground font-mono">
                                            {item.readTime}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="font-serif text-lg md:text-xl font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                        {title}
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm font-sans mt-1">
                                        by {item.author}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="py-2 flex-1">
                                <p className="text-xs text-muted-foreground line-clamp-4 font-serif italic leading-relaxed">
                                    {snippet}
                                </p>
                            </CardContent>

                            <CardFooter className="pt-3 border-t border-border/40">
                                <Button
                                    variant="outline"
                                    onClick={() => setReaderItem(item)}
                                    className="w-full text-xs h-9 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all flex items-center justify-center gap-1.5"
                                >
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span>{lang === 'de' ? 'Volltext lesen' : 'Read Piece'}</span>
                                    <ChevronRight className="h-3 w-3 opacity-60 ml-auto" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Action Bar: Complete Ritual & Share on X */}
            <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-2xl bg-muted/30 border border-border/50 text-center space-y-6">
                <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg md:text-xl">
                        {completed
                            ? (lang === 'de' ? 'Pause für heute abgeschlossen!' : 'Today’s pause completed!')
                            : (lang === 'de' ? 'Hast du die drei Stücke gelesen?' : 'Finished reading today’s pieces?')}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground font-serif italic">
                        {lang === 'de'
                            ? 'Halte deine Bradbury-Gewohnheit fest und feiere den heutigen Tag.'
                            : 'Mark your presence in the 70-day streak and celebrate consistency.'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                        size="lg"
                        onClick={handleComplete}
                        disabled={completed || isCompleting}
                        className={`w-full sm:w-auto h-11 px-6 rounded-xl font-medium ${
                            completed ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
                        }`}
                    >
                        {isCompleting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : completed ? (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        {completed
                            ? (lang === 'de' ? 'Heute eingetragen ✓' : 'Completed Today ✓')
                            : (lang === 'de' ? 'Ich war heute da (Streak +1)' : 'I showed up today')}
                    </Button>

                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                    >
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto h-11 px-6 rounded-xl border-sky-500/30 hover:border-sky-500/60 text-sky-600 dark:text-sky-400 flex items-center justify-center gap-2"
                        >
                            <Twitter className="h-4 w-4 text-sky-500" />
                            <span>{lang === 'de' ? 'Auf X teilen' : 'Share on X'}</span>
                        </Button>
                    </a>
                </div>

                <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                        ← {lang === 'de' ? 'Mehr zufällige Texte auf der Startseite' : 'Explore random reads on homepage'}
                    </Link>
                    <Link href="/portal" className="hover:text-primary transition-colors">
                        {lang === 'de' ? 'Mein Profil & Historie' : 'My Reading History'} →
                    </Link>
                </div>
            </div>

            {/* Serene Reader Modal */}
            <TextReaderModal
                item={readerItem}
                onClose={() => setReaderItem(null)}
            />
        </div>
    );
}
