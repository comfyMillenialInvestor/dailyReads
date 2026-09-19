'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Loader2,
    Send,
    Sparkles,
    RefreshCw,
    Brain,
    Twitter,
    MessageSquare,
    BookOpen,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Sun,
    Moon,
    Flame,
    Quote,
    ExternalLink,
    AlertCircle,
    Copy,
    CheckCheck,
    ShieldAlert,
    Pencil,
    TrendingUp,
    Search,
    Compass,
    Users,
} from 'lucide-react';

interface VoiceTraits {
    sentenceLength?: string;
    vocabulary?: string;
    punctuation?: string;
    paragraphStructure?: string;
    useOfQuestions?: string;
    humour?: string;
    understatement?: string;
    irony?: string;
    emojiUsage?: string;
    abbreviations?: string;
    directness?: string;
    formality?: string;
    conversationalStyle?: string;
    agreeDisagreeStyle?: string;
    opinionIntroduction?: string;
    observationStyle?: string;
    surprisingIdeasReaction?: string;
    jokesStyle?: string;
    uncertaintyExpression?: string;
    selfReferenceUsage?: string;
    typicalReplyLength?: string;
    keyObservationsSummary?: string;
}

interface VoiceProfile {
    version: number;
    isActive: boolean;
    rawAnalysis: string;
    traits: VoiceTraits;
    distilledSystemPrompt: string;
    postCountAnalyzed: {
        total: number;
        original: number;
        replies: number;
    };
    editPatterns?: string[];
    rejectedPatterns?: string[];
    acceptedPreferences?: string[];
    interactionStats?: {
        totalInteractions: number;
        editsCount: number;
        rejectionsCount: number;
        approvalsCount: number;
    };
    sampleExcerpts: string[];
    lastAnalyzedAt: string;
}

interface Suggestion {
    _id: string;
    type: 'post' | 'comment';
    slot: 'manual' | 'morning' | 'evening';
    suggestedText: string;
    finalText?: string;
    wasEdited?: boolean;
    editDelta?: string;
    rejectionReason?: string;
    targetTweet?: {
        id?: string;
        author?: string;
        text?: string;
        url?: string;
    };
    status: 'pending' | 'approved' | 'posted' | 'rejected';
    evaluation?: {
        voiceMatchScore: number;
        rationale: string;
        styleObservations: string[];
    };
    postedTweetId?: string;
    postedAt?: string;
    createdAt: string;
}

interface DiscoveredTweet {
    id: string;
    text: string;
    createdAt?: string;
    authorName: string;
    authorUsername: string;
    url: string;
    source: 'home' | 'search';
}

interface SyncStats {
    totalCount: number;
    originalCount: number;
    repliesCount: number;
    lastSyncAt: string | null;
}

