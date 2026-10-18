'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Trophy,
    Feather,
    BookOpen,
    Quote,
    Maximize2,
    Crown,
    Medal,
    Award,
    PenTool,
    Loader2,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Library,
    Users,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CommunityVoteButtons } from '@/components/CommunityVoteButtons';
import { TextReaderModal } from '@/components/TextReaderModal';
import { AuthorUploadModal } from '@/components/AuthorUploadModal';
import type { IContent } from '@/lib/models/Content';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function CommunityLeaderboardPage() {
    const { lang } = useLanguage();
    const isDe = lang === 'de';
    const { data: session } = useSession();

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sourceFilter, setSourceFilter] = useState<'all' | 'community' | 'classic'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'short_story' | 'poem' | 'quote'>('all');
    const [sortBy, setSortBy] = useState<'top' | 'upvoted' | 'newest'>('top');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [readerItem, setReaderItem] = useState<IContent | null>(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('source', sourceFilter);
            if (typeFilter !== 'all') params.append('type', typeFilter);
            params.append('sort', sortBy);
            params.append('t', Date.now().toString());

            const res = await fetch(`/api/community/leaderboard?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                if (data.items) {
                    setItems(data.items);
                }
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [sourceFilter, typeFilter, sortBy]);

    const handleUploadSuccess = (newItem: IContent) => {
        fetchLeaderboard();
    };

    const toggleExpand = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

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

    const getRankBadge = (rank: number) => {
        if (rank === 1) {
            return (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-xs shadow-sm shrink-0">
                    <Crown className="h-4 w-4 fill-amber-500 text-amber-500" />
                </div>
            );
        }
        if (rank === 2) {
            return (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/15 border border-slate-400/40 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm shrink-0">
                    <Medal className="h-4 w-4 fill-slate-400 text-slate-400" />
                </div>
            );
        }
        if (rank === 3) {
            return (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/15 border border-amber-700/40 text-amber-800 dark:text-amber-600 font-bold text-xs shadow-sm shrink-0">
                    <Award className="h-4 w-4 fill-amber-700 text-amber-700" />
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/60 border border-border/50 text-muted-foreground font-mono font-semibold text-xs shrink-0">
                #{rank}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-6 px-2 md:px-4 animate-in fade-in duration-500">
            {/* Header Hero */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-primary/20 bg-primary/5 text-primary shadow-sm">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span>{isDe ? 'Literarisches Ranking & Bestenliste' : 'Literary Rankings & Leaderboard'}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
                    {isDe ? 'Die beliebtesten Werke bei Daily Reads' : 'Top Voted Reads on Daily Reads'}
                </h1>

                <p className="text-muted-foreground text-xs md:text-sm italic leading-relaxed">
                    {isDe
                        ? 'Stimme für alle Geschichten, Gedichte und Gedanken ab. Lies deine Favoriten direkt im ungestörten Vollbild-Reader.'
                        : 'Vote on all stories, poems, and ideas. Read your favorites instantly in our full-screen reader.'}
                </p>

                {/* Call to action for writers */}
                <div className="pt-1 flex items-center justify-center gap-3">
                    {session ? (
                        <Button
                            onClick={() => setUploadModalOpen(true)}
                            size="sm"
                            className="shadow-sm rounded-full px-5 text-xs font-semibold"
                        >
                            <PenTool className="mr-1.5 h-3.5 w-3.5" />
                            {isDe ? 'Eigenes Werk veröffentlichen' : 'Publish Your Story'}
                        </Button>
                    ) : (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-full px-5 text-xs border-primary/30 hover:bg-primary/5"
                        >
                            <Link href="/auth/login">
                                <PenTool className="mr-1.5 h-3.5 w-3.5 text-primary" />
                                {isDe ? 'Anmelden & Werk einreichen' : 'Sign in to Publish'}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Navigation Bar */}
            <div className="p-3.5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-3">
                {/* Row 1: Source Tabs (All / Community / Classics) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-2.5 border-b border-border/40">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                        <Button
                            size="sm"
                            variant={sourceFilter === 'all' ? 'default' : 'ghost'}
                            onClick={() => setSourceFilter('all')}
                            className="rounded-xl text-xs h-7 px-3 flex items-center gap-1.5"
                        >
                            <Sparkles className="h-3 w-3" />
                            <span>{isDe ? 'Alle Werke' : 'All Stories'}</span>
                        </Button>

                        <Button
                            size="sm"
                            variant={sourceFilter === 'community' ? 'default' : 'ghost'}
                            onClick={() => setSourceFilter('community')}
                            className="rounded-xl text-xs h-7 px-3 flex items-center gap-1.5"
                        >
                            <Users className="h-3 w-3" />
                            <span>{isDe ? 'Community-Autoren' : 'Community Writers'}</span>
                        </Button>

                        <Button
                            size="sm"
                            variant={sourceFilter === 'classic' ? 'default' : 'ghost'}
                            onClick={() => setSourceFilter('classic')}
                            className="rounded-xl text-xs h-7 px-3 flex items-center gap-1.5"
                        >
                            <Library className="h-3 w-3" />
                            <span>{isDe ? 'Kuratierte Klassiker' : 'Classics'}</span>
                        </Button>
                    </div>

                    {/* Sorting Buttons */}
                    <div className="flex items-center gap-1 border border-border/40 p-0.5 rounded-xl bg-muted/20 shrink-0">
                        <button
                            onClick={() => setSortBy('top')}
                            className={cn(
                                "px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all cursor-pointer",
                                sortBy === 'top' ? "bg-card shadow-sm text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isDe ? 'Top-Score' : 'Top Score'}
                        </button>
                        <button
                            onClick={() => setSortBy('upvoted')}
                            className={cn(
                                "px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all cursor-pointer",
                                sortBy === 'upvoted' ? "bg-card shadow-sm text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isDe ? 'Upvotes' : 'Most Upvoted'}
                        </button>
                        <button
                            onClick={() => setSortBy('newest')}
                            className={cn(
                                "px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all cursor-pointer",
                                sortBy === 'newest' ? "bg-card shadow-sm text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isDe ? 'Neueste' : 'Newest'}
                        </button>
                    </div>
                </div>

                {/* Row 2: Format Filter Pills (All / Stories / Poems / Quotes) */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mr-1 shrink-0">
                        {isDe ? 'Format:' : 'Format:'}
                    </span>
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                            typeFilter === 'all'
                                ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                : "text-muted-foreground hover:bg-muted/40"
                        )}
                    >
                        {isDe ? 'Alle' : 'All'}
                    </button>
                    <button
                        onClick={() => setTypeFilter('short_story')}
                        className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1",
                            typeFilter === 'short_story'
                                ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                : "text-muted-foreground hover:bg-muted/40"
                        )}
                    >
                        <BookOpen className="h-3 w-3" />
                        <span>{isDe ? 'Kurzgeschichten' : 'Stories'}</span>
                    </button>
                    <button
                        onClick={() => setTypeFilter('poem')}
                        className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1",
                            typeFilter === 'poem'
                                ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                : "text-muted-foreground hover:bg-muted/40"
                        )}
                    >
                        <Feather className="h-3 w-3" />
                        <span>{isDe ? 'Gedichte' : 'Poems'}</span>
                    </button>
                    <button
                        onClick={() => setTypeFilter('quote')}
                        className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1",
                            typeFilter === 'quote'
                                ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                : "text-muted-foreground hover:bg-muted/40"
                        )}
                    >
                        <Quote className="h-3 w-3" />
                        <span>{isDe ? 'Zitate & Gedanken' : 'Quotes'}</span>
                    </button>
                </div>
            </div>

            {/* Leaderboard List (Compact & Scannable) */}
            {loading ? (
                <div className="flex flex-col justify-center items-center py-20 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-serif italic text-muted-foreground">
                        {isDe ? 'Bestenliste wird aktualisiert...' : 'Updating leaderboard...'}
                    </p>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 px-6 border border-dashed rounded-2xl bg-muted/10 space-y-3">
                    <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Feather className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-serif font-bold text-base">
                            {isDe ? 'Keine Werke in dieser Auswahl gefunden' : 'No works found in this selection'}
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            {isDe
                                ? 'Probiere andere Filter aus oder reiche als erster Autor dein Werk ein.'
                                : 'Try adjusting the filters or publish a new piece.'}
                        </p>
                    </div>
                    {session ? (
                        <Button onClick={() => setUploadModalOpen(true)} size="sm" className="rounded-full text-xs">
                            <PenTool className="mr-1.5 h-3.5 w-3.5" />
                            {isDe ? 'Jetzt Werk veröffentlichen' : 'Publish Your Work'}
                        </Button>
                    ) : (
                        <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                            <Link href="/auth/register">
                                {isDe ? 'Registrieren & Text einreichen' : 'Register to Publish'}
                            </Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, idx) => {
                        const rank = item.rank || idx + 1;
                        const isExpanded = expandedIds.has(item._id);
                        const displayTitle = isDe && item.title_de ? item.title_de : (item.title_en || item.title);
                        const displayContent = isDe && item.content_de ? item.content_de : (item.content_en || item.content);
                        const isCommunityPiece = item.isCommunity || item.theme === 'community';

                        return (
                            <div
                                key={item._id}
                                className={cn(
                                    "rounded-xl border transition-all duration-200 bg-card hover:border-primary/40 shadow-sm overflow-hidden",
                                    rank === 1 && "border-amber-500/40 bg-gradient-to-r from-amber-500/5 via-card to-card",
                                    rank === 2 && "border-slate-400/40 bg-gradient-to-r from-slate-400/5 via-card to-card",
                                    rank === 3 && "border-amber-700/40 bg-gradient-to-r from-amber-700/5 via-card to-card",
                                    rank > 3 && "border-border/60"
                                )}
                            >
                                {/* Compact Row Main */}
                                <div className="p-3 md:p-4 flex items-center justify-between gap-3">
                                    {/* Left: Rank & Voting */}
                                    <div className="flex items-center gap-2.5 shrink-0">
                                        {getRankBadge(rank)}

                                        <CommunityVoteButtons
                                            contentId={item._id}
                                            initialScore={item.score || 0}
                                            initialUpvotes={item.upvotes || 0}
                                            initialDownvotes={item.downvotes || 0}
                                            initialUserVote={item.userVote || 0}
                                            size="sm"
                                            orientation="horizontal"
                                        />
                                    </div>

                                    {/* Center: Title, Author, Pills */}
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted/60 text-foreground/80">
                                                {getTypeIcon(item.type)}
                                                {getTypeLabel(item.type)}
                                            </span>

                                            {isCommunityPiece ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                                    Community
                                                </span>
                                            ) : (
                                                <span className="capitalize px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground font-medium">
                                                    {item.theme}
                                                </span>
                                            )}

                                            {item.readTime && (
                                                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                                    ~{item.readTime}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <h3
                                                onClick={() => setReaderItem(item)}
                                                className="font-serif font-bold text-sm md:text-base text-foreground hover:text-primary transition-colors cursor-pointer truncate max-w-full"
                                                title={displayTitle}
                                            >
                                                {displayTitle}
                                            </h3>
                                            <span className="text-xs text-muted-foreground font-serif italic truncate">
                                                {isDe ? 'von' : 'by'} <span className="font-medium text-foreground/90">{item.author}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Quick Actions */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {/* Fullscreen Reader Jump Action */}
                                        <Button
                                            onClick={() => setReaderItem(item)}
                                            size="sm"
                                            className="rounded-full h-8 px-3 text-xs font-semibold shadow-sm"
                                            title={isDe ? 'Im Vollbild-Reader öffnen' : 'Open in Fullscreen Reader'}
                                        >
                                            <Maximize2 className="h-3.5 w-3.5 mr-1" />
                                            <span className="hidden sm:inline">{isDe ? 'Vollbild' : 'Full'}</span>
                                        </Button>

                                        {/* Inline Expand Toggle */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => toggleExpand(item._id, e)}
                                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                                            title={isExpanded ? (isDe ? 'Vorschau schließen' : 'Collapse preview') : (isDe ? 'Vorschau öffnen' : 'Expand preview')}
                                            aria-label="Toggle preview"
                                        >
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Inline Expandable Preview Drawer */}
                                {isExpanded && (
                                    <div className="border-t border-border/40 bg-muted/15 p-4 md:p-5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/30">
                                            <span className="font-mono text-[11px]">
                                                {item.estimatedWords ? `${item.estimatedWords} ${isDe ? 'Wörter' : 'words'}` : ''}
                                                {item.estimatedWords && item.readTime ? ' • ' : ''}
                                                {item.readTime ? `${item.readTime} ${isDe ? 'Lesezeit' : 'read'}` : ''}
                                            </span>
                                            <button
                                                onClick={() => setReaderItem(item)}
                                                className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                                            >
                                                <span>{isDe ? 'Im Vollbild-Reader lesen' : 'Read in fullscreen reader'}</span>
                                                <Maximize2 className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <div className={cn(
                                            "markdown-content prose-sm max-w-none text-foreground/90 font-serif leading-relaxed",
                                            item.type === 'poem' && "italic pl-3 border-l-2 border-primary/40",
                                            item.type === 'quote' && "text-base font-serif italic py-1"
                                        )}>
                                            <ReactMarkdown>
                                                {displayContent}
                                            </ReactMarkdown>
                                        </div>

                                        {item.source && (
                                            <p className="text-[10px] text-muted-foreground/60 italic font-sans pt-2 border-t border-border/20">
                                                {isDe ? 'Quelle' : 'Source'}: {item.source}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Standard full screen text thing modal */}
            <TextReaderModal
                item={readerItem}
                onClose={() => setReaderItem(null)}
            />

            {/* Author Upload Modal */}
            <AuthorUploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
                defaultAuthorName={session?.user?.name || ''}
            />
        </div>
    );
}
