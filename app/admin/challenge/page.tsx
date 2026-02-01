'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, Wand2, Check, X } from 'lucide-react';

export default function ChallengeAdmin() {
    const [day, setDay] = useState('');
    const [texts, setTexts] = useState([
        { title: '', author: '' },
        { title: '', author: '' },
        { title: '', author: '' }
    ]);
    const [generatedPost, setGeneratedPost] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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
                body: JSON.stringify({ day, texts })
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

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-serif font-bold tracking-tight">Ray Bradbury Challenge</h1>
                <p className="text-muted-foreground">Log your daily progress and share it on X.</p>
            </div>

            <Card className="border-border/50 bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg">Daily Log</CardTitle>
                    <CardDescription>Enter the day number and the pieces you've read today.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="day">Challenge Day</Label>
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
                        <Label>Reading List</Label>
                        {texts.map((text, i) => (
                            <div key={i} className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-background/50 border border-border/40">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase opacity-60">Title {i + 1}</Label>
                                    <Input
                                        placeholder="Title"
                                        value={text.title}
                                        onChange={(e) => handleTextChange(i, 'title', e.target.value)}
                                        className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase opacity-60">Author {i + 1}</Label>
                                    <Input
                                        placeholder="Author"
                                        value={text.author}
                                        onChange={(e) => handleTextChange(i, 'author', e.target.value)}
                                        className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>
                        ))}
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
                        Generate X Post
                    </Button>
                </CardContent>
            </Card>

            {generatedPost && (
                <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            Draft Post
                            <Button variant="ghost" size="sm" onClick={() => setGeneratedPost('')}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-6 bg-background rounded-xl border border-border/50 font-serif text-lg leading-relaxed shadow-inner whitespace-pre-wrap">
                            {generatedPost}
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={postToX}
                                className="flex-1 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90"
                                disabled={isPosting}
                            >
                                {isPosting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Approve & Post to X
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
