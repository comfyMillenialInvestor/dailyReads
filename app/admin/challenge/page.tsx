'use client';

import { useState } from 'react';
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

            <Card className="border-border/50 bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg">{t('challenge.dailyLog')}</CardTitle>
                    <CardDescription>{t('challenge.dailyLogDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
