'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { IContent } from '@/lib/models/Content';

interface DailyReadsCarouselProps {
    theme?: string | null;
    refreshKey: number; // Increment to force refresh
    onRefreshRandom: () => void;
}

export function DailyReadsCarousel({ theme, refreshKey, onRefreshRandom }: DailyReadsCarouselProps) {
    const [api, setApi] = React.useState<any>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [items, setItems] = React.useState<IContent[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

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
                    // If refreshKey changed and no theme, it implies random refresh (or initial load)
                    // But initial load (refreshKey=0) is also random.
                    // The API logic: if 'random=true' is sent, it samples.
                    // If we just want "Daily Reads" (fixed for date), we might need date logic.
                    // But MVP requirements say: "Täglich 3... basierend auf Datum oder Random-Query"
                    // And "Button Get 3 Random Texts" -> checks fetch with random.

                    // If onRefreshRandom triggered, we assume we want random.
                    // We can distinguish by a prop or just always random if explicit.
                    // Let's assume refreshKey > 0 means explicit random fetch for now
                    params.append('random', 'true');
                }

                if (items.length === 0 && refreshKey === 0 && !theme) {
                    // Initial load: maybe try to get daily?
                    // For now default to random if no date logic in API yet.
                }

                const res = await fetch(`${url}?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch texts');
                const data = await res.json();
                setItems(data);
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
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

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
                                        {/* Using native overflow for now, could upgrade to ScrollArea */}
                                        <div className="h-full overflow-y-auto pr-2 space-y-4 text-lg/relaxed font-serif text-foreground/90 whitespace-pre-wrap">
                                            {item.content
                                                .replace(/[ \t]+/g, ' ') // Collapse multiple spaces/tabs
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
                                    <CardFooter className="border-t pt-4 text-xs text-muted-foreground text-center justify-center min-h-[40px]">
                                        {index < items.length - 1 ? (
                                            <span className="animate-pulse">Swipe for next &rarr;</span>
                                        ) : (
                                            <span className="text-primary/40 font-medium italic">End of today's collection</span>
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

            {/* Banner Ad Placeholder below carousel */}
            <div className="mt-8 p-4 border border-dashed border-muted-foreground/30 bg-muted/20 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">AdSense Banner Placeholder</p>
                {/* <ins className="adsbygoogle" ... ></ins> */}
            </div>
        </div>
    );
}
