'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Loader2, Send, Wand2, Check, X, Maximize2, Minimize2,
    Twitter, Quote, Sparkles, Copy, BookOpen, ExternalLink,
    CheckCircle2, Flame, Globe
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ChallengeAdmin() {
    const { data: session } = useSession();
    const currentStreak = (session?.user as any)?.currentStreak || 0;
    const { t } = useLanguage();

    const [day, setDay] = useState('');
    const [pattern, setPattern] = useState<'austere' | 'atmospheric' | 'resonance'>('austere');
    const [texts, setTexts] = useState([
        { title: '', author: '', type: 'short_story', note: '' },
        { title: '', author: '', type: 'poem', note: '' },
        { title: '', author: '', type: 'idea', note: '' }
    ]);
    const [contentIds, setContentIds] = useState<string[]>([]);
    const [personalNote, setPersonalNote] = useState('');
    const [mood, setMood] = useState('');
    const [ctaStrength, setCtaStrength] = useState<'soft' | 'medium' | 'strong'>('soft');

    // Generated Post States
    const [generatedPost, setGeneratedPost] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [postingVariant, setPostingVariant] = useState<string | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isPostExpanded, setIsPostExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'quote'>('daily');
    const [completions, setCompletions] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // DeepSeek 3-Variant State
    const [generationResult, setGenerationResult] = useState<{
        variantA: { text: string; charCount: number };
        variantB: { text: string; charCount: number };
        variantC: { text: string; charCount: number };
        thread?: string[];
        recommended: 'A' | 'B' | 'C' | string;
        recommendationReason: string;
    } | null>(null);

    // /today Ritual Sync State
    const [isSavingRitual, setIsSavingRitual] = useState(false);
    const [isRitualLive, setIsRitualLive] = useState(false);

    // Quote of the Day State
    const [quoteTexts, setQuoteTexts] = useState<any[]>([]);
    const [selectedContentId, setSelectedContentId] = useState<string>('');
    const [quoteOptions, setQuoteOptions] = useState<any[]>([]);
    const [isExtractingQuotes, setIsExtractingQuotes] = useState(false);
    const [selectedQuoteIdx, setSelectedQuoteIdx] = useState<number | null>(null);

    const checkExistingRitual = useCallback(async (dayNum: number | string) => {
        if (!dayNum) return;
        try {
            const res = await fetch(`/api/admin/daily-ritual?day=${dayNum}`);
            const data = await res.json();
            if (data.ritual) {
                setIsRitualLive(true);
                if (data.ritual.note && !personalNote) setPersonalNote(data.ritual.note);
                if (data.ritual.mood && !mood) setMood(data.ritual.mood);
            } else {
                setIsRitualLive(false);
            }
        } catch (e) {
            console.error('Error checking ritual:', e);
        }
    }, [personalNote, mood]);

    useEffect(() => {
        if (session) {
            setIsLoadingHistory(true);
            fetch('/api/completions')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setCompletions(data);
                    }
                })
                .catch(err => console.error("Error loading completions:", err))
                .finally(() => setIsLoadingHistory(false));
        }
    }, [session]);

    useEffect(() => {
        if (currentStreak > 0 && !day) {
            setDay(String(currentStreak));
            checkExistingRitual(currentStreak);
        }
    }, [currentStreak, day, checkExistingRitual]);

    const loadTodaysReadings = () => {
        const now = new Date();
        const todayStr = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).toDateString();

        const todaysCompletion = completions.find(c => {
            const compDateStr = new Date(c.date).toDateString();
            return compDateStr === todayStr;
        }) || completions[0]; // fallback to most recent if none completed today

        if (todaysCompletion && Array.isArray(todaysCompletion.contentIds) && todaysCompletion.contentIds.length > 0) {
            const newTexts = [
                { title: '', author: '', type: 'short_story', note: '' },
                { title: '', author: '', type: 'poem', note: '' },
                { title: '', author: '', type: 'idea', note: '' }
            ];
            const ids: string[] = [];

            todaysCompletion.contentIds.forEach((t: any, index: number) => {
                if (index < 3) {
                    newTexts[index] = {
                        title: t.title || '',
                        author: t.author || '',
                        type: t.type || (index === 0 ? 'short_story' : index === 1 ? 'poem' : 'idea'),
                        note: ''
                    };
                    if (t._id) ids.push(t._id);
                }
            });

            setTexts(newTexts);
            setContentIds(ids);
            const targetDay = currentStreak ? String(currentStreak) : day;
            if (targetDay) {
                setDay(targetDay);
                checkExistingRitual(targetDay);
            }
            setStatus({ type: 'success', message: "Successfully loaded texts from reading history!" });
        } else {
            setStatus({ type: 'error', message: "No completed readings found in history." });
        }
    };

    const saveAsTodayRitual = async () => {
        if (!day || contentIds.length === 0) {
            setStatus({ type: 'error', message: "Please auto-fill or enter readings first (with DB content IDs)." });
            return;
        }
        setIsSavingRitual(true);
        setStatus(null);
        try {
            const res = await fetch('/api/admin/daily-ritual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dayNumber: Number(day),
                    contentIds,
                    note: personalNote,
                    mood,
                    xPostText: generatedPost
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsRitualLive(true);
                setStatus({ type: 'success', message: `Day ${day} is now live on dailyreads.io/today and /day/${day}!` });
            } else {
                throw new Error(data.error || 'Failed to save ritual');
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsSavingRitual(false);
        }
    };

    const generateDeepSeekVariants = async () => {
        setIsGenerating(true);
        setStatus(null);
        try {
            const res = await fetch('/api/admin/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    day: Number(day) || 34,
                    texts,
                    personalNote,
                    mood,
                    ctaStrength,
                    pattern
                })
            });
            const data = await res.json();
            if (data.success) {
                setGenerationResult({
                    variantA: data.variantA,
                    variantB: data.variantB,
                    variantC: data.variantC,
                    thread: data.thread,
                    recommended: data.recommended,
                    recommendationReason: data.recommendationReason
                });
                // Auto-load recommended variant into workbench
                const recommendedKey = `variant${data.recommended}` as 'variantA' | 'variantB' | 'variantC';
                if (data[recommendedKey]?.text) {
                    setGeneratedPost(data[recommendedKey].text);
                } else if (data.post) {
                    setGeneratedPost(data.post);
                }
                setStatus({ type: 'success', message: `Generated 3 variants! DeepSeek recommends Variante ${data.recommended}.` });
            } else {
                throw new Error(data.error || 'Failed to generate');
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsGenerating(false);
        }
    };

    const postToX = async (overrideText?: string, isThread = false) => {
        const textToPost = overrideText || generatedPost;
        if (!textToPost && !isThread) return;

        setIsPosting(true);
        setStatus(null);
        try {
            const payload: any = {};
            if (isThread && generationResult?.thread) {
                payload.thread = generationResult.thread;
            } else {
                payload.post = textToPost;
            }

            const res = await fetch('/api/admin/post-x', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setStatus({ type: 'success', message: isThread ? 'Successfully posted 3-tweet thread to X!' : 'Successfully posted to X!' });
                // If ritual is active, update published status
                if (day && contentIds.length > 0) {
                    fetch('/api/admin/daily-ritual', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            dayNumber: Number(day),
                            contentIds,
                            note: personalNote,
                            mood,
                            publishedToX: true,
                            xPostText: textToPost
                        })
                    }).catch(console.error);
                }
            } else {
                throw new Error(data.error || 'Failed to post');
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsPosting(false);
            setPostingVariant(null);
        }
    };

    const handleTextChange = (index: number, field: 'title' | 'author' | 'note', value: string) => {
        const newTexts = [...texts];
        newTexts[index][field] = value;
        setTexts(newTexts);
    };

    const generateWeeklyRecap = () => {
        const daysCount = Math.min(completions.length, 7);
        const last7 = completions.slice(0, daysCount);
        const allTexts: any[] = [];
        last7.forEach(c => {
            if (Array.isArray(c.contentIds)) allTexts.push(...c.contentIds);
        });

        const totalTextsCount = allTexts.length;
        let totalMinutes = 0;
        allTexts.forEach(t => {
            if (t.readTime) {
                const match = t.readTime.match(/(\d+)/);
                if (match) totalMinutes += parseInt(match[1]);
                else if (t.estimatedWords) totalMinutes += Math.ceil(t.estimatedWords / 200);
            } else if (t.estimatedWords) {
                totalMinutes += Math.ceil(t.estimatedWords / 200);
            }
        });

        const authors = new Set(allTexts.map(t => t.author).filter(Boolean));
        const totalAuthors = authors.size;

        let bestTextStr = '';
        if (allTexts.length > 0) {
            const randomIndex = Math.floor(Math.random() * allTexts.length);
            const chosen = allTexts[randomIndex];
            bestTextStr = `"${chosen.title}" by ${chosen.author}`;
        }

        const nextWeek = Math.floor(currentStreak / 7) + 1;
        const postDraft = `[Another] 7 days of DailyReads.

${totalTextsCount} texts.
${totalMinutes} minutes reading.
${totalAuthors} authors.

Best one so far: ${bestTextStr}

Tomorrow we start week ${nextWeek}.
→ dailyreads.io/today`;

        setGeneratedPost(postDraft);
        setStatus(null);
    };

    const loadQuoteCandidates = async () => {
        try {
            const res = await fetch('/api/admin/generate-quote');
            const data = await res.json();
            if (data.texts && data.texts.length > 0) {
                setQuoteTexts(data.texts);
                if (!selectedContentId) setSelectedContentId(data.texts[0].id);
            }
        } catch (e) {
            console.error("Error loading quote candidates:", e);
        }
    };

    const extractQuotes = async (contentId?: string) => {
        setIsExtractingQuotes(true);
        setStatus(null);
        try {
            const idToUse = contentId || selectedContentId;
            const res = await fetch('/api/admin/generate-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentId: idToUse,
                    streakDay: currentStreak || day
                })
            });
            const data = await res.json();
            if (data.success && data.quotes && data.quotes.length > 0) {
                setQuoteOptions(data.quotes);
                setSelectedQuoteIdx(0);
                setGeneratedPost(data.quotes[0].formattedPost);
                setStatus({ type: 'success', message: `Extracted ${data.quotes.length} quotes from "${data.sourceTitle}"!` });
            } else {
                throw new Error(data.error || 'Failed to extract quotes');
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsExtractingQuotes(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-6 md:py-10 space-y-6 md:space-y-8 px-2">
            {/* Top Bar with Status and Quick Links */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
                            DailyReads Admin
                        </h1>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
                            70-Day Bradbury
                        </span>
                    </div>
                    <p className="text-muted-foreground text-xs md:text-sm">
                        Synchronize /today reading rituals & generate high-converting X posts with DeepSeek.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/today" target="_blank">
                        <Button variant="outline" size="sm" className="text-xs shrink-0 flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-emerald-500" />
                            <span>View /today</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                        </Button>
                    </Link>
                    <Link href="/admin/x-suggestions">
                        <Button variant="outline" size="sm" className="text-xs shrink-0 border-sky-500/30 hover:border-sky-500/60 text-sky-600 dark:text-sky-400">
                            <Twitter className="mr-1.5 h-3.5 w-3.5 text-sky-500" />
                            X Suggestions
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Navigation Tabs (Mobile Scrollable) */}
            <div className="flex gap-2 border-b border-border/50 pb-2 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
                <button
                    onClick={() => { setActiveTab('daily'); setStatus(null); }}
                    className={`pb-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'daily'
                            ? 'border-primary text-foreground'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                    <span>Daily Ritual & DeepSeek</span>
                </button>
                <button
                    onClick={() => { setActiveTab('quote'); setStatus(null); loadQuoteCandidates(); }}
                    className={`pb-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'quote'
                            ? 'border-primary text-foreground'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Quote className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Quote of the Day</span>
                </button>
                <button
                    onClick={() => { setActiveTab('weekly'); setStatus(null); }}
                    className={`pb-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 shrink-0 ${
                        activeTab === 'weekly'
                            ? 'border-primary text-foreground'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Weekly Recap
                </button>
            </div>

            {activeTab === 'daily' && (
                <div className="space-y-6">
                    {/* Main Card: Day Data & Sync */}
                    <Card className="border-border/50 bg-muted/30">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <span>1. Tagesdaten & Ritual (/today)</span>
                                        {isRitualLive ? (
                                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Live on /today
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                Not synchronized yet
                                            </span>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        Alle Informationen kommen direkt aus der DB. Keine manuellen Inputs nötig.
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={loadTodaysReadings}
                                    className="text-xs h-9 border-dashed border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors font-medium shrink-0"
                                >
                                    ⚡ Auto-Fill Today's Completed Readings
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="day">Day Number</Label>
                                        {currentStreak > 0 && (
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                Streak: {currentStreak}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        id="day"
                                        type="number"
                                        placeholder="e.g. 34"
                                        value={day}
                                        onChange={(e) => {
                                            setDay(e.target.value);
                                            checkExistingRitual(e.target.value);
                                        }}
                                        className="bg-background/50 font-mono font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mood">Mood (optional)</Label>
                                    <Input
                                        id="mood"
                                        placeholder="e.g. quiet morning, focused"
                                        value={mood}
                                        onChange={(e) => setMood(e.target.value)}
                                        className="bg-background/50 text-xs"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>CTA-Stärke</Label>
                                    <div className="grid grid-cols-3 gap-1 bg-background/50 p-1 rounded-lg border border-border/40 text-xs">
                                        {(['soft', 'medium', 'strong'] as const).map(level => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setCtaStrength(level)}
                                                className={`py-1 text-center rounded capitalize font-medium transition-all ${
                                                    ctaStrength === level
                                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 3 Readings (Poem, Essay/Idea, Story) */}
                            <div className="space-y-3">
                                <Label className="text-xs uppercase text-muted-foreground font-semibold flex items-center justify-between">
                                    <span>Die drei Stücke (Bradbury-Trio):</span>
                                    {contentIds.length > 0 && (
                                        <span className="text-[10px] text-emerald-500 font-mono font-bold">
                                            ✓ {contentIds.length} DB-Texte verknüpft
                                        </span>
                                    )}
                                </Label>
                                {texts.map((text, i) => {
                                    const typeLabel = i === 0 ? 'Short Story' : i === 1 ? 'Poem' : 'Idea / Essay';
                                    return (
                                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-background/60 border border-border/40">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-mono opacity-60">
                                                    {typeLabel} — Titel
                                                </Label>
                                                <Input
                                                    placeholder="Titel des Werks"
                                                    value={text.title}
                                                    onChange={(e) => handleTextChange(i, 'title', e.target.value)}
                                                    className="bg-transparent border-none text-sm font-serif font-bold p-1 h-8 focus-visible:ring-1 focus-visible:ring-primary/20"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-mono opacity-60">
                                                    Autor
                                                </Label>
                                                <Input
                                                    placeholder="Autor"
                                                    value={text.author}
                                                    onChange={(e) => handleTextChange(i, 'author', e.target.value)}
                                                    className="bg-transparent border-none text-xs p-1 h-8 focus-visible:ring-1 focus-visible:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Personal Note */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="personalNote">
                                        Persönliche Notiz / Tages-Gedanke (optional)
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">
                                        Wird für persönliche Hooks in Variante A/B/C genutzt
                                    </span>
                                </div>
                                <Textarea
                                    id="personalNote"
                                    placeholder="z.B. In Germany we say: Mehr sein als scheinen. Oder: The dialect fought me this morning."
                                    value={personalNote}
                                    onChange={(e) => setPersonalNote(e.target.value)}
                                    rows={2}
                                    className="bg-background/50 text-sm font-serif resize-none"
                                />
                            </div>

                            {/* Actions: Save as /today & Generate Posts */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={saveAsTodayRitual}
                                    disabled={isSavingRitual || !day || contentIds.length === 0}
                                    className="h-11 rounded-xl flex-1 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium"
                                >
                                    {isSavingRitual ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Globe className="mr-2 h-4 w-4 text-emerald-500" />
                                    )}
                                    Als heutige Auswahl (/today) veröffentlichen
                                </Button>

                                <Button
                                    type="button"
                                    onClick={generateDeepSeekVariants}
                                    disabled={isGenerating || !day || texts.some(t => !t.title)}
                                    className="h-11 rounded-xl flex-1 bg-primary text-primary-foreground font-medium shadow-sm transition-transform active:scale-[0.99]"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            DeepSeek generiert 3 Varianten...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            3 X-Post Varianten generieren
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Generated Variants Display */}
                    {generationResult && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                                        <span>2. DeepSeek X-Post Varianten</span>
                                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            Empfohlen: Variante {generationResult.recommended}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-serif italic">
                                        💡 {generationResult.recommendationReason}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Variante A */}
                                <Card className={`flex flex-col justify-between rounded-2xl transition-all ${
                                    generationResult.recommended === 'A'
                                        ? 'border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30'
                                        : 'border-border/50 bg-background/60'
                                }`}>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm font-serif">Variante A</span>
                                            {generationResult.recommended === 'A' && (
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
                                                    ★ Beste
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                            Quote / Idea First
                                        </span>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1 flex-1">
                                        <p className="font-serif text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                                            {generationResult.variantA.text}
                                        </p>
                                    </CardContent>
                                    <div className="p-4 pt-2 border-t border-border/40 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                                generationResult.variantA.charCount > 280
                                                    ? 'bg-destructive/10 text-destructive'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {generationResult.variantA.charCount} / 280 Zeichen
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generationResult.variantA.text);
                                                    setStatus({ type: 'success', message: 'Variante A in die Zwischenablage kopiert!' });
                                                }}
                                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                                title="Kopieren"
                                            >
                                                <Copy className="h-3 w-3" /> Copy
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGeneratedPost(generationResult.variantA.text)}
                                                className="w-full text-xs h-8"
                                            >
                                                In Workbench laden
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setPostingVariant('A');
                                                    postToX(generationResult.variantA.text);
                                                }}
                                                disabled={isPosting}
                                                className="text-xs h-8 bg-sky-600 hover:bg-sky-500 text-white shrink-0 px-3"
                                            >
                                                {postingVariant === 'A' && isPosting ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Twitter className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                {/* Variante B */}
                                <Card className={`flex flex-col justify-between rounded-2xl transition-all ${
                                    generationResult.recommended === 'B'
                                        ? 'border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30'
                                        : 'border-border/50 bg-background/60'
                                }`}>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm font-serif">Variante B</span>
                                            {generationResult.recommended === 'B' && (
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
                                                    ★ Beste
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                            Ritual + Persönlich
                                        </span>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1 flex-1">
                                        <p className="font-serif text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                                            {generationResult.variantB.text}
                                        </p>
                                    </CardContent>
                                    <div className="p-4 pt-2 border-t border-border/40 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                                generationResult.variantB.charCount > 280
                                                    ? 'bg-destructive/10 text-destructive'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {generationResult.variantB.charCount} / 280 Zeichen
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generationResult.variantB.text);
                                                    setStatus({ type: 'success', message: 'Variante B in die Zwischenablage kopiert!' });
                                                }}
                                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                                title="Kopieren"
                                            >
                                                <Copy className="h-3 w-3" /> Copy
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGeneratedPost(generationResult.variantB.text)}
                                                className="w-full text-xs h-8"
                                            >
                                                In Workbench laden
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setPostingVariant('B');
                                                    postToX(generationResult.variantB.text);
                                                }}
                                                disabled={isPosting}
                                                className="text-xs h-8 bg-sky-600 hover:bg-sky-500 text-white shrink-0 px-3"
                                            >
                                                {postingVariant === 'B' && isPosting ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Twitter className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                {/* Variante C */}
                                <Card className={`flex flex-col justify-between rounded-2xl transition-all ${
                                    generationResult.recommended === 'C'
                                        ? 'border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30'
                                        : 'border-border/50 bg-background/60'
                                }`}>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm font-serif">Variante C</span>
                                            {generationResult.recommended === 'C' && (
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
                                                    ★ Beste
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                            Reflection / Teaser
                                        </span>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1 flex-1">
                                        <p className="font-serif text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                                            {generationResult.variantC.text}
                                        </p>
                                    </CardContent>
                                    <div className="p-4 pt-2 border-t border-border/40 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                                generationResult.variantC.charCount > 280
                                                    ? 'bg-destructive/10 text-destructive'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {generationResult.variantC.charCount} / 280 Zeichen
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generationResult.variantC.text);
                                                    setStatus({ type: 'success', message: 'Variante C in die Zwischenablage kopiert!' });
                                                }}
                                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                                title="Kopieren"
                                            >
                                                <Copy className="h-3 w-3" /> Copy
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGeneratedPost(generationResult.variantC.text)}
                                                className="w-full text-xs h-8"
                                            >
                                                In Workbench laden
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setPostingVariant('C');
                                                    postToX(generationResult.variantC.text);
                                                }}
                                                disabled={isPosting}
                                                className="text-xs h-8 bg-sky-600 hover:bg-sky-500 text-white shrink-0 px-3"
                                            >
                                                {postingVariant === 'C' && isPosting ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Twitter className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Optional Thread Option */}
                            {generationResult.thread && generationResult.thread.length > 0 && (
                                <Card className="border-border/40 bg-background/50 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-serif font-bold text-sm flex items-center gap-1.5">
                                            <Twitter className="h-3.5 w-3.5 text-sky-500" />
                                            <span>3-Tweet Thread Option</span>
                                        </span>
                                        <Button
                                            size="sm"
                                            onClick={() => postToX(undefined, true)}
                                            disabled={isPosting}
                                            className="text-xs h-8 bg-sky-600 hover:bg-sky-500 text-white"
                                        >
                                            Post Thread (3 Tweets) to X
                                        </Button>
                                    </div>
                                    <div className="space-y-2 text-xs font-serif">
                                        {generationResult.thread.map((tweet, tIdx) => (
                                            <div key={tIdx} className="p-2.5 rounded-lg bg-muted/40 border border-border/30">
                                                <span className="font-mono text-[10px] text-muted-foreground mr-1.5">
                                                    {tIdx + 1}/3:
                                                </span>
                                                {tweet}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Workbench: Edit & Publish Chosen Post */}
                    {generatedPost && (
                        <Card className="border-primary/30 bg-primary/5 rounded-2xl animate-in fade-in duration-300">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span>Aktiver Post-Draft (Workbench)</span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsPostExpanded(!isPostExpanded)}
                                            title={isPostExpanded ? "Verkleinern" : "Vergrößern"}
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        >
                                            {isPostExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setGeneratedPost('')}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={generatedPost}
                                    onChange={(e) => setGeneratedPost(e.target.value)}
                                    className={`w-full p-4 bg-background rounded-xl border border-border/50 font-serif text-base leading-relaxed resize-y ${
                                        isPostExpanded ? 'min-h-[280px]' : 'min-h-[140px]'
                                    }`}
                                    placeholder="Post-Text anpassen..."
                                />

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">
                                        Du kannst den Text vor dem Absenden beliebig anpassen.
                                    </span>
                                    <span className={`font-mono font-semibold px-2 py-0.5 rounded ${
                                        generatedPost.length > 280
                                            ? 'bg-destructive/10 text-destructive animate-pulse'
                                            : 'bg-muted text-muted-foreground'
                                    }`}>
                                        {generatedPost.length} / 280 Zeichen
                                    </span>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedPost);
                                            setStatus({ type: 'success', message: 'Post in die Zwischenablage kopiert!' });
                                        }}
                                        className="h-11 px-4 rounded-xl border-border/60 hover:bg-muted"
                                    >
                                        <Copy className="h-4 w-4 mr-1.5" />
                                        Kopieren
                                    </Button>
                                    <Button
                                        onClick={() => postToX()}
                                        className="flex-1 h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium"
                                        disabled={isPosting || generatedPost.length > 280}
                                    >
                                        {isPosting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="mr-2 h-4 w-4" />
                                        )}
                                        Freigeben & auf X veröffentlichen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === 'quote' && (
                <Card className="border-border/50 bg-muted/30 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg flex flex-wrap items-center justify-between gap-2">
                            <span className="flex items-center gap-2">
                                <Quote className="h-5 w-5 text-amber-500" />
                                Quote of the Day aus den heutigen Texten
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadQuoteCandidates}
                                className="text-xs h-8"
                            >
                                Texte neu laden
                            </Button>
                        </CardTitle>
                        <CardDescription>
                            DeepSeek extrahiert lyrische, denkwürdige Zitate aus deinen gelesenen Werken.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {quoteTexts.length > 0 ? (
                            <div className="space-y-4">
                                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                                    Text auswählen:
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {quoteTexts.map((text: any) => {
                                        const isSelected = selectedContentId === text.id;
                                        return (
                                            <div
                                                key={text.id || text.title}
                                                onClick={() => {
                                                    setSelectedContentId(text.id);
                                                    extractQuotes(text.id);
                                                }}
                                                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-amber-500/10 border-amber-500/60 shadow-xs'
                                                        : 'bg-background/60 border-border/40 hover:border-border'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1 uppercase">
                                                    <span>{text.type}</span>
                                                    {text.hasContent && (
                                                        <span className="text-emerald-500 font-bold">Volltext da</span>
                                                    )}
                                                </div>
                                                <div className="font-bold text-sm font-serif line-clamp-1">{text.title}</div>
                                                <div className="text-xs text-muted-foreground">by {text.author}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Button
                                    onClick={() => extractQuotes()}
                                    disabled={isExtractingQuotes}
                                    className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-xs"
                                >
                                    {isExtractingQuotes ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            DeepSeek kuratiert Zitate...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Zitate mit DeepSeek extrahieren
                                        </>
                                    )}
                                </Button>

                                {quoteOptions.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-border/40">
                                        <Label className="text-xs uppercase text-muted-foreground font-semibold flex items-center justify-between">
                                            <span>Kuratierte Zitate (Klicken zum Auswählen):</span>
                                            <span>{quoteOptions.length} Optionen</span>
                                        </Label>
                                        <div className="space-y-2.5">
                                            {quoteOptions.map((opt: any, idx: number) => {
                                                const isChosen = selectedQuoteIdx === idx;
                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            setSelectedQuoteIdx(idx);
                                                            setGeneratedPost(opt.formattedPost);
                                                        }}
                                                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                                            isChosen
                                                                ? 'bg-amber-500/10 border-amber-500 text-foreground shadow-xs'
                                                                : 'bg-background/60 border-border/40 hover:border-border text-muted-foreground'
                                                        }`}
                                                    >
                                                        <p className="font-serif italic text-sm leading-relaxed mb-2 text-foreground">
                                                            "{opt.quote}"
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs font-mono">
                                                            <span className="text-muted-foreground font-semibold">— {opt.author}, {opt.title}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                                                                opt.characterCount > 280 ? 'bg-rose-500/20 text-rose-400' : 'bg-muted text-foreground'
                                                            }`}>
                                                                {opt.characterCount} Zeichen
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 space-y-3">
                                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
                                <p className="text-sm text-muted-foreground">
                                    Keine Lese-Historie für heute gefunden. Lade die letzten gelesenen Texte:
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={loadQuoteCandidates}
                                    className="text-xs"
                                >
                                    Lese-Historie laden
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'weekly' && (
                <Card className="border-border/50 bg-muted/30 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Weekly Recap Generator</CardTitle>
                        <CardDescription>
                            Fasst die Lesungen der letzten 7 Tage zusammen und bereitet einen Wochenrückblick vor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoadingHistory ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : completions.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground">
                                    Noch keine Lese-Historie vorhanden.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-background/50 border border-border/40 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Aktueller Streak:</span>
                                        <span className="font-semibold">{currentStreak} Tage</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Recap-Zeitraum:</span>
                                        <span className="font-semibold">Letzte {Math.min(completions.length, 7)} Lesetage</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={generateWeeklyRecap}
                                    className="w-full h-11 rounded-xl"
                                >
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Weekly Recap Post generieren
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Status Feedback Banner */}
            {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in zoom-in duration-300 ${
                    status.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                    {status.type === 'success' ? <Check className="h-5 w-5 shrink-0" /> : <X className="h-5 w-5 shrink-0" />}
                    <p className="text-sm font-medium">{status.message}</p>
                </div>
            )}
        </div>
    );
}
