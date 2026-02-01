'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Calendar, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PortalPage() {
    const { data: session, status } = useSession();
    const [completions, setCompletions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isPaid = (session?.user as any)?.isPaid || false;

    useEffect(() => {
        if (status === 'authenticated' && isPaid) {
            fetch('/api/completions')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setCompletions(data);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else if (status === 'authenticated') {
            setLoading(false);
        }
    }, [status, isPaid]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col justify-center items-center py-20 min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground font-serif italic text-lg">Entering your ritual space...</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col justify-center items-center py-20 min-h-[60vh] text-center space-y-4">
                <h1 className="text-2xl font-serif font-bold">Access Restricted</h1>
                <p className="text-muted-foreground">Please sign in to view your portal and track your ritual.</p>
                <Button asChild>
                    <Link href="/auth/login">Sign In</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="space-y-2 border-b pb-6">
                <h1 className="text-3xl font-serif font-bold tracking-tight">Your Ritual Space</h1>
                <p className="text-muted-foreground">Welcome back, {session?.user?.name || session?.user?.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`${isPaid ? 'bg-primary/5 border-primary/20' : 'opacity-80'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <Flame className={`h-4 w-4 ${isPaid ? 'text-orange-500' : 'text-muted-foreground'}`} />
                            Current Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{isPaid ? (session?.user as any).currentStreak || 0 : '—'}</div>
                        <p className="text-xs text-muted-foreground mt-1">days of showing up</p>
                    </CardContent>
                </Card>

                <Card className={`${!isPaid && 'opacity-80'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <Calendar className={`h-4 w-4 ${isPaid ? 'text-primary' : 'text-muted-foreground'}`} />
                            Longest Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{isPaid ? (session?.user as any).longestStreak || 0 : '—'}</div>
                        <p className="text-xs text-muted-foreground mt-1">your best record</p>
                    </CardContent>
                </Card>

                <Card className={`${isPaid ? 'bg-primary/5 border-primary/20' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            Subscription
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{isPaid ? 'Ritual Member' : 'Free Member'}</div>
                        <p className="text-xs text-muted-foreground mt-1">{isPaid ? 'Lifetime of consistency' : 'Basic access only'}</p>
                    </CardContent>
                </Card>
            </div>

            {!isPaid ? (
                <Card className="border-primary/40 bg-primary/5 border-dashed">
                    <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-4 text-center md:text-left">
                            <h3 className="text-2xl font-serif font-bold">Unlock Your Ritual History</h3>
                            <p className="text-muted-foreground max-w-md leading-relaxed">
                                Join our community to unlock personal tracking, maintain your reading streak, and <span className="font-semibold text-foreground">access your full history of completed readings</span>.
                                <br /><br />
                                Your journey of consistency starts here, with a dedicated dashboard to reflect on your daily moments of presence.
                            </p>
                        </div>
                        <Button size="lg" className="rounded-full px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all" asChild>
                            <Link href="/portal/subscribe">Enable History & Tracking</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif">History of Presence</CardTitle>
                        <CardDescription>Your last 30 ritual completions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {completions.length > 0 ? (
                                    completions.map((comp, idx) => (
                                        <details key={idx} className="group overflow-hidden rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300">
                                            <summary className="flex items-center justify-between p-4 cursor-pointer list-none outline-none">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                                    <span className="font-medium">
                                                        {new Date(comp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary/60">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Readings</span>
                                                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                                                </div>
                                            </summary>
                                            <div className="px-5 pb-5 pt-2 border-t border-border/20 bg-background/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="grid grid-cols-1 gap-2">
                                                    {comp.contentIds && comp.contentIds.length > 0 ? (
                                                        comp.contentIds.map((item: any, i: number) => (
                                                            <div key={i} className="flex flex-col py-2 border-b border-border/10 last:border-0">
                                                                <span className="text-xs font-bold text-primary/70 uppercase tracking-tighter mb-0.5">{item.type?.replace('_', ' ')}</span>
                                                                <span className="font-serif italic text-foreground">{item.title}</span>
                                                                <span className="text-[10px] text-muted-foreground opacity-70">by {item.author}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground opacity-60">No specific records for this day.</p>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-primary/40 font-serif italic text-right mt-2">"I showed up today."</p>
                                            </div>
                                        </details>
                                    ))
                                ) : (
                                    <div className="text-center py-12 px-6 border border-dashed rounded-xl">
                                        <p className="text-muted-foreground italic mb-4">You haven't marked any pauses yet today.</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/">Back to Today's Pause</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col items-center gap-4 pt-8 pb-12">
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                    <Link href="/" className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Return to the Today's Pause
                    </Link>
                </Button>
            </div>
        </div>
    );
}