export default function XSuggestionsAdmin() {
    const { data: session } = useSession();
    const currentStreak = (session?.user as any)?.currentStreak || 0;

    // State
    const [profile, setProfile] = useState<VoiceProfile | null>(null);
    const [stats, setStats] = useState<SyncStats | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [postingId, setPostingId] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Main section navigation: 'copilot' (suggestions & drafts) vs 'discover' (find posts to comment on)
    const [mainView, setMainView] = useState<'copilot' | 'discover'>('copilot');

    // Filter & view state
    const [activeTab, setActiveTab] = useState<'pending' | 'posted' | 'all'>('pending');
    const [isTraitsExpanded, setIsTraitsExpanded] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Quick Reply input state
    const [targetTweetInput, setTargetTweetInput] = useState('');
    const [customContext, setCustomContext] = useState('');

    // Rejection reason popover/selector per item: string | null
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    // Editable suggestion drafts { [id]: currentText }
    const [editedTexts, setEditedTexts] = useState<{ [id: string]: string }>({});

    // Feed discovery state
    const [feedSource, setFeedSource] = useState<'home' | 'search'>('home');
    const [feedQuery, setFeedQuery] = useState('');
    const [feedTweets, setFeedTweets] = useState<DiscoveredTweet[]>([]);
    const [isLoadingFeed, setIsLoadingFeed] = useState(false);
    const [draftingTweetId, setDraftingTweetId] = useState<string | null>(null);

    // Load initial data
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const [syncRes, profileRes, suggRes] = await Promise.all([
                fetch('/api/admin/x-voice/sync'),
                fetch('/api/admin/x-voice/profile'),
                fetch('/api/admin/x-voice/suggestions'),
            ]);

            const syncData = await syncRes.json();
            if (syncData.success) {
                setStats(syncData.stats);
            }

            const profileData = await profileRes.json();
            if (profileData.success && profileData.profile) {
                setProfile(profileData.profile);
            }

            const suggData = await suggRes.json();
            if (suggData.success && Array.isArray(suggData.suggestions)) {
                setSuggestions(suggData.suggestions);
                const initialMap: { [id: string]: string } = {};
                suggData.suggestions.forEach((s: Suggestion) => {
                    initialMap[s._id] = s.finalText || s.suggestedText;
                });
                setEditedTexts(initialMap);
            }
        } catch (err: any) {
            console.error('Error loading X Voice data:', err);
            setStatusMessage({ type: 'error', text: 'Failed to load data. Please refresh.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Load tweets from Feed or Search
    const loadFeedTweets = async (source = feedSource, query = feedQuery) => {
        setIsLoadingFeed(true);
        setStatusMessage(null);
        try {
            const params = new URLSearchParams({ source });
            if (source === 'search' && query.trim()) {
                params.set('query', query.trim());
            }
            const res = await fetch(`/api/admin/x-voice/feed?${params.toString()}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.tweets)) {
                setFeedTweets(data.tweets);
            } else {
                throw new Error(data.error || 'Failed to load feed tweets');
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoadingFeed(false);
        }
    };

    // When switching to 'discover', load feed if empty
    useEffect(() => {
        if (mainView === 'discover' && feedTweets.length === 0 && !isLoadingFeed) {
            loadFeedTweets('home');
        }
    }, [mainView]);

    // Sync user posts from X
    const handleSync = async () => {
        setIsSyncing(true);
        setStatusMessage(null);
        try {
            const res = await fetch('/api/admin/x-voice/sync', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                const { syncedCount, originalCount, repliesCount } = data.result;
                setStatusMessage({
                    type: 'success',
                    text: `Synced ${syncedCount} posts from X (${originalCount} standalone, ${repliesCount} replies).`,
                });
                await loadAllData();
            } else {
                throw new Error(data.error || 'Failed to sync');
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setIsSyncing(false);
        }
    };

    // Re-analyze voice profile with DeepSeek
    const handleReanalyze = async () => {
        setIsAnalyzing(true);
        setStatusMessage(null);
        try {
            const res = await fetch('/api/admin/x-voice/profile', { method: 'POST' });
            const data = await res.json();
            if (data.success && data.profile) {
                setProfile(data.profile);
                setStatusMessage({
                    type: 'success',
                    text: `Voice Profile v${data.profile.version} synthesized! Updated with real posts, edits, and rejections.`,
                });
            } else {
                throw new Error(data.error || 'Failed to analyze');
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Generate suggestions
    const handleGenerate = async (options: {
        type: 'post' | 'comment';
        slot?: 'manual' | 'morning' | 'evening';
        targetTweetInput?: string;
        customContext?: string;
        isBatch?: boolean;
    }) => {
        setIsGenerating(true);
        setStatusMessage(null);
        try {
            const res = await fetch('/api/admin/x-voice/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...options,
                    readingStreak: currentStreak,
                }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.suggestion) {
                    setSuggestions((prev) => [data.suggestion, ...prev]);
                    setEditedTexts((prev) => ({
                        ...prev,
                        [data.suggestion._id]: data.suggestion.suggestedText,
                    }));
                } else if (Array.isArray(data.suggestions)) {
                    setSuggestions((prev) => [...data.suggestions, ...prev]);
                    const newMap: { [id: string]: string } = {};
                    data.suggestions.forEach((s: Suggestion) => {
                        newMap[s._id] = s.suggestedText;
                    });
                    setEditedTexts((prev) => ({ ...prev, ...newMap }));
                }
                setStatusMessage({
                    type: 'success',
                    text: `Generated authentic ${options.type === 'comment' ? 'reply' : 'post'} draft as your personal copilot!`,
                });
                if (options.targetTweetInput) {
                    setTargetTweetInput('');
                }
                // Switch to suggestions tab so user can review immediately
                setMainView('copilot');
                setActiveTab('pending');
            } else {
                throw new Error(data.error || 'Failed to generate suggestion');
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setIsGenerating(false);
        }
    };

    // Direct 1-click comment drafting from discovered feed tweet
    const handleDraftReplyFromFeed = async (tweet: DiscoveredTweet) => {
        setDraftingTweetId(tweet.id);
        setStatusMessage(null);
        try {
            const res = await fetch('/api/admin/x-voice/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'comment',
                    slot: 'manual',
                    targetTweetInput: tweet.url,
                    readingStreak: currentStreak,
                }),
            });
            const data = await res.json();
            if (data.success && data.suggestion) {
                setSuggestions((prev) => [data.suggestion, ...prev]);
                setEditedTexts((prev) => ({
                    ...prev,
                    [data.suggestion._id]: data.suggestion.suggestedText,
                }));
                setStatusMessage({
                    type: 'success',
                    text: `Drafted reply to @${tweet.authorUsername}! Ready for review below.`,
                });
                setMainView('copilot');
                setActiveTab('pending');
            } else {
                throw new Error(data.error || 'Failed to draft reply');
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setDraftingTweetId(null);
        }
    };

    // Post approved draft to X (via official API) & feed back into learning loop
    const handlePostToX = async (suggestion: Suggestion) => {
        const textToPost = editedTexts[suggestion._id] || suggestion.suggestedText;
        if (!textToPost.trim()) return;

        setPostingId(suggestion._id);
        setStatusMessage(null);
        try {
            const res = await fetch('/api/admin/x-voice/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    suggestionId: suggestion._id,
                    text: textToPost,
                    inReplyToTweetId: suggestion.targetTweet?.id,
                }),
            });
            const data = await res.json();
            if (data.success) {
                const wasEdited = textToPost.trim() !== suggestion.suggestedText.trim();
                setStatusMessage({
                    type: 'success',
                    text: wasEdited
                        ? `Published to X! Your edits were recorded into the copilot learning loop.`
                        : `Published to X! Approved draft recorded into positive voice preferences.`,
                });
                setSuggestions((prev) =>
                    prev.map((s) =>
                        s._id === suggestion._id
                            ? {
                                  ...s,
                                  status: 'posted',
                                  finalText: textToPost,
                                  wasEdited,
                                  postedTweetId: data.tweetId,
                                  postedAt: new Date().toISOString(),
                              }
                            : s
                    )
                );
            } else {
                throw new Error(data.error || 'Failed to publish to X');
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setPostingId(null);
        }
    };

    // Dismiss or reject a suggestion with optional reason
    const handleDismiss = async (id: string, reason?: string) => {
        try {
            await fetch('/api/admin/x-voice/suggestions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    status: 'rejected',
                    rejectionReason: reason || 'Dismissed as unnatural or generic',
                }),
            });
            setSuggestions((prev) =>
                prev.map((s) => (s._id === id ? { ...s, status: 'rejected', rejectionReason: reason } : s))
            );
            setRejectingId(null);
            setStatusMessage({
                type: 'success',
                text: reason
                    ? `Rejection noted ("${reason}"). DeepSeek will avoid this pattern.`
                    : `Draft rejected and cataloged as negative feedback.`,
            });
        } catch (err) {
            console.error('Failed to dismiss suggestion:', err);
        }
    };

    // Copy draft to clipboard
    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredSuggestions = suggestions.filter((s) => {
        if (activeTab === 'pending') return s.status === 'pending';
        if (activeTab === 'posted') return s.status === 'posted';
        return true;
    });

    return (
        <div className="max-w-4xl mx-auto py-6 md:py-10 space-y-8 px-3 md:px-4">
            {/* Top Navigation Bar between Admin Tools */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight flex items-center gap-3">
                        <Twitter className="h-7 w-7 text-sky-500" />
                        Personal Writing Copilot
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Answering <em>"What would I naturally say here?"</em> instead of sounding like a generic AI social-media manager.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/challenge">
                        <Button variant="outline" size="sm" className="text-xs">
                            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                            Bradbury Challenge
                        </Button>
                    </Link>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="text-xs bg-sky-600 hover:bg-sky-500 text-white"
                    >
                        <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync from X
                    </Button>
                </div>
            </div>

            {/* Status Message Banner */}
            {statusMessage && (
                <div
                    className={`p-4 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-200 ${
                        statusMessage.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}
                >
                    {statusMessage.type === 'success' ? (
                        <Check className="h-5 w-5 shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0" />
                    )}
                    <p className="text-sm font-medium">{statusMessage.text}</p>
                </div>
            )}

            {/* Main Mode Toggle: Suggestions/Drafts vs Discover & Comment Feed */}
            <div className="flex p-1 bg-muted/40 rounded-xl border border-border/60 max-w-md mx-auto sm:mx-0">
                <button
                    onClick={() => setMainView('copilot')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                        mainView === 'copilot'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Copilot Drafts ({suggestions.filter((s) => s.status === 'pending').length})
                </button>
                <button
                    onClick={() => setMainView('discover')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                        mainView === 'discover'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Compass className="h-3.5 w-3.5 text-sky-500" />
                    Find People & Posts to Comment On
                </button>
            </div>

            {/* Voice Learning Intelligence Hub */}
            <Card className="border-border/60 bg-muted/20 backdrop-blur shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                                <Brain className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                    Continuous Voice Profile
                                    {profile && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-medium">
                                            v{profile.version}
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Trained on your actual posts, replies, edits, and rejections. Actual posts always win.
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReanalyze}
                                disabled={isAnalyzing || isSyncing}
                                className="text-xs"
                            >
                                <Sparkles className={`mr-1.5 h-3.5 w-3.5 text-amber-500 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                {isAnalyzing ? 'Analyzing with DeepSeek...' : 'Re-Learn Voice'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsTraitsExpanded(!isTraitsExpanded)}
                                className="text-xs text-muted-foreground"
                            >
                                {isTraitsExpanded ? (
                                    <>Less <ChevronUp className="ml-1 h-3.5 w-3.5" /></>
                                ) : (
                                    <>Learned Traits <ChevronDown className="ml-1 h-3.5 w-3.5" /></>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Stats Ribbon with Copilot Learning Indicators */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                        <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 text-center">
                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Total Posts</span>
                            <div className="text-base font-bold text-foreground">{stats?.totalCount || 0}</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 text-center">
                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Original Posts</span>
                            <div className="text-base font-bold text-sky-600">{stats?.originalCount || 0}</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 text-center">
                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Replies Tracked</span>
                            <div className="text-base font-bold text-purple-600">{stats?.repliesCount || 0}</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 text-center">
                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Current Streak</span>
                            <div className="text-base font-bold text-amber-600 flex items-center justify-center gap-1">
                                <Flame className="h-4 w-4" />
                                Day {currentStreak}
                            </div>
                        </div>
                    </div>

                    {/* Interaction Feedback Metric */}
                    {profile?.interactionStats && profile.interactionStats.totalInteractions > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium text-foreground text-[11px]">
                                <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
                                Continuous Copilot Feedback Loop:
                            </span>
                            <div className="flex items-center gap-3 text-[11px]">
                                <span className="text-amber-600 dark:text-amber-400">
                                    ✏️ {profile.interactionStats.editsCount} edits analyzed
                                </span>
                                <span className="text-rose-600 dark:text-rose-400">
                                    ✕ {profile.interactionStats.rejectionsCount} rejections noted
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                    ✓ {profile.interactionStats.approvalsCount} accepted directly
                                </span>
                            </div>
                        </div>
                    )}
                </CardHeader>

                {/* Collapsible Traits Detail */}
                {isTraitsExpanded && profile && (
                    <CardContent className="pt-0 space-y-4 border-t border-border/40 mt-3 animate-in fade-in duration-200">
                        {profile.traits?.keyObservationsSummary && (
                            <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20 text-xs text-sky-950 dark:text-sky-200">
                                <strong>Human Essence:</strong> {profile.traits.keyObservationsSummary}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Anti-Patterns (What you reject) */}
                            <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 space-y-1.5 text-xs">
                                <div className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                                    <ShieldAlert className="h-3.5 w-3.5" /> What You Reject (Anti-Patterns)
                                </div>
                                <ul className="space-y-1 text-muted-foreground text-[11px]">
                                    {profile.rejectedPatterns && profile.rejectedPatterns.length > 0 ? (
                                        profile.rejectedPatterns.map((pat, i) => (
                                            <li key={i} className="flex items-start gap-1.5">
                                                <span className="text-rose-500 font-bold">•</span>
                                                <span>{pat}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="italic text-muted-foreground/70">
                                            Rejections you make in the cards below will automatically populate anti-patterns here.
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Edit Tendencies (How you alter AI text) */}
                            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-xs">
                                <div className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                                    <Pencil className="h-3.5 w-3.5" /> How You Edit AI Text
                                </div>
                                <ul className="space-y-1 text-muted-foreground text-[11px]">
                                    {profile.editPatterns && profile.editPatterns.length > 0 ? (
                                        profile.editPatterns.map((pat, i) => (
                                            <li key={i} className="flex items-start gap-1.5">
                                                <span className="text-amber-500 font-bold">•</span>
                                                <span>{pat}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="italic text-muted-foreground/70">
                                            When you edit drafts before posting, DeepSeek analyzes the delta and records your tendencies here.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Traits Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs pt-1">
                            <div className="p-2.5 rounded-md bg-background/60 border border-border/30">
                                <div className="font-semibold text-muted-foreground text-[11px]">Sentence Length</div>
                                <div className="mt-0.5 text-foreground">{profile.traits?.sentenceLength || 'Punchy, varied'}</div>
                            </div>
                            <div className="p-2.5 rounded-md bg-background/60 border border-border/30">
                                <div className="font-semibold text-muted-foreground text-[11px]">Humour & Understatement</div>
                                <div className="mt-0.5 text-foreground">{profile.traits?.humour || 'Self-deprecating, warm'}</div>
                            </div>
                            <div className="p-2.5 rounded-md bg-background/60 border border-border/30">
                                <div className="font-semibold text-muted-foreground text-[11px]">Emoji Usage</div>
                                <div className="mt-0.5 text-foreground">{profile.traits?.emojiUsage || 'Rare, selective (👍🏻, 😳)'}</div>
                            </div>
                            <div className="p-2.5 rounded-md bg-background/60 border border-border/30">
                                <div className="font-semibold text-muted-foreground text-[11px]">Directness & Formality</div>
                                <div className="mt-0.5 text-foreground">{profile.traits?.directness || 'Direct, conversational'}</div>
                            </div>
                            <div className="p-2.5 rounded-md bg-background/60 border border-border/30">
                                <div className="font-semibold text-muted-foreground text-[11px]">How You Use "I"</div>
                                <div className="mt-0.5 text-foreground">{profile.traits?.selfReferenceUsage || 'Honest personal experience'}</div>
                            </div>
                            <div className="p-2.5 rounded-md bg-background/60 border border-border/30">
                                <div className="font-semibold text-muted-foreground text-[11px]">Typical Reply Style</div>
                                <div className="mt-0.5 text-foreground">{profile.traits?.typicalReplyLength || '1-2 concise sentences'}</div>
                            </div>
                        </div>

                        {/* Actual Quotes */}
                        {profile.sampleExcerpts && profile.sampleExcerpts.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                                    Sample Excerpts from Your Real Posts:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {profile.sampleExcerpts.map((quote, idx) => (
                                        <div
                                            key={idx}
                                            className="p-2.5 rounded-md bg-background/80 border border-border/40 text-[11px] font-serif italic text-muted-foreground leading-relaxed flex items-start gap-1.5"
                                        >
                                            <Quote className="h-3 w-3 shrink-0 text-primary/40 mt-0.5" />
                                            <span>"{quote.replace(/\n+/g, ' ')}"</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* VIEW 1: COPILOT SUGGESTIONS & DRAFTS */}
            {mainView === 'copilot' && (
                <>
                    {/* Suggestion Generation Hub */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                Ask Your Copilot: <em>"What would I say here?"</em>
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleGenerate({ type: 'post', slot: 'morning' })}
                                    disabled={isGenerating}
                                    className="text-xs"
                                >
                                    <Sun className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                                    Morning Post
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleGenerate({ type: 'post', slot: 'evening' })}
                                    disabled={isGenerating}
                                    className="text-xs"
                                >
                                    <Moon className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                                    Evening Post
                                </Button>
                                <Link href="/admin/challenge">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                                    >
                                        <Quote className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                                        Quote of the Day
                                    </Button>
                                </Link>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleGenerate({ type: 'post', slot: 'manual' })}
                                    disabled={isGenerating}
                                    className="text-xs bg-foreground text-background hover:bg-foreground/90"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    Instant Standalone Post
                                </Button>
                            </div>
                        </div>

                        {/* Quick Reply Tool (Reply to any tweet URL or text) */}
                        <Card className="border-border/50 bg-background/50">
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-purple-500" />
                                    Conversational Reply Assistant
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Paste an X tweet URL or text to generate a genuine reply in your personal peer-to-peer tone (no marketing hype).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-2 px-4 pb-4 space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input
                                        placeholder="Paste tweet URL (e.g. https://x.com/author/status/...) or paste tweet text..."
                                        value={targetTweetInput}
                                        onChange={(e) => setTargetTweetInput(e.target.value)}
                                        className="text-xs bg-background/70"
                                    />
                                    <Button
                                        onClick={() =>
                                            handleGenerate({
                                                type: 'comment',
                                                slot: 'manual',
                                                targetTweetInput,
                                                customContext,
                                            })
                                        }
                                        disabled={isGenerating || !targetTweetInput.trim()}
                                        className="text-xs shrink-0 bg-purple-600 hover:bg-purple-500 text-white"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                        )}
                                        Draft Authentic Reply
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Suggestions Review Feed */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`pb-2 px-3 text-xs font-semibold transition-colors border-b-2 ${
                                        activeTab === 'pending'
                                            ? 'border-primary text-foreground'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Pending Suggestions ({suggestions.filter((s) => s.status === 'pending').length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('posted')}
                                    className={`pb-2 px-3 text-xs font-semibold transition-colors border-b-2 ${
                                        activeTab === 'posted'
                                            ? 'border-primary text-foreground'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Published to X ({suggestions.filter((s) => s.status === 'posted').length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`pb-2 px-3 text-xs font-semibold transition-colors border-b-2 ${
                                        activeTab === 'all'
                                            ? 'border-primary text-foreground'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    All ({suggestions.length})
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredSuggestions.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-border/60 rounded-xl bg-muted/10">
                                <p className="text-sm text-muted-foreground">
                                    No {activeTab} suggestions found. Use the buttons above or click "Find People & Posts to Comment On" to discover posts!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredSuggestions.map((suggestion) => {
                                    const currentText =
                                        editedTexts[suggestion._id] !== undefined
                                            ? editedTexts[suggestion._id]
                                            : suggestion.suggestedText;
                                    const charCount = currentText.length;
                                    const isOverLimit = charCount > 280;
                                    const isPostingThis = postingId === suggestion._id;
                                    const isEditedByAuthor = currentText.trim() !== suggestion.suggestedText.trim();
                                    const isRejectingThis = rejectingId === suggestion._id;

                                    return (
                                        <Card
                                            key={suggestion._id}
                                            className={`border transition-all ${
                                                suggestion.status === 'posted'
                                                    ? 'border-emerald-500/30 bg-emerald-500/5'
                                                    : suggestion.status === 'rejected'
                                                    ? 'border-rose-500/20 bg-rose-500/5 opacity-60'
                                                    : 'border-border/60 bg-muted/20 hover:border-border'
                                            }`}
                                        >
                                            <CardHeader className="pb-2 pt-4 px-4 sm:px-6 flex flex-row items-center justify-between">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Type Badge */}
                                                    <span
                                                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                            suggestion.type === 'comment'
                                                                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                                                : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                                                        }`}
                                                    >
                                                        {suggestion.type === 'comment' ? 'Reply / Comment' : 'Standalone Post'}
                                                    </span>

                                                    {/* Slot Badge */}
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                                                        {suggestion.slot} slot
                                                    </span>

                                                    {/* Status Badge */}
                                                    {suggestion.status === 'posted' && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-medium flex items-center gap-1">
                                                            <Check className="h-3 w-3" /> Published
                                                            {suggestion.wasEdited && <span className="text-[9px] opacity-75">(Edited)</span>}
                                                        </span>
                                                    )}

                                                    {suggestion.status === 'rejected' && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 font-medium flex items-center gap-1">
                                                            <X className="h-3 w-3" /> Rejected
                                                        </span>
                                                    )}

                                                    {/* DeepSeek Voice Match Score */}
                                                    {suggestion.evaluation?.voiceMatchScore && (
                                                        <span
                                                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                                suggestion.evaluation.voiceMatchScore >= 8
                                                                    ? 'bg-emerald-500/15 text-emerald-600'
                                                                    : suggestion.evaluation.voiceMatchScore >= 6
                                                                    ? 'bg-amber-500/15 text-amber-600'
                                                                    : 'bg-destructive/15 text-destructive'
                                                            }`}
                                                            title={suggestion.evaluation.rationale}
                                                        >
                                                            Human Copilot Match: {suggestion.evaluation.voiceMatchScore}/10
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleCopy(suggestion._id, currentText)}
                                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                        title="Copy to clipboard"
                                                    >
                                                        {copiedId === suggestion._id ? (
                                                            <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                    {suggestion.status === 'pending' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setRejectingId(isRejectingThis ? null : suggestion._id)}
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                            title="Reject with feedback"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardHeader>

                                            <CardContent className="px-4 sm:px-6 pb-4 space-y-3">
                                                {/* Target Tweet preview if it's a reply */}
                                                {suggestion.targetTweet && suggestion.targetTweet.text && (
                                                    <div className="p-3 rounded-lg bg-background/80 border border-purple-500/20 text-xs space-y-1">
                                                        <div className="text-muted-foreground text-[10px] flex items-center justify-between font-medium">
                                                            <span>Replying to {suggestion.targetTweet.author || 'tweet'}:</span>
                                                            {suggestion.targetTweet.url && (
                                                                <a
                                                                    href={suggestion.targetTweet.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-sky-500 hover:underline flex items-center gap-0.5"
                                                                >
                                                                    View Tweet <ExternalLink className="h-2.5 w-2.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <p className="text-muted-foreground italic font-serif line-clamp-2">
                                                            "{suggestion.targetTweet.text}"
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Rejection Quick Feedback Dialog */}
                                                {isRejectingThis && (
                                                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs space-y-2 animate-in fade-in duration-150">
                                                        <div className="font-semibold text-rose-700 dark:text-rose-300">
                                                            Teach your copilot: Why are you rejecting this?
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <button
                                                                onClick={() => handleDismiss(suggestion._id, 'Sounds like generic AI / social media manager')}
                                                                className="px-2.5 py-1 rounded bg-background border border-rose-500/40 hover:bg-rose-500/10 text-[11px]"
                                                            >
                                                                Sounds like generic AI / brand
                                                            </button>
                                                            <button
                                                                onClick={() => handleDismiss(suggestion._id, 'Too promotional or enthusiastic')}
                                                                className="px-2.5 py-1 rounded bg-background border border-rose-500/40 hover:bg-rose-500/10 text-[11px]"
                                                            >
                                                                Too promotional / hype
                                                            </button>
                                                            <button
                                                                onClick={() => handleDismiss(suggestion._id, 'Phrasing is awkward or out of character')}
                                                                className="px-2.5 py-1 rounded bg-background border border-rose-500/40 hover:bg-rose-500/10 text-[11px]"
                                                            >
                                                                Awkward phrasing
                                                            </button>
                                                            <button
                                                                onClick={() => handleDismiss(suggestion._id)}
                                                                className="px-2.5 py-1 rounded bg-background border border-border hover:bg-muted text-[11px] text-muted-foreground"
                                                            >
                                                                Dismiss without note
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Editable Post Draft Textarea */}
                                                <div className="relative">
                                                    <Textarea
                                                        value={currentText}
                                                        onChange={(e) =>
                                                            setEditedTexts((prev) => ({
                                                                ...prev,
                                                                [suggestion._id]: e.target.value,
                                                            }))
                                                        }
                                                        disabled={suggestion.status === 'posted'}
                                                        className={`w-full p-3 md:p-4 bg-background rounded-lg border font-serif text-sm md:text-base leading-relaxed resize-y min-h-[100px] transition-colors ${
                                                            isEditedByAuthor && suggestion.status === 'pending'
                                                                ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                                                                : 'border-border/50'
                                                        }`}
                                                        placeholder="Post draft..."
                                                    />
                                                </div>

                                                {/* Edit Delta indicator */}
                                                {isEditedByAuthor && suggestion.status === 'pending' && (
                                                    <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                        <Pencil className="h-3 w-3" />
                                                        <span>
                                                            You modified the AI draft — upon posting, this delta will teach your copilot your exact refinement style.
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Evaluation Rationale & Character Count */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                                                    <div className="text-muted-foreground text-[11px]">
                                                        {suggestion.evaluation?.rationale && (
                                                            <span>
                                                                <strong>Copilot Audit:</strong> {suggestion.evaluation.rationale}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span
                                                        className={`font-semibold px-2 py-0.5 rounded-full text-[11px] shrink-0 ${
                                                            isOverLimit
                                                                ? 'bg-destructive/10 text-destructive animate-pulse'
                                                                : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {charCount} / 280 chars
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                {suggestion.status === 'pending' && (
                                                    <div className="flex gap-2 pt-1">
                                                        <Button
                                                            onClick={() => handlePostToX(suggestion)}
                                                            disabled={isPostingThis || isOverLimit || !currentText.trim()}
                                                            className="flex-1 h-10 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-transform active:scale-[0.99]"
                                                        >
                                                            {isPostingThis ? (
                                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <Send className="mr-1.5 h-3.5 w-3.5" />
                                                            )}
                                                            Approve & Post to X (Official API)
                                                        </Button>
                                                    </div>
                                                )}

                                                {suggestion.status === 'posted' && suggestion.postedTweetId && (
                                                    <div className="text-[11px] text-emerald-600 font-medium flex items-center justify-between">
                                                        <span className="flex items-center gap-1">
                                                            <Check className="h-3.5 w-3.5" /> Published on X (Tweet ID: {suggestion.postedTweetId})
                                                        </span>
                                                        {suggestion.wasEdited && (
                                                            <span className="text-muted-foreground font-normal">
                                                                Diff fed back into learning loop ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* VIEW 2: DISCOVER & COMMENT FEED */}
            {mainView === 'discover' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <Card className="border-border/60 bg-muted/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
                                <span className="flex items-center gap-2">
                                    <Compass className="h-5 w-5 text-sky-500" />
                                    Find People & Conversations to Comment On
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={feedSource === 'home' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setFeedSource('home');
                                            loadFeedTweets('home');
                                        }}
                                        className="text-xs"
                                    >
                                        <Users className="mr-1.5 h-3.5 w-3.5" />
                                        Home Feed (People You Follow)
                                    </Button>
                                    <Button
                                        variant={feedSource === 'search' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setFeedSource('search');
                                            loadFeedTweets('search', feedQuery);
                                        }}
                                        className="text-xs"
                                    >
                                        <Search className="mr-1.5 h-3.5 w-3.5" />
                                        Literature & Reading Discussions
                                    </Button>
                                </div>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Discover posts in your niche, click "Draft Reply in My Voice" to craft authentic peer responses with your copilot, and grow your audience organically.
                            </CardDescription>
                        </CardHeader>

                        {/* Search & Topic Filter bar */}
                        {feedSource === 'search' && (
                            <CardContent className="pt-0 space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder='Search X for discussions (e.g. "favorite short story", "reading habit", "essay")'
                                        value={feedQuery}
                                        onChange={(e) => setFeedQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') loadFeedTweets('search', feedQuery);
                                        }}
                                        className="text-xs bg-background/80"
                                    />
                                    <Button
                                        onClick={() => loadFeedTweets('search', feedQuery)}
                                        disabled={isLoadingFeed}
                                        size="sm"
                                        className="text-xs shrink-0"
                                    >
                                        {isLoadingFeed ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                                        Search
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 text-xs">
                                    <span className="text-muted-foreground text-[11px] self-center">Quick topics:</span>
                                    <button
                                        onClick={() => {
                                            setFeedQuery('reading OR "short story" OR "daily reading"');
                                            loadFeedTweets('search', 'reading OR "short story" OR "daily reading"');
                                        }}
                                        className="px-2 py-0.5 rounded-full bg-background border border-border hover:bg-muted text-[11px]"
                                    >
                                        Short Stories & Reading
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFeedQuery('"favorite book" OR "currently reading"');
                                            loadFeedTweets('search', '"favorite book" OR "currently reading"');
                                        }}
                                        className="px-2 py-0.5 rounded-full bg-background border border-border hover:bg-muted text-[11px]"
                                    >
                                        Currently Reading
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFeedQuery('poetry OR essay OR "literary fiction"');
                                            loadFeedTweets('search', 'poetry OR essay OR "literary fiction"');
                                        }}
                                        className="px-2 py-0.5 rounded-full bg-background border border-border hover:bg-muted text-[11px]"
                                    >
                                        Poetry & Essays
                                    </button>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Discovered Tweets Feed */}
                    {isLoadingFeed ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                            <p className="text-xs text-muted-foreground">Reading live X feed...</p>
                        </div>
                    ) : feedTweets.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-border/60 rounded-xl bg-muted/10">
                            <p className="text-sm text-muted-foreground">
                                No tweets found for this search. Try a different topic or switch to "Home Feed".
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feedTweets.map((tweet) => {
                                const isDraftingThis = draftingTweetId === tweet.id;
                                return (
                                    <Card key={tweet.id} className="border-border/60 bg-background/60 hover:border-sky-500/40 transition-all">
                                        <CardContent className="p-4 sm:p-5 space-y-3">
                                            {/* Author header */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="font-semibold text-foreground">{tweet.authorName}</span>
                                                    <span className="text-muted-foreground">@{tweet.authorUsername}</span>
                                                    {tweet.createdAt && (
                                                        <span className="text-muted-foreground text-[11px]">
                                                            • {new Date(tweet.createdAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <a
                                                    href={tweet.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                                                >
                                                    View on X <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>

                                            {/* Tweet Content */}
                                            <p className="text-sm font-serif leading-relaxed text-foreground whitespace-pre-wrap">
                                                {tweet.text}
                                            </p>

                                            {/* Action bar */}
                                            <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground">
                                                    {tweet.source === 'home' ? 'From your home feed' : 'Discovered in literary search'}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDraftReplyFromFeed(tweet)}
                                                    disabled={isDraftingThis}
                                                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium"
                                                >
                                                    {isDraftingThis ? (
                                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                                    )}
                                                    Draft Reply in My Voice
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
