'use client';

import * as React from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityVoteButtonsProps {
    contentId: string;
    initialScore?: number;
    initialUpvotes?: number;
    initialDownvotes?: number;
    initialUserVote?: number; // 1, -1, or 0
    size?: 'sm' | 'md' | 'lg';
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    onVoteChange?: (newScore: number, newUserVote: number) => void;
}

export function CommunityVoteButtons({
    contentId,
    initialScore = 0,
    initialUpvotes = 0,
    initialDownvotes = 0,
    initialUserVote = 0,
    size = 'md',
    orientation = 'horizontal',
    className,
    onVoteChange,
}: CommunityVoteButtonsProps) {
    const [score, setScore] = React.useState(initialScore);
    const [userVote, setUserVote] = React.useState(initialUserVote);
    const [loading, setLoading] = React.useState(false);

    // Sync with props if updated externally
    React.useEffect(() => {
        setScore(initialScore);
    }, [initialScore]);

    React.useEffect(() => {
        setUserVote(initialUserVote);
    }, [initialUserVote]);

    const handleVote = async (direction: 1 | -1, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (loading) return;

        // Calculate optimistic next state
        const targetDirection = userVote === direction ? 0 : direction;
        const prevVote = userVote;
        const prevScore = score;

        let scoreDelta = 0;
        if (targetDirection === 0) {
            // Removing vote
            scoreDelta = prevVote === 1 ? -1 : 1;
        } else if (targetDirection === 1) {
            // Upvoting
            scoreDelta = prevVote === -1 ? 2 : 1;
        } else if (targetDirection === -1) {
            // Downvoting
            scoreDelta = prevVote === 1 ? -2 : -1;
        }

        const nextScore = prevScore + scoreDelta;
        setUserVote(targetDirection);
        setScore(nextScore);
        if (onVoteChange) onVoteChange(nextScore, targetDirection);

        setLoading(true);
        try {
            const res = await fetch('/api/community/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentId, direction: targetDirection }),
            });

            if (!res.ok) {
                throw new Error('Vote failed');
            }

            const data = await res.json();
            if (data.success) {
                setScore(data.score);
                setUserVote(data.userVote);
                if (onVoteChange) onVoteChange(data.score, data.userVote);
            } else {
                // Revert on error
                setUserVote(prevVote);
                setScore(prevScore);
                if (onVoteChange) onVoteChange(prevScore, prevVote);
            }
        } catch (error) {
            console.error('Vote failed:', error);
            // Revert on network error
            setUserVote(prevVote);
            setScore(prevScore);
            if (onVoteChange) onVoteChange(prevScore, prevVote);
        } finally {
            setLoading(false);
        }
    };

    const isSm = size === 'sm';
    const isLg = size === 'lg';

    // Better touch targets & proportions on mobile:
    // When size is 'sm', keep it ultra-compact horizontally on mobile (h-6.5, px-1.5) so it never overflows headers or wraps awkwardly.
    return (
        <div
            className={cn(
                "inline-flex items-center select-none transition-all duration-200",
                "bg-muted/40 hover:bg-muted/60 dark:bg-muted/30 dark:hover:bg-muted/50 border border-border/60",
                "backdrop-blur-xs shadow-xs",
                orientation === 'vertical' 
                    ? "flex-col rounded-2xl p-1 gap-1" 
                    : "flex-row rounded-full",
                isSm 
                    ? "h-7 px-1 gap-0.5 text-xs" 
                    : isLg 
                    ? "h-10 px-2.5 gap-2 text-base" 
                    : "h-8 px-1.5 gap-1 text-sm",
                className
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Upvote Button */}
            <button
                type="button"
                onClick={(e) => handleVote(1, e)}
                disabled={loading}
                title="Upvote"
                className={cn(
                    "rounded-full transition-all flex items-center justify-center shrink-0 active:scale-90",
                    isSm ? "h-5 w-5" : isLg ? "h-7 w-7" : "h-6 w-6",
                    userVote === 1
                        ? "text-emerald-500 bg-emerald-500/20 font-bold shadow-xs scale-105"
                        : "text-muted-foreground/75 hover:text-emerald-500 hover:bg-emerald-500/10"
                )}
                aria-label="Upvote"
            >
                <ArrowBigUp
                    className={cn(
                        isSm ? "h-3.5 w-3.5" : isLg ? "h-5 w-5" : "h-4 w-4",
                        "transition-transform duration-150 stroke-[2.2]",
                        userVote === 1 && "fill-current scale-110"
                    )}
                />
            </button>

            {/* Score Display */}
            <span
                className={cn(
                    "font-mono transition-colors text-center shrink-0 tabular-nums px-0.5 select-none leading-none",
                    isSm ? "text-[11px] min-w-[1.6ch] font-semibold" : isLg ? "text-sm min-w-[2.2ch] font-bold" : "text-xs min-w-[1.8ch] font-semibold",
                    score > 0 && "text-emerald-500 dark:text-emerald-400 font-bold",
                    score < 0 && "text-rose-500 dark:text-rose-400 font-bold",
                    score === 0 && "text-muted-foreground/80 font-medium"
                )}
            >
                {score > 0 ? `+${score}` : score}
            </span>

            {/* Downvote Button */}
            <button
                type="button"
                onClick={(e) => handleVote(-1, e)}
                disabled={loading}
                title="Downvote"
                className={cn(
                    "rounded-full transition-all flex items-center justify-center shrink-0 active:scale-90",
                    isSm ? "h-5 w-5" : isLg ? "h-7 w-7" : "h-6 w-6",
                    userVote === -1
                        ? "text-rose-500 bg-rose-500/20 font-bold shadow-xs scale-105"
                        : "text-muted-foreground/75 hover:text-rose-500 hover:bg-rose-500/10"
                )}
                aria-label="Downvote"
            >
                <ArrowBigDown
                    className={cn(
                        isSm ? "h-3.5 w-3.5" : isLg ? "h-5 w-5" : "h-4 w-4",
                        "transition-transform duration-150 stroke-[2.2]",
                        userVote === -1 && "fill-current scale-110"
                    )}
                />
            </button>
        </div>
    );
}
