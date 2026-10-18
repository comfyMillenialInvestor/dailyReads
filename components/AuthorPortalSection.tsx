'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    PenTool,
    Feather,
    BookOpen,
    Quote,
    Maximize2,
    Trash2,
    ArrowBigUp,
    ArrowBigDown,
    Loader2,
    PlusCircle,
    Trophy,
    ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AuthorUploadModal } from '@/components/AuthorUploadModal';
import { TextReaderModal } from '@/components/TextReaderModal';
import type { IContent } from '@/lib/models/Content';
import Link from 'next/link';

interface AuthorPortalSectionProps {
    userName?: string;
}

export function AuthorPortalSection({ userName }: AuthorPortalSectionProps) {
    const { lang } = useLanguage();
    const isDe = lang === 'de';

    const [texts, setTexts] = useState<IContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [readerItem, setReaderItem] = useState<IContent | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchMyTexts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/community/my-texts');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTexts(data);
                }
            }
        } catch (err) {
            console.error('Failed to load author texts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTexts();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        const confirmMsg = isDe
            ? `Möchtest du deinen Text „${title}“ wirklich unwiderruflich löschen?`
            : `Are you sure you want to permanently delete "${title}"?`;

        if (!window.confirm(confirmMsg)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/community/my-texts?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setTexts((prev) => prev.filter((item: any) => item._id !== id));
            } else {
                alert(isDe ? 'Fehler beim Löschen.' : 'Failed to delete text.');
            }
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleUploadSuccess = (newItem: IContent) => {
        setTexts((prev) => [newItem, ...prev]);
    };

    const totalUpvotes = texts.reduce((acc, t: any) => acc + (t.upvotes || 0), 0);
    const totalScore = texts.reduce((acc, t: any) => acc + (t.score || 0), 0);

    const getTypeIcon = (type: string) => {
        if (type === 'poem') return <Feather className="h-3.5 w-3.5 text-primary" />;
        if (type === 'quote' || type === 'idea') return <Quote className="h-3.5 w-3.5 text-amber-500" />;
        return <BookOpen className="h-3.5 w-3.5 text-blue-500" />;
    };

    const getTypeLabel = (type: string) => {
        if (type === 'poem') return isDe ? 'Gedicht' : 'Poem';
        if (type === 'quote' || type === 'idea') return isDe ? 'Zitat' : 'Quote';
        return isDe ? 'Kurzgeschichte' : 'Short Story';
    };

    return (
        <>
            <Card id="author-studio" className="border-border/60 bg-card overflow-hidden scroll-mt-24 shadow-sm">
                <CardHeader className="border-b border-border/40 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <PenTool className="h-4 w-4" />
                                </div>
                                <CardTitle className="text-lg font-serif">
                                    {isDe ? 'Autorenbereich & Eigene Werke' : "Writer's Studio & Publications"}
                                </CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                {isDe
                                    ? 'Veröffentliche eigene Texte unter der Kategorie Community. Leser können deine Werke bewerten.'
                                    : 'Publish your own creative works in the Community category. Readers can vote and rank your writing.'}
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="text-xs"
                            >
                                <Link href="/community" className="flex items-center gap-1.5">
                                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                    <span>{isDe ? 'Leaderboard ansehen' : 'View Leaderboard'}</span>
                                </Link>
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => setModalOpen(true)}
                                className="shadow-sm text-xs font-semibold"
                            >
                                <PlusCircle className="mr-1.5 h-4 w-4" />
                                {isDe ? 'Text veröffentlichen' : 'Publish Text'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-5 space-y-5">
                    {/* Author Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                            <div className="text-2xl font-bold font-mono">{texts.length}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                {isDe ? 'Veröffentlicht' : 'Published'}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                            <div className="text-2xl font-bold font-mono text-emerald-500">
                                {totalUpvotes}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                {isDe ? 'Upvotes erhalten' : 'Upvotes'}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                            <div className="text-2xl font-bold font-mono text-primary">
                                {totalScore > 0 ? `+${totalScore}` : totalScore}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                {isDe ? 'Gesamt-Score' : 'Total Score'}
                            </div>
                        </div>
                    </div>

                    {/* Texts List */}
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : texts.length === 0 ? (
                        <div className="text-center py-10 px-4 border border-dashed rounded-xl bg-muted/10 space-y-3">
                            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Feather className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-serif font-bold text-sm">
                                    {isDe ? 'Noch keine eigenen Texte veröffentlicht' : 'No published writings yet'}
                                </p>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    {isDe
                                        ? 'Teile deine Kurzgeschichten, Gedichte oder Gedanken mit der Daily Reads Community. Du behältst 100 % deiner Rechte.'
                                        : 'Share your short stories, poems, or quotes with fellow ritualists. You retain 100% of your copyright.'}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModalOpen(true)}
                                className="mt-2 text-xs"
                            >
                                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                                {isDe ? 'Erstes Werk verfassen' : 'Write your first piece'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {texts.map((item: any) => (
                                <div
                                    key={item._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/20 transition-all gap-3"
                                >
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                                                {getTypeIcon(item.type)}
                                                {getTypeLabel(item.type)}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {new Date(item.createdAt).toLocaleDateString(isDe ? 'de-DE' : 'en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            {item.readTime && (
                                                <span className="text-[11px] text-muted-foreground opacity-75">
                                                    • {item.readTime}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="font-serif font-bold text-sm text-foreground truncate">
                                            {isDe && item.title_de ? item.title_de : (item.title_en || item.title)}
                                        </h4>
                                    </div>

                                    {/* Stats & Actions */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/20">
                                        {/* Voting Score Pill */}
                                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/40 border border-border/40 text-xs font-mono">
                                            <span className="flex items-center gap-0.5 text-emerald-500 font-semibold" title="Upvotes">
                                                <ArrowBigUp className="h-3.5 w-3.5 fill-current" />
                                                {item.upvotes || 0}
                                            </span>
                                            <span className="opacity-30">|</span>
                                            <span className="flex items-center gap-0.5 text-rose-500 font-semibold" title="Downvotes">
                                                <ArrowBigDown className="h-3.5 w-3.5 fill-current" />
                                                {item.downvotes || 0}
                                            </span>
                                            <span className="opacity-30">|</span>
                                            <span className="font-bold text-foreground">
                                                {(item.score || 0) > 0 ? `+${item.score}` : item.score || 0}
                                            </span>
                                        </div>

                                        {/* Read Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setReaderItem(item)}
                                            className="h-8 px-2.5 text-xs text-primary hover:bg-primary/10"
                                            title={isDe ? 'Im Vollbild-Reader lesen' : 'Read in Fullscreen'}
                                        >
                                            <Maximize2 className="h-3.5 w-3.5 mr-1" />
                                            {isDe ? 'Lesen' : 'Read'}
                                        </Button>

                                        {/* Delete Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={deletingId === item._id}
                                            onClick={() => handleDelete(item._id, item.title)}
                                            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            title={isDe ? 'Werk löschen' : 'Delete'}
                                        >
                                            {deletingId === item._id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Author Upload Modal */}
            <AuthorUploadModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={handleUploadSuccess}
                defaultAuthorName={userName}
            />

            {/* Standard Full-Screen Text Reader Thing */}
            <TextReaderModal
                item={readerItem}
                onClose={() => setReaderItem(null)}
            />
        </>
    );
}
