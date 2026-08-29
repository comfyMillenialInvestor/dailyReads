'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Loader2, Maximize2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { IContent } from '@/lib/models/Content';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';


interface DailyReadsCarouselProps {
    theme?: string | null;
    refreshKey: number; // Increment to force refresh
    onRefreshRandom: () => void;
}

export function DailyReadsCarousel({ theme, refreshKey, onRefreshRandom }: DailyReadsCarouselProps) {
    const { data: session, update: updateSession } = useSession();
    const isPaid = (session?.user as any)?.isPaid || false;
    const currentStreak = (session?.user as any)?.currentStreak || 0;
    const [api, setApi] = React.useState<any>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [items, setItems] = React.useState<IContent[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [autoCompleted, setAutoCompleted] = React.useState(false);
    const [completionError, setCompletionError] = React.useState<string | null>(null);
    const firedRef = React.useRef(false);
    const { lang, t } = useLanguage();

    // Reader Mode States
    const [readerItem, setReaderItem] = React.useState<IContent | null>(null);
    const [readerTextSize, setReaderTextSize] = React.useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('lg');
    const [readerTheme, setReaderTheme] = React.useState<'system' | 'sepia' | 'dark'>('system');
    const [scrollProgress, setScrollProgress] = React.useState(0);
    const readerScrollRef = React.useRef<HTMLDivElement>(null);

    const triggerFireworks = React.useCallback(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }, []);

    React.useEffect(() => {
        if (autoCompleted && !firedRef.current) {
            triggerFireworks();
            firedRef.current = true;
        }
    }, [autoCompleted, triggerFireworks]);

    const markAsCompleted = React.useCallback(async () => {
        if (!isPaid || autoCompleted) return;
        setCompletionError(null);
        try {
            const contentIds = items.map(item => item._id);
            const res = await fetch('/api/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentIds })
            });
            const data = await res.json();
            if (data.success || data.alreadyDone) {
                setAutoCompleted(true);
                triggerFireworks();
                // Refresh session to get updated streak
                await updateSession();
                console.log(data.message || 'You showed up today.');
            } else {
                setCompletionError(data.error || 'Failed to record completion');
            }
        } catch (err) {
            console.error('Auto-completion failed:', err);
            setCompletionError('Connection error');
        }
    }, [isPaid, autoCompleted, triggerFireworks, updateSession, items]);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = '/api/daily-reads';
                const params = new URLSearchParams();

                if (theme) {
                    params.append('theme', theme);
                } else if (refreshKey > 0) {
                    params.append('random', 'true');
                }

                // Add timestamp to prevent caching
                params.append('t', Date.now().toString());

                const res = await fetch(`${url}?${params.toString()}`, {
                    cache: 'no-store'
                });
                if (!res.ok) throw new Error('Failed to fetch texts');
                const data = await res.json();
                setItems(data);

                // Check if already completed today to prevent button from reappearing
                if (isPaid) {
                    const completionRes = await fetch('/api/completions');
                    if (completionRes.ok) {
                        const completions = await completionRes.json();
                        // completions are sorted by date desc
                        if (completions.length > 0) {
                            const latest = new Date(completions[0].date);
                            const now = new Date();
                            // Normalize to same timezone for comparison
                            const latestStr = latest.toLocaleDateString('en-GB');
                            const todayStr = now.toLocaleDateString('en-GB');
                            if (latestStr === todayStr) {
                                setAutoCompleted(true);
                                // Fire fireworks as welcome-back celebration
                                if (!firedRef.current) {
                                    triggerFireworks();
                                    firedRef.current = true;
                                }
                                return;
                            }
                        }
                    }
                }
                setAutoCompleted(false);
            } catch (err) {
                setError('Failed to load texts. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [theme, refreshKey, isPaid]);

    React.useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            const newCurrent = api.selectedScrollSnap() + 1;
            setCurrent(newCurrent);

            // If they reached the last slide, auto-complete
            if (newCurrent === count && count > 0) {
                markAsCompleted();
            }
        });
    }, [api, count, markAsCompleted]);

    // Prevent background scrolling when reader is open
    React.useEffect(() => {
        if (readerItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [readerItem]);

    const handleReaderScroll = () => {
        const element = readerScrollRef.current;
        if (!element) return;

        const totalHeight = element.scrollHeight - element.clientHeight;
        if (totalHeight <= 0) {
            setScrollProgress(100);
            return;
        }

        const scrolled = (element.scrollTop / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, scrolled)));

        // Mark completed if user scrolls near the bottom (95%) of the last item
        if (scrolled >= 95) {
            const currentItemIndex = items.findIndex(it => it._id === readerItem?._id);
            if (currentItemIndex === items.length - 1) {
                markAsCompleted();
            }
        }
    };

    const textSizes: ('sm' | 'base' | 'lg' | 'xl' | '2xl')[] = ['sm', 'base', 'lg', 'xl', '2xl'];

    const increaseTextSize = () => {
        const currentIndex = textSizes.indexOf(readerTextSize);
        if (currentIndex < textSizes.length - 1) {
            setReaderTextSize(textSizes[currentIndex + 1]);
        }
    };

    const decreaseTextSize = () => {
        const currentIndex = textSizes.indexOf(readerTextSize);
        if (currentIndex > 0) {
            setReaderTextSize(textSizes[currentIndex - 1]);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-20 min-h-[600px] w-full max-w-4xl mx-auto">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 mt-4 text-muted-foreground font-serif italic text-base md:text-lg animate-pulse">
                    {t('carousel.loading')}
                </span>
            </div>
        );
    }

    if (error || items.length === 0) {
        if (items.length === 0 && !loading && !error) {
            return <div className="text-center py-10 px-4">{t('carousel.noContent')}</div>
        }
        return (
            <div className="text-center py-10 px-4">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={onRefreshRandom}>{t('carousel.tryRandom')}</Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            <div className="text-center mb-6 md:mb-8 space-y-2">
                <div className="inline-block px-3 md:px-4 py-1.5 bg-primary/5 rounded-full border border-primary/20 mb-2">
                    <span className="text-xs md:text-sm font-medium text-primary tracking-wide uppercase">{t('carousel.todaysPause')}</span>
                    {items[0]?.date && (
                        <span className="ml-2 text-[10px] md:text-xs text-muted-foreground border-l pl-2">
                            {new Date(items[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                        </span>
                    )}
                </div>
                <p className="text-base md:text-lg font-serif italic text-muted-foreground px-2">
                    {t('carousel.readingQuote')}
                </p>
            </div>

            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {items.map((item, index) => (
                        <CarouselItem key={String(item._id) + index}>
                            <div className="p-1">
                                <Card className="h-[calc(100vh-280px)] min-h-[400px] max-h-[600px] md:min-h-[460px] md:h-[600px] flex flex-col bg-card border-border shadow-lg">
                                    <CardHeader className="pb-3 px-3 md:px-6">
                                        <div className="flex justify-between items-start gap-3 md:gap-4 w-full">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">
                                                        {item.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="capitalize text-[10px] px-2 py-0.5 bg-muted rounded text-muted-foreground font-medium">
                                                        {item.theme}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-lg md:text-2xl font-serif font-bold text-foreground mb-1 leading-tight line-clamp-2">
                                                    {lang === 'de' && item.title_de ? item.title_de : (item.title_en || item.title)}
                                                </CardTitle>
                                                <CardDescription className="text-xs md:text-sm font-medium text-muted-foreground/80 truncate">
                                                    by {item.author} {item.source && !(item.source.startsWith("HF:") || item.source.startsWith("HF: ") || item.source.length > 20) && <span>• {item.source}</span>}
                                                </CardDescription>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <div className="text-right text-[10px] md:text-xs text-muted-foreground/80 leading-tight">
                                                    {item.readTime && <div>{item.readTime}</div>}
                                                    {item.estimatedWords && <div>~{item.estimatedWords} {t('carousel.words')}</div>}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex items-center gap-1.5 text-xs rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-200 min-h-[36px] min-w-[44px] px-3"
                                                    onClick={() => {
                                                        setReaderItem(item);
                                                        setScrollProgress(0);
                                                    }}
                                                >
                                                    <Maximize2 className="h-3.5 w-3.5" />
                                                    <span>{t('carousel.expand')}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-hidden relative px-3 md:px-6">
                                        <div className="h-full overflow-y-auto pr-2 font-serif text-foreground/90 leading-relaxed scrollbar-thin scrollbar-thumb-muted">
                                            <div className={`markdown-content ${item.type === 'poem' ? 'poetry-mode' : 'prose-mode'}`}>
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ children }) => (
                                                            <p className={`${item.type === 'poem' ? 'mb-2' : 'mb-5 md:mb-6 text-left md:text-justify'} text-base md:text-lg leading-relaxed last:mb-0`}>
                                                                {children}
                                                            </p>
                                                        ),
                                                        em: ({ children }) => <em className="italic opacity-90">{children}</em>,
                                                        strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                                                    }}
                                                >
                                                    {lang === 'de' && item.content_de ? item.content_de : (item.content_en || item.content)}
                                                </ReactMarkdown>
                                                {item.source && (item.source.startsWith("HF:") || item.source.startsWith("HF: ") || item.source.length > 20) && (
                                                    <div className="mt-8 pt-4 border-t border-border/20 text-[10px] text-muted-foreground/50 font-sans italic">
                                                        Source: {item.source}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex flex-col border-t pt-3 md:pt-4 px-3 md:px-6 pb-3 md:pb-4 text-xs text-muted-foreground text-center space-y-2 md:space-y-3">
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-medium">
                                                {index + 1} {t('carousel.of')} {items.length}
                                            </span>
                                            {index < items.length - 1 ? (
                                                <span className="animate-pulse">{t('carousel.next')}: {items[index + 1].type.replace('_', ' ')} &rarr;</span>
                                            ) : (
                                                <div className="flex flex-col items-end gap-2">
                                                    {isPaid ? (
                                                        autoCompleted ? (
                                                            <div 
                                                                className="flex flex-col items-end gap-2 md:gap-3 animate-in fade-in zoom-in duration-700 cursor-pointer select-none group"
                                                                onClick={triggerFireworks}
                                                                title="Click to celebrate again!"
                                                            >
                                                                <div className="flex items-center gap-2 text-primary font-serif italic text-sm md:text-base group-hover:scale-105 transition-transform duration-200">
                                                                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                                                    {t('carousel.showedUp')}
                                                                </div>
                                                                <div className="flex items-center gap-3 md:gap-4 group-hover:scale-105 transition-transform duration-200">
                                                                    <div className="text-right">
                                                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('carousel.currentStreak')}</div>
                                                                        <div className="text-base md:text-lg font-bold text-primary">{currentStreak} {t('carousel.days')}</div>
                                                                    </div>
                                                                    <Link href="/portal" onClick={(e) => e.stopPropagation()}>
                                                                        <Button size="sm" variant="outline" className="rounded-full px-3 md:px-4 border-primary/30 hover:bg-primary/5 text-[10px] md:text-xs">
                                                                            {t('carousel.viewHistory')} &rarr;
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    className="rounded-full px-4 md:px-6 text-xs"
                                                                    onClick={markAsCompleted}
                                                                >
                                                                    {t('carousel.markCompleted')}
                                                                </Button>
                                                                {completionError && (
                                                                    <span className="text-[10px] text-destructive animate-pulse">{completionError}</span>
                                                                )}
                                                            </>
                                                        )
                                                    ) : (
                                                        <span className="italic text-primary/60">{t('carousel.showedUp')}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {!isPaid && index === items.length - 1 && (
                                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
                                                {t('carousel.memberHint')}
                                            </p>
                                        )}
                                    </CardFooter>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 md:-left-16 hover:bg-background/90 z-10" />
                <CarouselNext className="right-2 md:-right-16 hover:bg-background/90 z-10" />
            </Carousel>

            {/* Pagination Indicators */}
            {count > 0 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: count }).map((_, i) => (
                        <button
                            key={i}
                            className={cn(
                                "h-2 w-2 rounded-full transition-all duration-300",
                                current === i + 1
                                    ? "bg-primary w-5"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                            onClick={() => api?.scrollTo(i)}
                            aria-label={`Go to text ${i + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Full-screen Reader Mode Overlay */}
            {readerItem && (
                <div
                    ref={readerScrollRef}
                    onScroll={handleReaderScroll}
                    className={cn(
                        "fixed inset-0 z-50 overflow-y-auto flex flex-col transition-colors duration-300",
                        readerTheme === 'sepia' && "bg-[#FBF6EF] text-[#433422]",
                        readerTheme === 'dark' && "bg-[#121317] text-[#EFF2F7]",
                        readerTheme === 'system' && "bg-background text-foreground"
                    )}
                >
                    {/* Top Control Bar */}
                    <div
                        className={cn(
                            "sticky top-0 z-10 border-b px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between backdrop-blur-md",
                            readerTheme === 'sepia' && "border-[#E6DEC9]/60 bg-[#FBF6EF]/90",
                            readerTheme === 'dark' && "border-[#2F3034] bg-[#121317]/90",
                            readerTheme === 'system' && "border-border/60 bg-background/90"
                        )}
                    >
                        <div className="flex-1 min-w-0 pr-2 md:pr-4">
                            <h2 className="text-xs md:text-sm font-bold truncate font-serif">
                                {lang === 'de' && readerItem.title_de ? readerItem.title_de : (readerItem.title_en || readerItem.title)}
                            </h2>
                            <p className="text-[10px] md:text-xs opacity-75 truncate font-sans">
                                by {readerItem.author}
                            </p>
                        </div>

                        {/* Control Panel */}
                        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                            {/* Font Size Adjuster */}
                            <div className="flex items-center border rounded-full overflow-hidden p-0.5 bg-muted/20">
                                <button
                                    onClick={decreaseTextSize}
                                    className="p-1 px-1.5 md:px-2.5 text-[10px] md:text-xs font-semibold hover:bg-muted/40 rounded-full transition-colors"
                                    title={t('carousel.decreaseTextSize')}
                                >
                                    A-
                                </button>
                                <span className="text-[9px] md:text-[10px] uppercase font-bold opacity-60 px-1 md:px-1.5 border-x select-none hidden sm:inline">
                                    {readerTextSize}
                                </span>
                                <button
                                    onClick={increaseTextSize}
                                    className="p-1 px-1.5 md:px-2.5 text-[10px] md:text-xs font-semibold hover:bg-muted/40 rounded-full transition-colors"
                                    title={t('carousel.increaseTextSize')}
                                >
                                    A+
                                </button>
                            </div>

                            {/* Reading Theme selector */}
                            <div className="flex items-center gap-1 md:gap-1.5 border rounded-full p-0.5 md:p-1 bg-muted/20">
                                <button
                                    onClick={() => setReaderTheme('system')}
                                    className={cn(
                                        "h-4 w-4 md:h-5 md:w-5 rounded-full border transition-all bg-card cursor-pointer",
                                        readerTheme === 'system' ? "ring-2 ring-primary border-transparent scale-110" : "opacity-75 hover:opacity-100"
                                    )}
                                    title={t('carousel.systemTheme')}
                                />
                                <button
                                    onClick={() => setReaderTheme('sepia')}
                                    className={cn(
                                        "h-4 w-4 md:h-5 md:w-5 rounded-full border border-[#D5CBB3] bg-[#FBF6EF] transition-all cursor-pointer",
                                        readerTheme === 'sepia' ? "ring-2 ring-amber-700/60 scale-110" : "opacity-75 hover:opacity-100"
                                    )}
                                    title={t('carousel.warmSepia')}
                                />
                                <button
                                    onClick={() => setReaderTheme('dark')}
                                    className={cn(
                                        "h-4 w-4 md:h-5 md:w-5 rounded-full border border-zinc-800 bg-zinc-950 transition-all cursor-pointer",
                                        readerTheme === 'dark' ? "ring-2 ring-zinc-400 scale-110" : "opacity-75 hover:opacity-100"
                                    )}
                                    title={t('carousel.darkTheme')}
                                />
                            </div>

                            {/* Exit Button */}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setReaderItem(null)}
                                className="rounded-full h-7 w-7 md:h-8 md:w-8 hover:bg-muted/50"
                                title={t('carousel.closeReader')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Scroll Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/30">
                            <div
                                className={cn(
                                    "h-full transition-all duration-75",
                                    readerTheme === 'sepia' ? "bg-amber-700/80" : "bg-primary"
                                )}
                                style={{ width: `${scrollProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Reader Text Area */}
                    <div className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-20 flex flex-col justify-between">
                        <div>
                            {/* Meta header in reader */}
                            <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
                                <span className={cn(
                                    "inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full",
                                    readerTheme === 'sepia' ? "bg-[#E6DEC9] text-[#5B4636]" : readerTheme === 'dark' ? "bg-zinc-800 text-zinc-300" : "bg-primary/10 text-primary"
                                )}>
                                    {readerItem.type.replace('_', ' ')}
                                </span>
                                <h1 className="text-2xl md:text-5xl font-serif font-extrabold tracking-tight leading-tight">
                                    {lang === 'de' && readerItem.title_de ? readerItem.title_de : (readerItem.title_en || readerItem.title)}
                                </h1>
                                <div className="text-sm md:text-lg opacity-85 font-serif italic">
                                    by {readerItem.author}
                                </div>
                                <div className="flex items-center justify-center gap-3 md:gap-4 text-[10px] md:text-xs opacity-60 font-sans flex-wrap">
                                    {readerItem.readTime && <span>{readerItem.readTime} {t('carousel.read')}</span>}
                                    {readerItem.estimatedWords && <span>~{readerItem.estimatedWords} {t('carousel.words')}</span>}
                                    {readerItem.source && !(readerItem.source.startsWith("HF:") || readerItem.source.startsWith("HF: ") || readerItem.source.length > 20) && <span>{t('carousel.source')}: {readerItem.source}</span>}
                                </div>
                                <div className="h-[1px] w-24 mx-auto bg-muted-foreground/30 my-4 md:my-6" />
                            </div>

                            {/* Main story text */}
                            <div className={cn(
                                "markdown-content prose-lg max-w-none leading-relaxed",
                                readerItem.type === 'poem' ? 'poetry-mode font-serif pl-2 md:pl-12 italic' : 'prose-mode font-serif'
                            )}>
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => (
                                            <p
                                                className={cn(
                                                    readerItem.type === 'poem' ? 'mb-3' : 'mb-6 md:mb-8 text-left md:text-justify',
                                                    readerTextSize === 'sm' && "text-sm md:text-base",
                                                    readerTextSize === 'base' && "text-base md:text-lg",
                                                    readerTextSize === 'lg' && "text-lg md:text-xl",
                                                    readerTextSize === 'xl' && "text-xl md:text-2xl",
                                                    readerTextSize === '2xl' && "text-2xl md:text-3xl leading-loose"
                                                )}
                                            >
                                                {children}
                                            </p>
                                        ),
                                        em: ({ children }) => <em className="italic opacity-90">{children}</em>,
                                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                    }}
                                >
                                    {lang === 'de' && readerItem.content_de ? readerItem.content_de : (readerItem.content_en || readerItem.content)}
                                </ReactMarkdown>
                                {readerItem.source && (readerItem.source.startsWith("HF:") || readerItem.source.startsWith("HF: ") || readerItem.source.length > 20) && (
                                    <div className="mt-8 pt-4 border-t border-border/20 text-xs text-muted-foreground/50 font-sans italic text-center">
                                        Source: {readerItem.source}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reader mode footer */}
                        <div className="mt-12 md:mt-16 text-center">
                            <div className="h-[1px] w-full bg-muted-foreground/20 my-6 md:my-8" />
                            <p className="text-sm opacity-60 italic font-serif mb-6">
                                {t('carousel.readerQuote')}
                            </p>
                            <Button
                                onClick={() => setReaderItem(null)}
                                variant="outline"
                                className="rounded-full px-6 border-primary/20"
                            >
                                {t('carousel.finishReading')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
