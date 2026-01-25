'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { IContent } from '@/lib/models/Content';
import confetti from 'canvas-confetti';
import Link from 'next/link';

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

    const triggerFireworks = React.useCallback(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

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

    const markAsCompleted = React.useCallback(async () => {
        if (!isPaid || autoCompleted) return;
        setCompletionError(null);
        try {
            const res = await fetch('/api/completions', { method: 'POST' });
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
    }, [isPaid, autoCompleted, triggerFireworks, updateSession]);

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

                const res = await fetch(`${url}?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch texts');
                const data = await res.json();
                setItems(data);
                setAutoCompleted(false); // Reset completion status on new items
            } catch (err) {
                setError('Failed to load texts. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [theme, refreshKey]);

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

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-20 min-h-[600px] w-full max-w-4xl mx-auto">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 mt-4 text-muted-foreground font-serif italic text-lg animate-pulse">
                    Flipping through pages...
                </span>
            </div>
        );
    }

    if (error || items.length === 0) {
        if (items.length === 0 && !loading && !error) {
            return <div className="text-center py-10">No content found for this selection. Try another theme or random.</div>
        }
        return (
            <div className="text-center py-10">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={onRefreshRandom}>Try Random</Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            <div className="text-center mb-8 space-y-2">
                <div className="inline-block px-4 py-1.5 bg-primary/5 rounded-full border border-primary/20 mb-2">
                    <span className="text-sm font-medium text-primary tracking-wide uppercase">Today's Pause</span>
                    {items[0]?.date && (
                        <span className="ml-2 text-xs text-muted-foreground border-l pl-2">
                            {new Date(items[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                        </span>
                    )}
                </div>
                <p className="text-lg font-serif italic text-muted-foreground">
                    "Take 15–20 minutes. Read slowly. Return to work refreshed."
                </p>
            </div>

            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {items.map((item, index) => (
                        <CarouselItem key={String(item._id) + index}>
                            <div className="p-1">
                                <Card className="h-[600px] flex flex-col bg-card border-border shadow-lg">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-2">
                                                    {item.type.replace('_', ' ')}
                                                </div>
                                                <CardTitle className="text-2xl font-serif font-bold text-foreground mb-1">
                                                    {item.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm font-medium">
                                                    by {item.author} {item.source && <span>• Source: {item.source}</span>}
                                                </CardDescription>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                {item.readTime && <div>{item.readTime} read</div>}
                                                {item.estimatedWords && <div>~{item.estimatedWords} words</div>}
                                                <div className="mt-1 capitalize px-2 py-0.5 bg-muted rounded">{item.theme}</div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-hidden relative">
                                        <div className="h-full overflow-y-auto pr-2 space-y-4 text-lg/relaxed font-serif text-foreground/90 whitespace-pre-wrap">
                                            {item.content
                                                .replace(/[ \t]+/g, ' ')
                                                .split('\n')
                                                .map((para, i) => {
                                                    const cleanPara = para.trim();
                                                    return cleanPara ? (
                                                        <p key={i} className="mb-4 text-justify">
                                                            {cleanPara}
                                                        </p>
                                                    ) : null;
                                                })
                                                .filter(Boolean)
                                            }
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col border-t pt-4 text-xs text-muted-foreground text-center space-y-3">
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-medium">
                                                {index + 1} of {items.length}
                                            </span>
                                            {index < items.length - 1 ? (
                                                <span className="animate-pulse">Next: {items[index + 1].type.replace('_', ' ')} &rarr;</span>
                                            ) : (
                                                <div className="flex flex-col items-end gap-2">
                                                    {isPaid ? (
                                                        autoCompleted ? (
                                                            <div className="flex flex-col items-end gap-3 animate-in fade-in zoom-in duration-700">
                                                                <div className="flex items-center gap-2 text-primary font-serif italic text-base">
                                                                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                                                    "I showed up today."
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="text-right">
                                                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Current Streak</div>
                                                                        <div className="text-lg font-bold text-primary">{currentStreak} days</div>
                                                                    </div>
                                                                    <Link href="/portal">
                                                                        <Button size="sm" variant="outline" className="rounded-full px-4 border-primary/30 hover:bg-primary/5">
                                                                            View History &rarr;
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    className="rounded-full px-6"
                                                                    onClick={markAsCompleted}
                                                                >
                                                                    Mark Pause as Completed
                                                                </Button>
                                                                {completionError && (
                                                                    <span className="text-[10px] text-destructive animate-pulse">{completionError}</span>
                                                                )}
                                                            </>
                                                        )
                                                    ) : (
                                                        <span className="italic text-primary/60">"You showed up today."</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {!isPaid && index === items.length - 1 && (
                                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
                                                * consistency tracking and personal reading history available for ritual members
                                            </p>
                                        )}
                                    </CardFooter>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
}
