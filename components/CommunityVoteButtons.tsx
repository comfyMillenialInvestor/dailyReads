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

    const iconSizeClass = isSm ? 'h-4 w-4' : isLg ? 'h-6 w-6' : 'h-5 w-5';
    const btnPaddingClass = isSm ? 'p-1' : isLg ? 'p-2' : 'p-1.5';
    const textClass = isSm ? 'text-xs' : isLg ? 'text-base font-bold' : 'text-sm font-semibold';

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full bg-muted/40 border border-border/50 p-0.5 select-none transition-colors",
                orientation === 'vertical' ? "flex-col gap-0.5" : "flex-row gap-1",
                className
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Upvote Button */}
            <button
                type="button"
                onClick={(e) => handleVote(1, e)}
                disabled={loading}
                title="Gefällt mir (Upvote)"
                className={cn(
                    "rounded-full transition-all flex items-center justify-center hover:bg-emerald-500/10 active:scale-95",
                    btnPaddingClass,
                    userVote === 1
                        ? "text-emerald-500 bg-emerald-500/15 font-bold shadow-sm"
                        : "text-muted-foreground hover:text-emerald-500"
                )}
                aria-label="Upvote"
            >
                <ArrowBigUp
                    className={cn(
                        iconSizeClass,
                        "transition-transform",
                        userVote === 1 && "fill-current scale-110"
                    )}
                />
            </button>

            {/* Score Display */}
            <span
                className={cn(
                    "px-1 font-mono transition-colors min-w-[2ch] text-center",
                    textClass,
                    score > 0 && "text-emerald-500 dark:text-emerald-400 font-bold",
                    score < 0 && "text-rose-500 dark:text-rose-400 font-bold",
                    score === 0 && "text-muted-foreground"
                )}
            >
                {score > 0 ? `+${score}` : score}
            </span>

            {/* Downvote Button */}
            <button
                type="button"
                onClick={(e) => handleVote(-1, e)}
                disabled={loading}
                title="Gefällt mir nicht (Downvote)"
                className={cn(
                    "rounded-full transition-all flex items-center justify-center hover:bg-rose-500/10 active:scale-95",
                    btnPaddingClass,
                    userVote === -1
                        ? "text-rose-500 bg-rose-500/15 font-bold shadow-sm"
                        : "text-muted-foreground hover:text-rose-500"
                )}
                aria-label="Downvote"
            >
                <ArrowBigDown
                    className={cn(
                        iconSizeClass,
                        "transition-transform",
                        userVote === -1 && "fill-current scale-110"
                    )}
                />
            </button>
        </div>
    );
}
