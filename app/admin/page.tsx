'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Twitter,
    Sparkles,
    Calendar,
    BookOpen,
    Quote,
    Repeat,
    Copy,
    Check,
    Loader2,
    Send,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Layers,
    Feather,
    RefreshCw
} from 'lucide-react';

export default function AdminPage() {
    const { data: session } = useSession();
    const streakDays = (session?.user as any)?.streakDays || 42;

    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'standalone'>('daily');

    // ── 1. DAILY PART STATE ──
    const [challengeDay, setChallengeDay] = useState<number>(streakDays);
    const [dailyTexts, setDailyTexts] = useState<any[]>([]);
    const [dailyLoading, setDailyLoading] = useState(false);
    const [dailyPostText, setDailyPostText] = useState('');
    const [dailyPattern, setDailyPattern] = useState<'austere' | 'atmospheric' | 'resonance' | 'quote_first'>('austere');
    const [dailyPostLoading, setDailyPostLoading] = useState(false);
    const [dailyPostStatus, setDailyPostStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // ── 2. WEEKLY RECAP STATE ──
    const [recapWeek, setRecapWeek] = useState<number>(6);
    const [recapLoading, setRecapLoading] = useState(false);
    const [recapData, setRecapData] = useState<any>(null);
    const [recapPostText, setRecapPostText] = useState('');
    const [recapThread, setRecapThread] = useState<string[]>([]);
    const [recapPostLoading, setRecapPostLoading] = useState(false);
    const [recapPostStatus, setRecapPostStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // ── 3. STANDALONE POSTS STATE ──
    const [standaloneType, setStandaloneType] = useState<'all' | 'quote' | 'poem'>('all');
    const [standaloneTheme, setStandaloneTheme] = useState<string>('all');
    const [standaloneItem, setStandaloneItem] = useState<any>(null);
    const [standalonePostText, setStandalonePostText] = useState('');
    const [standaloneLoading, setStandaloneLoading] = useState(false);
    const [standalonePostLoading, setStandalonePostLoading] = useState(false);
    const [standalonePostStatus, setStandalonePostStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Generic copy feedback
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(id);
        setTimeout(() => setCopiedIndex(null), 2500);
    };

    // ── FETCH DAILY READINGS ──
    const loadDailyReadings = async (dayNum: number) => {
        setDailyLoading(true);
        setDailyPostStatus(null);
        try {
            const res = await fetch(`/api/admin/daily-ritual?day=${dayNum}`);
            const data = await res.json();
            if (data?.ritual?.contentIds && data.ritual.contentIds.length > 0) {
                setDailyTexts(data.ritual.contentIds);
                if (data.ritual.xPostText) {
                    setDailyPostText(data.ritual.xPostText);
                } else {
                    formatDefaultDailyPost(dayNum, data.ritual.contentIds, dailyPattern);
                }
            } else {
                // If not in daily rituals yet, load /api/today or fallback
                const todayRes = await fetch(`/api/today?day=${dayNum}`);
                const todayData = await todayRes.json();
                if (todayData?.items && todayData.items.length > 0) {
                    setDailyTexts(todayData.items);
                    formatDefaultDailyPost(dayNum, todayData.items, dailyPattern);
                } else {
                    setDailyTexts([]);
                    setDailyPostText(`Day ${dayNum} of 70 — Bradbury Reading Method.\n\nThree curated short pieces for today's midday pause.\n\nRead live at dailyreads.io/day/${dayNum}`);
                }
            }
        } catch (e: any) {
            console.error('Failed to load day readings:', e);
        } finally {
            setDailyLoading(false);
        }
    };

    const formatDefaultDailyPost = (day: number, texts: any[], pattern: string) => {
        const story = texts.find(t => t.type === 'short_story');
        const poem = texts.find(t => t.type === 'poem');
        const idea = texts.find(t => t.type === 'idea' || t.type === 'quote');

        let closing = "Read during the midday pause.";
        if (pattern === 'atmospheric') closing = "Rain on the glass; coffee growing cold.";
        if (pattern === 'resonance') closing = "Three quiet signals across three different eras.";

        const lines = [
            `Day ${day} of 70 — Bradbury Method:`,
            story ? `• Story: "${story.title}" (${story.author})` : '',
            poem ? `• Poem: "${poem.title}" (${poem.author})` : '',
            idea ? `• Idea: ${idea.author}` : '',
            '',
            `${closing}`,
            `dailyreads.io/day/${day}`
        ].filter(Boolean);

        setDailyPostText(lines.join('\n'));
    };

    useEffect(() => {
        loadDailyReadings(challengeDay);
    }, [challengeDay]);

    // ── FETCH STANDALONE POST ──
    const fetchStandalone = async () => {
        setStandaloneLoading(true);
        setStandalonePostStatus(null);
        try {
            const params = new URLSearchParams();
            if (standaloneType !== 'all') params.set('type', standaloneType);
            if (standaloneTheme !== 'all') params.set('theme', standaloneTheme);

            const res = await fetch(`/api/admin/standalone?${params.toString()}`);
            const data = await res.json();
            if (data?.item) {
                setStandaloneItem(data.item);
                setStandalonePostText(data.suggestedTweet || '');
            }
        } catch (e: any) {
            console.error('Failed to fetch standalone item:', e);
        } finally {
            setStandaloneLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'standalone' && !standaloneItem) {
            fetchStandalone();
        }
    }, [activeTab]);

    // ── FETCH WEEKLY RECAP ──
    const fetchWeeklyRecap = async (week: number) => {
        setRecapLoading(true);
        setRecapPostStatus(null);
        try {
            const res = await fetch(`/api/admin/weekly-recap?week=${week}`);
            const data = await res.json();
            setRecapData(data);
            if (data?.singleRecap) {
                setRecapPostText(data.singleRecap);
            }
            if (data?.thread) {
                setRecapThread(data.thread);
            }
        } catch (e: any) {
            console.error('Failed to fetch weekly recap:', e);
        } finally {
            setRecapLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'weekly' && !recapData) {
            fetchWeeklyRecap(recapWeek);
        }
    }, [activeTab]);

    // ── POST TO X HELPER ──
    const handlePostToX = async (
        postPayload: { post?: string; thread?: string[] },
        setLoading: (b: boolean) => void,
        setStatus: (s: any) => void,
        onSuccess?: () => void
    ) => {
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch('/api/admin/post-x', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postPayload)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setStatus({
                    type: 'success',
                    message: postPayload.thread
                        ? `Thread with ${data.count} tweets successfully published to @dailyReads_io!`
                        : 'Post successfully published to @dailyReads_io on X!'
                });
                if (onSuccess) onSuccess();
            } else {
                setStatus({
                    type: 'error',
                    message: data.error || 'Failed to post to X'
                });
            }
        } catch (e: any) {
            setStatus({ type: 'error', message: e.message || 'Network error while posting' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1 rounded-md bg-sky-500/10 text-sky-500">
                            <Twitter className="h-4 w-4" />
                        </span>
                        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
                            X Publishing Command Center
                        </h1>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground font-sans">
                        Daily Bradbury logs, weekly reading recaps & standalone classic quotes and poems.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
                        Official X API Connected
                    </Badge>
                    <a
                        href="https://x.com/dailyReads_io"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2.5 py-1 transition-colors"
                    >
                        <span>@dailyReads_io</span>
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/40 rounded-xl border border-border/50">
                <Button
                    variant={activeTab === 'daily' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('daily')}
                    className="flex items-center gap-2 text-xs rounded-lg flex-1 sm:flex-initial"
                >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Daily Bradbury Log</span>
                </Button>
                <Button
                    variant={activeTab === 'weekly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('weekly')}
                    className="flex items-center gap-2 text-xs rounded-lg flex-1 sm:flex-initial"
                >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Weekly Recap</span>
                </Button>
                <Button
                    variant={activeTab === 'standalone' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('standalone')}
                    className="flex items-center gap-2 text-xs rounded-lg flex-1 sm:flex-initial"
                >
                    <Quote className="h-3.5 w-3.5" />
                    <span>Standalone Quote / Poem</span>
                </Button>
            </div>

            {/* ======================================================== */}
            {/* ── TAB 1: DAILY BRADBURY POST ── */}
            {/* ======================================================== */}
            {activeTab === 'daily' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Day & Readings Input */}
                    <div className="lg:col-span-5 space-y-4">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-serif flex items-center justify-between">
                                    <span>Select Day</span>
                                    <Badge variant="outline" className="text-[11px] font-normal">
                                        Streak: Day {streakDays}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Set the challenge day number to load today’s three texts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        max={365}
                                        value={challengeDay}
                                        onChange={(e) => setChallengeDay(parseInt(e.target.value, 10) || 1)}
                                        className="font-mono text-center h-9"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setChallengeDay(streakDays)}
                                        className="text-xs whitespace-nowrap h-9"
                                    >
                                        Use Streak Day
                                    </Button>
                                </div>

                                {/* Reading Cards Preview */}
                                <div className="space-y-2 pt-2 border-t border-border/40">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Curated Texts (Bradbury Trio)
                                        </span>
                                        {dailyLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                                    </div>

                                    {dailyTexts.length > 0 ? (
                                        <div className="space-y-2">
                                            {dailyTexts.map((item, idx) => (
                                                <div key={item._id || idx} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs space-y-0.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-[10px] uppercase font-bold text-primary">
                                                            {item.type === 'short_story' ? '📖 Short Story' : item.type === 'poem' ? '🪶 Classic Poem' : '💡 Idea / Quote'}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">{item.theme}</span>
                                                    </div>
                                                    <div className="font-medium font-serif truncate text-foreground">
                                                        "{item.title}"
                                                    </div>
                                                    <div className="text-muted-foreground text-[11px] truncate">
                                                        by {item.author}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center rounded-lg bg-muted/20 text-xs text-muted-foreground italic font-serif">
                                            No fixed texts in ritual for Day {challengeDay} yet. Default placeholder used.
                                        </div>
                                    )}
                                </div>

                                {/* Pattern Style Picker */}
                                <div className="space-y-1.5 pt-2 border-t border-border/40">
                                    <label className="text-xs font-semibold text-muted-foreground">Ending Pattern</label>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <button
                                            onClick={() => {
                                                setDailyPattern('austere');
                                                formatDefaultDailyPost(challengeDay, dailyTexts, 'austere');
                                            }}
                                            className={`p-2 rounded-lg border text-left transition-all ${dailyPattern === 'austere' ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-border/50 text-muted-foreground hover:bg-muted/30'}`}
                                        >
                                            <div className="font-medium">Austere / Ritual</div>
                                            <div className="text-[10px] opacity-75">"Read during the midday pause."</div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDailyPattern('atmospheric');
                                                formatDefaultDailyPost(challengeDay, dailyTexts, 'atmospheric');
                                            }}
                                            className={`p-2 rounded-lg border text-left transition-all ${dailyPattern === 'atmospheric' ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-border/50 text-muted-foreground hover:bg-muted/30'}`}
                                        >
                                            <div className="font-medium">Atmospheric</div>
                                            <div className="text-[10px] opacity-75">"Rain on glass; coffee cold."</div>
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: X Post Editor & Actions */}
                    <div className="lg:col-span-7 space-y-4">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-serif flex items-center gap-2">
                                        <Twitter className="h-4 w-4 text-sky-500" />
                                        <span>X Post Draft</span>
                                    </CardTitle>
                                    <span className={`text-xs font-mono font-medium ${dailyPostText.length > 280 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                                        {dailyPostText.length} / 280 chars
                                    </span>
                                </div>
                                <CardDescription className="text-xs">
                                    Review, customize, and publish directly to Twitter/X with 1-click.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    rows={8}
                                    value={dailyPostText}
                                    onChange={(e) => setDailyPostText(e.target.value)}
                                    placeholder="Drafting tweet for today's reading pause..."
                                    className="font-mono text-sm leading-relaxed resize-y bg-background"
                                />

                                {dailyPostStatus && (
                                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${dailyPostStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                                        {dailyPostStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                        <span>{dailyPostStatus.message}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(dailyPostText, 'daily')}
                                    className="text-xs"
                                >
                                    {copiedIndex === 'daily' ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                                    <span>{copiedIndex === 'daily' ? 'Copied!' : 'Copy to Clipboard'}</span>
                                </Button>

                                <Button
                                    size="sm"
                                    disabled={dailyPostLoading || dailyPostText.length === 0 || dailyPostText.length > 280}
                                    onClick={() => handlePostToX({ post: dailyPostText }, setDailyPostLoading, setDailyPostStatus)}
                                    className="text-xs bg-sky-500 hover:bg-sky-600 text-white font-medium"
                                >
                                    {dailyPostLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                                    <span>Approve & Post to X</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* ── TAB 2: WEEKLY RECAP ── */}
            {/* ======================================================== */}
            {activeTab === 'weekly' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-4">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-serif flex items-center justify-between">
                                    <span>Select Recap Week</span>
                                    <Badge variant="outline" className="text-[11px]">
                                        Week {recapWeek} (Days {(recapWeek - 1) * 7 + 1}–{recapWeek * 7})
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Summarize 7 consecutive daily rituals into a high-engagement weekly reflection.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Week Number</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={52}
                                            value={recapWeek}
                                            onChange={(e) => {
                                                const w = parseInt(e.target.value, 10) || 1;
                                                setRecapWeek(w);
                                                fetchWeeklyRecap(w);
                                            }}
                                            className="font-mono text-center h-9 mt-1"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchWeeklyRecap(recapWeek)}
                                        disabled={recapLoading}
                                        className="h-9 mt-5 text-xs flex items-center gap-1.5"
                                    >
                                        {recapLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                        <span>Refresh Recap</span>
                                    </Button>
                                </div>

                                {recapData?.ritualsSummary && (
                                    <div className="pt-3 border-t border-border/40 space-y-2">
                                        <span className="text-xs font-semibold uppercase text-muted-foreground">Days Covered</span>
                                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                                            {recapData.ritualsSummary.map((r: any) => (
                                                <div key={r.dayNumber} className="p-2 rounded bg-muted/20 border border-border/30 text-xs flex items-center justify-between">
                                                    <span className="font-mono font-bold text-primary">Day {r.dayNumber}</span>
                                                    <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                                        {r.items?.map((i: any) => i.author).join(', ') || 'Texts'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-serif flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-primary" />
                                        <span>Weekly Recap Post</span>
                                    </CardTitle>
                                    <span className={`text-xs font-mono font-medium ${recapPostText.length > 280 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                                        {recapPostText.length} / 280 chars
                                    </span>
                                </div>
                                <CardDescription className="text-xs">
                                    Single standalone tweet summarizing the milestone, or post as a multi-tweet thread.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    rows={8}
                                    value={recapPostText}
                                    onChange={(e) => setRecapPostText(e.target.value)}
                                    placeholder="Weekly recap text..."
                                    className="font-mono text-sm leading-relaxed resize-y bg-background"
                                />

                                {recapPostStatus && (
                                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${recapPostStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                                        {recapPostStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                        <span>{recapPostStatus.message}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(recapPostText, 'recap')}
                                        className="text-xs"
                                    >
                                        {copiedIndex === 'recap' ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                                        <span>{copiedIndex === 'recap' ? 'Copied!' : 'Copy Post'}</span>
                                    </Button>

                                    {recapThread.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(recapThread.join('\n\n---\n\n'), 'thread')}
                                            className="text-xs"
                                        >
                                            {copiedIndex === 'thread' ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                                            <span>Copy Thread (2 tweets)</span>
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {recapThread.length > 0 && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={recapPostLoading}
                                            onClick={() => handlePostToX({ thread: recapThread }, setRecapPostLoading, setRecapPostStatus)}
                                            className="text-xs"
                                        >
                                            {recapPostLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Layers className="h-3.5 w-3.5 mr-1" />}
                                            <span>Post 2-Tweet Thread</span>
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        disabled={recapPostLoading || recapPostText.length === 0 || recapPostText.length > 280}
                                        onClick={() => handlePostToX({ post: recapPostText }, setRecapPostLoading, setRecapPostStatus)}
                                        className="text-xs bg-sky-500 hover:bg-sky-600 text-white font-medium"
                                    >
                                        {recapPostLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                                        <span>Post Single Recap to X</span>
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* ── TAB 3: STANDALONE POSTS ── */}
            {/* ======================================================== */}
            {activeTab === 'standalone' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Pull Quote / Poem from Database */}
                    <div className="lg:col-span-5 space-y-4">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-serif flex items-center justify-between">
                                    <span>Pull From Database</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={fetchStandalone}
                                        disabled={standaloneLoading}
                                        className="h-8 text-xs flex items-center gap-1.5"
                                    >
                                        {standaloneLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                        <span>Shuffle / Next</span>
                                    </Button>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Pulls verified classic quotes and poems directly from the database with author attribution.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Filter Options */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Type</label>
                                        <select
                                            value={standaloneType}
                                            onChange={(e) => {
                                                setStandaloneType(e.target.value as any);
                                            }}
                                            className="w-full h-8 mt-1 text-xs rounded-md border border-input bg-background px-2"
                                        >
                                            <option value="all">Any (Quotes & Poems)</option>
                                            <option value="quote">Classic Quotes & Ideas</option>
                                            <option value="poem">Classic Poems</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Theme</label>
                                        <select
                                            value={standaloneTheme}
                                            onChange={(e) => {
                                                setStandaloneTheme(e.target.value);
                                            }}
                                            className="w-full h-8 mt-1 text-xs rounded-md border border-input bg-background px-2 capitalize"
                                        >
                                            <option value="all">All 12 Themes</option>
                                            <option value="philosophy">Philosophy</option>
                                            <option value="personal growth">Personal Growth</option>
                                            <option value="literature">Literature</option>
                                            <option value="art">Art</option>
                                            <option value="environment">Environment</option>
                                            <option value="mystery">Mystery</option>
                                            <option value="history">History</option>
                                            <option value="science">Science</option>
                                            <option value="politics">Politics</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Preview of Pulled Item */}
                                {standaloneItem ? (
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary bg-primary/10 border-primary/20">
                                                {standaloneItem.type === 'poem' ? '🪶 Classic Poem' : '💡 Quote / Idea'}
                                            </Badge>
                                            <span className="text-[10px] font-medium text-muted-foreground capitalize">
                                                {standaloneItem.theme}
                                            </span>
                                        </div>

                                        <blockquote className="font-serif italic text-sm text-foreground/90 leading-relaxed border-l-2 border-primary/40 pl-3 py-1">
                                            "{standaloneItem.content_en?.slice(0, 200) || standaloneItem.content?.slice(0, 200)}..."
                                        </blockquote>

                                        <div className="text-xs pt-1 border-t border-border/40">
                                            <div className="font-semibold text-foreground">
                                                — {standaloneItem.author}
                                            </div>
                                            {standaloneItem.source && (
                                                <div className="text-muted-foreground text-[11px] truncate">
                                                    Source: {standaloneItem.source}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-xs text-muted-foreground italic font-serif">
                                        Click "Shuffle / Next" to load a quote or poem from the database.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Tweet Formatter & 1-Click Publishing */}
                    <div className="lg:col-span-7 space-y-4">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-serif flex items-center gap-2">
                                        <Feather className="h-4 w-4 text-sky-500" />
                                        <span>Standalone Tweet Draft</span>
                                    </CardTitle>
                                    <span className={`text-xs font-mono font-medium ${standalonePostText.length > 280 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                                        {standalonePostText.length} / 280 chars
                                    </span>
                                </div>
                                <CardDescription className="text-xs">
                                    Instant pull quote / poem post with author and soft daily reading CTA.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    rows={8}
                                    value={standalonePostText}
                                    onChange={(e) => setStandalonePostText(e.target.value)}
                                    placeholder="Standalone tweet text ready for publishing..."
                                    className="font-mono text-sm leading-relaxed resize-y bg-background"
                                />

                                {standalonePostStatus && (
                                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${standalonePostStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                                        {standalonePostStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                        <span>{standalonePostStatus.message}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(standalonePostText, 'standalone')}
                                    className="text-xs"
                                >
                                    {copiedIndex === 'standalone' ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                                    <span>{copiedIndex === 'standalone' ? 'Copied!' : 'Copy to Clipboard'}</span>
                                </Button>

                                <Button
                                    size="sm"
                                    disabled={standalonePostLoading || standalonePostText.length === 0 || standalonePostText.length > 280}
                                    onClick={() => handlePostToX({ post: standalonePostText }, setStandalonePostLoading, setStandalonePostStatus)}
                                    className="text-xs bg-sky-500 hover:bg-sky-600 text-white font-medium"
                                >
                                    {standalonePostLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                                    <span>Approve & Post to X</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
