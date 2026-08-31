'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, Wand2, Check, X, Maximize2, Minimize2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ChallengeAdmin() {
    const { data: session } = useSession();
    const currentStreak = (session?.user as any)?.currentStreak || 0;
    const { t } = useLanguage();

    const [day, setDay] = useState('');
    const [pattern, setPattern] = useState<'austere' | 'atmospheric' | 'resonance'>('austere');
    const [texts, setTexts] = useState([
        { title: '', author: '' },
        { title: '', author: '' },
        { title: '', author: '' }
    ]);
    const [generatedPost, setGeneratedPost] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isPostExpanded, setIsPostExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
    const [completions, setCompletions] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

    const generateWeeklyRecap = () => {
        const daysCount = Math.min(completions.length, 7);
        const last7 = completions.slice(0, daysCount);
        
        const allTexts: any[] = [];
        last7.forEach(c => {
            if (Array.isArray(c.contentIds)) {
                allTexts.push(...c.contentIds);
            }
        });
        
        const totalTextsCount = allTexts.length;
        
        let totalMinutes = 0;
        allTexts.forEach(t => {
            if (t.readTime) {
                const match = t.readTime.match(/(\d+)/);
                if (match) {
                    totalMinutes += parseInt(match[1]);
                } else if (t.estimatedWords) {
                    totalMinutes += Math.ceil(t.estimatedWords / 200);
                }
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

Tomorrow we start week ${nextWeek}.`;

        setGeneratedPost(postDraft);
        setStatus(null);
    };

    const loadTodaysReadings = () => {
        const now = new Date();
        const todayStr = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).toDateString();
        
        const todaysCompletion = completions.find(c => {
            const compDateStr = new Date(c.date).toDateString();
            return compDateStr === todayStr;
        });

        if (todaysCompletion && Array.isArray(todaysCompletion.contentIds) && todaysCompletion.contentIds.length > 0) {
            const newTexts = [
                { title: '', author: '' },
                { title: '', author: '' },
                { title: '', author: '' }
            ];
            todaysCompletion.contentIds.forEach((t: any, index: number) => {
                if (index < 3) {
                    newTexts[index] = {
                        title: t.title || '',
                        author: t.author || ''
                    };
                }
            });
            setTexts(newTexts);
            setDay(String(currentStreak));
            setStatus({ type: 'success', message: "Successfully auto-filled today's completed texts!" });
        } else {
            setStatus({ type: 'error', message: "No completed readings found for today in history." });
        }
    };

    const handleTextChange = (index: number, field: 'title' | 'author', value: string) => {
        const newTexts = [...texts];
        newTexts[index][field] = value;
        setTexts(newTexts);
    };

    const generatePost = async () => {
        setIsGenerating(true);
        setStatus(null);
        try {
            const res = await fetch('/api/admin/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ day, texts, pattern })
            });
            const data = await res.json();
            if (data.post) {
                setGeneratedPost(data.post);
            } else {
                throw new Error(data.error || 'Failed to generate');
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsGenerating(false);
        }
    };

    const postToX = async () => {
        setIsPosting(true);
        try {
            const res = await fetch('/api/admin/post-x', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post: generatedPost })
            });
            const data = await res.json();
            if (data.success) {
                setStatus({ type: 'success', message: 'Successfully posted to X!' });
                setGeneratedPost('');
            } else {
                throw new Error(data.error || 'Failed to post');
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsPosting(false);
        }
    };

    const patternOptions = [
        { id: 'austere', name: t('challenge.austere'), desc: t('challenge.austerDesc') },
        { id: 'atmospheric', name: t('challenge.atmospheric'), desc: t('challenge.atmosDesc') },
        { id: 'resonance', name: t('challenge.resonance'), desc: t('challenge.resonDesc') }
    ];

    return (
        <div className="max-w-2xl mx-auto py-6 md:py-10 space-y-6 md:space-y-8 px-2">
            <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">{t('challenge.title')}</h1>
                <p className="text-muted-foreground text-sm md:text-base">{t('challenge.subtitle')}</p>
            </div>

            <div className="flex gap-2 border-b border-border/50 pb-2">
                <button
                    onClick={() => { setActiveTab('daily'); setStatus(null); }}
                    className={`pb-2 px-4 text-sm font-semibold transition-colors border-b-2 ${
                        activeTab === 'daily' 
                            ? 'border-primary text-foreground' 
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Daily Log
                </button>
                <button
                    onClick={() => { setActiveTab('weekly'); setStatus(null); }}
                    className={`pb-2 px-4 text-sm font-semibold transition-colors border-b-2 ${
                        activeTab === 'weekly' 
                            ? 'border-primary text-foreground' 
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Weekly Recap
                </button>
            </div>

            {activeTab === 'daily' && (
                <Card className="border-border/50 bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg">{t('challenge.dailyLog')}</CardTitle>
                        <CardDescription>{t('challenge.dailyLogDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {completions.some(c => new Date(c.date).toDateString() === new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).toDateString()) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={loadTodaysReadings}
                                className="w-full border-dashed border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors text-xs py-2.5 h-auto font-medium"
                            >
                                ⚡ Auto-Fill Today's Completed Readings
                            </Button>
                        )}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="day">{t('challenge.day')}</Label>
                                    {currentStreak > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            ({t('challenge.streak')}: <strong>{currentStreak} {t('challenge.streakDays')}</strong>)
                                        </span>
                                    )}
                                </div>
                                {currentStreak > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setDay(String(currentStreak))}
                                        className="text-xs text-primary hover:underline font-medium"
                                    >
                                        {t('challenge.useStreakDay')}
                                    </button>
                                )}
                            </div>
                            <Input
                                id="day"
                                type="number"
                                placeholder="e.g. 42"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label>{t('challenge.readingList')}</Label>
                            {texts.map((text, i) => (
                                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-background/50 border border-border/40">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase opacity-60">{t('challenge.title_n')} {i + 1}</Label>
                                        <Input
                                            placeholder={t('challenge.title_n')}
                                            value={text.title}
                                            onChange={(e) => handleTextChange(i, 'title', e.target.value)}
                                            className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase opacity-60">{t('challenge.author_n')} {i + 1}</Label>
                                        <Input
                                            placeholder={t('challenge.author_n')}
                                            value={text.author}
                                            onChange={(e) => handleTextChange(i, 'author', e.target.value)}
                                            className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label>{t('challenge.draftPattern')}</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {patternOptions.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setPattern(p.id as any)}
                                        className={`p-3 text-left rounded-xl border text-xs transition-all ${
                                            pattern === p.id
                                                ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/20'
                                                : 'border-border/40 hover:border-border bg-background/50 text-muted-foreground'
                                        }`}
                                    >
                                        <div className="font-semibold">{p.name}</div>
                                        <div className="text-[10px] opacity-70 mt-1 leading-snug">{p.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={generatePost}
                            className="w-full h-12 rounded-xl"
                            disabled={isGenerating || !day || texts.some(t => !t.title)}
                        >
                            {isGenerating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            {t('challenge.generatePost')}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'weekly' && (
                <Card className="border-border/50 bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg">Weekly Recap Generator</CardTitle>
                        <CardDescription>
                            Generate a summary of your readings from the past 7 days to post on X.
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
                                    No completions found in your reading history.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-background/50 border border-border/40 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Streak:</span>
                                        <span className="font-semibold">{currentStreak} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Recap Period:</span>
                                        <span className="font-semibold">Past {Math.min(completions.length, 7)} reading days</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={generateWeeklyRecap}
                                    className="w-full h-12 rounded-xl"
                                >
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Generate Weekly Recap Post
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {generatedPost && (
                <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                            {t('challenge.draftPost')}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsPostExpanded(!isPostExpanded)}
                                    title={isPostExpanded ? t('challenge.collapse') : t('challenge.expand')}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground min-w-[44px]"
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
                        <div className="relative group">
                            <Textarea
                                value={generatedPost}
                                onChange={(e) => setGeneratedPost(e.target.value)}
                                className={`w-full p-4 md:p-6 bg-background rounded-xl border border-border/50 font-serif text-base md:text-lg leading-relaxed shadow-inner transition-all duration-300 ${
                                    isPostExpanded ? 'min-h-[250px] md:min-h-[400px]' : 'min-h-[120px] md:min-h-[160px]'
                                } resize-y`}
                                placeholder="Draft your post..."
                            />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1 text-xs">
                            <span className="text-muted-foreground">
                                {t('challenge.editHint')}
                            </span>
                            <span className={`font-semibold px-2 py-0.5 rounded-full ${
                                generatedPost.length > 280 
                                    ? 'bg-destructive/10 text-destructive animate-pulse' 
                                    : 'bg-muted text-muted-foreground'
                            }`}>
                                {generatedPost.length} / 280 {t('challenge.chars')}
                            </span>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button
                                onClick={postToX}
                                className="flex-1 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium transition-transform active:scale-[0.98]"
                                disabled={isPosting}
                            >
                                {isPosting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                {t('challenge.approvePost')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in zoom-in duration-300 ${status.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                    {status.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    <p className="text-sm font-medium">{status.message}</p>
                </div>
            )}
        </div>
    );
}
