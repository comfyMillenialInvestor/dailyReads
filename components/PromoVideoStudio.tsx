'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Play,
    Pause,
    RotateCcw,
    Download,
    Film,
    Sparkles,
    Volume2,
    Sliders,
    Eye,
    Type,
    Check,
    Loader2
} from 'lucide-react';

interface PromoVideoStudioProps {
    defaultDay?: number | string;
    initialStoryTitle?: string;
    initialStoryAuthor?: string;
    initialPoemTitle?: string;
    initialPoemAuthor?: string;
    initialEssayTitle?: string;
    initialEssayAuthor?: string;
}

export default function PromoVideoStudio({
    defaultDay = 62,
    initialStoryTitle = 'The Sound of Thunder',
    initialStoryAuthor = 'Ray Bradbury',
    initialPoemTitle = 'Holy Thursday',
    initialPoemAuthor = 'William Blake',
    initialEssayTitle = 'The Art of the Pause',
    initialEssayAuthor = 'Michel de Montaigne'
}: PromoVideoStudioProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Selected Video Mode
    const [videoMode, setVideoMode] = useState<'habit' | 'community'>('habit');

    // Video Customization Fields
    const [dayNumber, setDayNumber] = useState<string>(String(defaultDay));
    const [hookText, setHookText] = useState<string>('TIRED OF DOOMSCROLLING?');
    const [headlineText, setHeadlineText] = useState<string>('Your Midday Pause Awaits.');
    const [subheadlineText, setSubheadlineText] = useState<string>('Swap 20 minutes of social media for timeless literature.');
    
    // Custom 3 pieces
    const [storyTitle, setStoryTitle] = useState<string>(initialStoryTitle);
    const [storyAuthor, setStoryAuthor] = useState<string>(initialStoryAuthor);
    const [poemTitle, setPoemTitle] = useState<string>(initialPoemTitle);
    const [poemAuthor, setPoemAuthor] = useState<string>(initialPoemAuthor);
    const [essayTitle, setEssayTitle] = useState<string>(initialEssayTitle);
    const [essayAuthor, setEssayAuthor] = useState<string>(initialEssayAuthor);

    // Call to action
    const [ctaDomain, setCtaDomain] = useState<string>('dailyreads.eu');
    const [ctaAction, setCtaAction] = useState<string>('Start Today → dailyreads.eu');

    // Visual Contrast Tuning
    const [overlayDarkness, setOverlayDarkness] = useState<number>(0.65); // 0.4 to 0.85
    const [selectedBg, setSelectedBg] = useState<string>('/backgrounds/calm-lake.jpg');

    // Playback state
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [isExporting, setIsExporting] = useState<boolean>(false);

    const animationFrameRef = useRef<number | null>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);

    // Load background image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedBg;
        img.onload = () => {
            bgImageRef.current = img;
            drawFrame(progress);
        };
    }, [selectedBg]);

    // Helpers
    const roundRect = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        fill: boolean,
        stroke: boolean
    ) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    };

    // Draw single frame onto 1080x1920 canvas
    const drawFrame = useCallback((p: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = 1080;
        const H = 1920;
        canvas.width = W;
        canvas.height = H;

        ctx.clearRect(0, 0, W, H);

        // 1. Draw drifting calm background
        const bgImg = bgImageRef.current;
        if (bgImg && bgImg.complete && bgImg.width > 0) {
            const zoom = 1.0 + (p * 0.07);
            const dw = W * zoom;
            const dh = H * zoom;
            const dx = (W - dw) / 2;
            const dy = (H - dh) / 2;
            ctx.drawImage(bgImg, dx, dy, dw, dh);
        } else {
            ctx.fillStyle = '#0E1116';
            ctx.fillRect(0, 0, W, H);
        }

        // 2. High-readability calm dark overlay (adjusted so text always has crisp contrast)
        const grad = ctx.createRadialGradient(W / 2, H / 2, 220, W / 2, H / 2, 1020);
        grad.addColorStop(0, `rgba(12, 15, 20, ${overlayDarkness})`);
        grad.addColorStop(1, `rgba(8, 10, 14, ${Math.min(0.96, overlayDarkness + 0.18)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 3. Subtle editorial border frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 60, W - 120, H - 120);

        // 4. Header: Clean Brand Identity (Persistent)
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(244, 239, 235, 0.9)';
        ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
        ctx.letterSpacing = '6px';
        ctx.fillText(ctaDomain.toUpperCase(), W / 2, 140);

        // 5. Scene Rendering depending on mode
        if (videoMode === 'habit') {
            renderHabitVideo(ctx, W, H, p);
        } else {
            renderCommunityVideo(ctx, W, H, p);
        }
    }, [
        videoMode,
        overlayDarkness,
        ctaDomain,
        ctaAction,
        dayNumber,
        hookText,
        headlineText,
        subheadlineText,
        storyTitle,
        storyAuthor,
        poemTitle,
        poemAuthor,
        essayTitle,
        essayAuthor
    ]);

    // Render Habit Video logic
    const renderHabitVideo = (ctx: CanvasRenderingContext2D, W: number, H: number, p: number) => {
        // Scene 1: 0.0 - 0.28 Hook
        if (p < 0.28) {
            const subP = p / 0.28;
            const alpha = subP < 0.2 ? subP / 0.2 : subP > 0.8 ? (1 - subP) / 0.2 : 1;
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            // Pill Badge (auto width measurement to avoid text overflow)
            ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            const badgeW = Math.max(300, ctx.measureText(hookText).width + 60);
            ctx.fillStyle = 'rgba(224, 122, 95, 0.22)';
            roundRect(ctx, W / 2 - badgeW / 2, 480, badgeW, 56, 28, true, false);
            ctx.strokeStyle = '#E07A5F';
            ctx.lineWidth = 2;
            roundRect(ctx, W / 2 - badgeW / 2, 480, badgeW, 56, 28, false, true);
            ctx.fillStyle = '#E07A5F';
            ctx.fillText(hookText, W / 2, 515);

            // Headline
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 66px Georgia, serif';
            ctx.letterSpacing = '0.5px';
            ctx.fillText(headlineText, W / 2, 660);

            // Subheadline
            ctx.fillStyle = 'rgba(244, 239, 235, 0.82)';
            ctx.font = 'italic 34px Georgia, serif';
            ctx.fillText(subheadlineText, W / 2, 850);

            ctx.globalAlpha = 1.0;
        }
        // Scene 2: 0.28 - 0.58 The Three Pieces
        else if (p >= 0.28 && p < 0.58) {
            const subP = (p - 0.28) / 0.30;
            const alpha = subP < 0.15 ? subP / 0.15 : subP > 0.85 ? (1 - subP) / 0.15 : 1;
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            ctx.fillStyle = '#D4A373';
            ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.letterSpacing = '4px';
            ctx.fillText('THE RAY BRADBURY RITUAL', W / 2, 380);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 60px Georgia, serif';
            ctx.fillText('Three Daily Pieces', W / 2, 470);

            const cards = [
                { type: '1 POEM', title: poemTitle, author: poemAuthor, icon: '🪶', y: 580 },
                { type: '1 ESSAY', title: essayTitle, author: essayAuthor, icon: '💡', y: 840 },
                { type: '1 SHORT STORY', title: storyTitle, author: storyAuthor, icon: '📖', y: 1100 }
            ];

            cards.forEach((c, idx) => {
                const cardSlide = Math.min(1, Math.max(0, (subP * 3) - idx));
                const offsetY = (1 - cardSlide) * 35;
                ctx.save();
                ctx.translate(0, offsetY);

                // Deep backdrop panel to guarantee contrast against any photo
                ctx.fillStyle = 'rgba(18, 22, 28, 0.88)';
                roundRect(ctx, 110, c.y, W - 220, 215, 24, true, false);
                ctx.strokeStyle = idx === 0 ? 'rgba(212, 163, 115, 0.5)' : 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 2;
                roundRect(ctx, 110, c.y, W - 220, 215, 24, false, true);

                // Category tag
                ctx.fillStyle = '#D4A373';
                ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
                ctx.textAlign = 'left';
                ctx.fillText(`${c.icon}  ${c.type}`, 155, c.y + 60);

                // Title with truncation measurement
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '600 36px Georgia, serif';
                const maxTitleW = W - 350;
                let displayTitle = c.title;
                if (ctx.measureText(displayTitle).width > maxTitleW) {
                    while (ctx.measureText(displayTitle + '...').width > maxTitleW && displayTitle.length > 0) {
                        displayTitle = displayTitle.slice(0, -1);
                    }
                    displayTitle += '...';
                }
                ctx.fillText(displayTitle, 155, c.y + 118);

                // Author
                ctx.fillStyle = 'rgba(244, 239, 235, 0.78)';
                ctx.font = 'italic 26px Georgia, serif';
                ctx.fillText(`by ${c.author}`, 155, c.y + 168);

                ctx.restore();
            });

            ctx.globalAlpha = 1.0;
        }
        // Scene 3: 0.58 - 0.82 Immersive Reading
        else if (p >= 0.58 && p < 0.82) {
            const subP = (p - 0.58) / 0.24;
            const alpha = subP < 0.15 ? subP / 0.15 : subP > 0.85 ? (1 - subP) / 0.15 : 1;
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            ctx.fillStyle = 'rgba(16, 20, 26, 0.96)';
            roundRect(ctx, 100, 320, W - 200, 1180, 28, true, false);
            ctx.strokeStyle = 'rgba(212, 163, 115, 0.4)';
            ctx.lineWidth = 2;
            roundRect(ctx, 100, 320, W - 200, 1180, 28, false, true);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#D4A373';
            ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.fillText('READING PAUSE • MIDDAY RITUAL', 150, 400);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 46px Georgia, serif';
            ctx.fillText(storyTitle, 150, 475);

            ctx.fillStyle = 'rgba(244, 239, 235, 0.7)';
            ctx.font = 'italic 28px Georgia, serif';
            ctx.fillText(`by ${storyAuthor}`, 150, 525);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.moveTo(150, 575);
            ctx.lineTo(W - 150, 575);
            ctx.stroke();

            // Story passage
            ctx.save();
            ctx.beginPath();
            ctx.rect(150, 610, W - 300, 780);
            ctx.clip();

            ctx.fillStyle = '#F4EFEB';
            ctx.font = '33px/1.8 Georgia, serif';
            const passage = [
                "The sign on the wall seemed to quaver under a film of",
                "sliding water. Eckels felt his eyelids blink over his stare.",
                "The words burned quietly into the quiet morning:",
                "",
                "A gentle pause stolen back from the noise of the modern world.",
                "Three timeless works to inspire your thinking.",
                "Read deeply, return refreshed."
            ];
            const scrollOffset = subP * 60;
            passage.forEach((line, idx) => {
                ctx.fillText(line, 150, 670 + (idx * 55) - scrollOffset);
            });
            ctx.restore();

            // Completed badge
            ctx.fillStyle = 'rgba(42, 157, 143, 0.25)';
            roundRect(ctx, 150, 1400, W - 300, 60, 30, true, false);
            ctx.fillStyle = '#2A9D8F';
            ctx.textAlign = 'center';
            ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.fillText('✓ READING COMPLETED • STREAK RECORDED', W / 2, 1438);

            ctx.globalAlpha = 1.0;
        }
        // Scene 4: 0.82 - 1.00 Final Streak & CTA Ending with dailyreads.eu
        else {
            const subP = (p - 0.82) / 0.18;
            ctx.globalAlpha = Math.min(1, subP / 0.2);

            const halo = ctx.createRadialGradient(W / 2, 700, 50, W / 2, 700, 360);
            halo.addColorStop(0, 'rgba(212, 163, 115, 0.32)');
            halo.addColorStop(1, 'rgba(212, 163, 115, 0)');
            ctx.fillStyle = halo;
            ctx.fillRect(0, 400, W, 700);

            // Streak Circle Badge
            ctx.fillStyle = 'rgba(20, 24, 30, 0.94)';
            ctx.beginPath();
            ctx.arc(W / 2, 680, 165, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#D4A373';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.fillStyle = '#D4A373';
            ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.fillText('CURRENT HABIT', W / 2, 610);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 108px Georgia, serif';
            ctx.fillText(`DAY ${dayNumber}`, W / 2, 720);

            ctx.fillStyle = 'rgba(244, 239, 235, 0.85)';
            ctx.font = 'italic 28px Georgia, serif';
            ctx.fillText('Continuous Reading Ritual', W / 2, 775);

            // CTA Button with clear contrast
            ctx.fillStyle = '#D4A373';
            roundRect(ctx, 150, 1020, W - 300, 90, 45, true, false);

            ctx.fillStyle = '#101216';
            ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(ctaAction, W / 2, 1076);

            ctx.fillStyle = 'rgba(244, 239, 235, 0.7)';
            ctx.font = '400 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(`Go to ${ctaDomain}`, W / 2, 1170);

            ctx.globalAlpha = 1.0;
        }
    };

    // Render Community Video logic
    const renderCommunityVideo = (ctx: CanvasRenderingContext2D, W: number, H: number, p: number) => {
        if (p < 0.28) {
            const subP = p / 0.28;
            const alpha = subP < 0.2 ? subP / 0.2 : subP > 0.8 ? (1 - subP) / 0.2 : 1;
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            ctx.fillStyle = 'rgba(212, 163, 115, 0.22)';
            roundRect(ctx, W / 2 - 180, 480, 360, 56, 28, true, false);
            ctx.strokeStyle = '#D4A373';
            ctx.lineWidth = 2;
            roundRect(ctx, W / 2 - 180, 480, 360, 56, 28, false, true);
            ctx.fillStyle = '#D4A373';
            ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.fillText('FOR WRITERS & POETS', W / 2, 515);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 68px Georgia, serif';
            ctx.fillText('Write. Publish.', W / 2, 650);
            ctx.fillText('Be Heard.', W / 2, 730);

            ctx.fillStyle = 'rgba(244, 239, 235, 0.8)';
            ctx.font = 'italic 34px Georgia, serif';
            ctx.fillText('Members are not just readers.', W / 2, 850);
            ctx.fillText('Share your own stories with the community.', W / 2, 910);

            ctx.globalAlpha = 1.0;
        } else if (p >= 0.28 && p < 0.58) {
            const subP = (p - 0.28) / 0.30;
            const alpha = subP < 0.15 ? subP / 0.15 : subP > 0.85 ? (1 - subP) / 0.15 : 1;
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            ctx.fillStyle = '#D4A373';
            ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.letterSpacing = '4px';
            ctx.fillText('COMMUNITY LEADERBOARD', W / 2, 380);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 60px Georgia, serif';
            ctx.fillText('Discovered by Readers', W / 2, 470);

            const items = [
                { rank: '#1', title: 'The Solitary Lighthouse', author: 'Clara Oswald', type: 'Short Story', votes: '+24', y: 580 },
                { rank: '#2', title: 'Echoes of Autumn Rain', author: 'Julian Vance', type: 'Poem', votes: '+18', y: 840 },
                { rank: '#3', title: 'Why We Need Stillness', author: 'Marcus H.', type: 'Essay', votes: '+15', y: 1100 }
            ];

            items.forEach((item, idx) => {
                ctx.save();
                ctx.fillStyle = 'rgba(20, 24, 30, 0.9)';
                roundRect(ctx, 110, item.y, W - 220, 215, 24, true, false);
                ctx.strokeStyle = idx === 0 ? 'rgba(212, 163, 115, 0.55)' : 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 2;
                roundRect(ctx, 110, item.y, W - 220, 215, 24, false, true);

                ctx.fillStyle = '#D4A373';
                ctx.font = '700 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
                ctx.textAlign = 'left';
                ctx.fillText(item.rank, 155, item.y + 60);

                ctx.fillStyle = 'rgba(244, 239, 235, 0.6)';
                ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
                ctx.fillText(`•  ${item.type.toUpperCase()}`, 225, item.y + 60);

                ctx.fillStyle = '#FFFFFF';
                ctx.font = '600 36px Georgia, serif';
                ctx.fillText(item.title, 155, item.y + 118);

                ctx.fillStyle = 'rgba(244, 239, 235, 0.75)';
                ctx.font = 'italic 26px Georgia, serif';
                ctx.fillText(`by ${item.author}`, 155, item.y + 168);

                // Upvote button
                ctx.fillStyle = 'rgba(42, 157, 143, 0.22)';
                roundRect(ctx, W - 310, item.y + 70, 150, 68, 34, true, false);
                ctx.strokeStyle = '#2A9D8F';
                ctx.lineWidth = 2;
                roundRect(ctx, W - 310, item.y + 70, 150, 68, 34, false, true);

                ctx.fillStyle = '#2A9D8F';
                ctx.textAlign = 'center';
                ctx.font = '700 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
                ctx.fillText(`▲ ${item.votes}`, W - 235, item.y + 112);

                ctx.restore();
            });

            ctx.globalAlpha = 1.0;
        } else if (p >= 0.58 && p < 0.82) {
            const subP = (p - 0.58) / 0.24;
            const alpha = subP < 0.15 ? subP / 0.15 : subP > 0.85 ? (1 - subP) / 0.15 : 1;
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            ctx.fillStyle = 'rgba(16, 20, 26, 0.96)';
            roundRect(ctx, 100, 360, W - 200, 1100, 28, true, false);
            ctx.strokeStyle = 'rgba(212, 163, 115, 0.4)';
            ctx.lineWidth = 2;
            roundRect(ctx, 100, 360, W - 200, 1100, 28, false, true);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#D4A373';
            ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.fillText('AUTHOR PORTAL • PUBLISH WORK', 150, 440);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 46px Georgia, serif';
            ctx.fillText('Publish Your Story', 150, 520);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            roundRect(ctx, 150, 580, W - 300, 70, 12, true, false);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText('Title: A Winter in Florence', 180, 625);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            roundRect(ctx, 150, 680, W - 300, 560, 18, true, false);
            ctx.fillStyle = '#F4EFEB';
            ctx.font = 'italic 30px/1.8 Georgia, serif';
            const textLines = [
                "The bells of Giotto’s tower began to toll across the river.",
                "Cold mist was clinging to the stone bridges like silk.",
                "He sat at the wooden table, coffee steaming in the frost,",
                "knowing that this morning, words would finally come.",
                "",
                "Your words are published live to thousands of thoughtful readers."
            ];
            textLines.forEach((tl, i) => {
                ctx.fillText(tl, 180, 750 + (i * 65));
            });

            ctx.fillStyle = '#D4A373';
            roundRect(ctx, 150, 1310, W - 300, 80, 40, true, false);
            ctx.fillStyle = '#101216';
            ctx.textAlign = 'center';
            ctx.font = '700 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText('✓ Publish to Community', W / 2, 1360);

            ctx.globalAlpha = 1.0;
        } else {
            const subP = (p - 0.82) / 0.18;
            ctx.globalAlpha = Math.min(1, subP / 0.2);

            const halo = ctx.createRadialGradient(W / 2, 700, 50, W / 2, 700, 360);
            halo.addColorStop(0, 'rgba(42, 157, 143, 0.28)');
            halo.addColorStop(1, 'rgba(42, 157, 143, 0)');
            ctx.fillStyle = halo;
            ctx.fillRect(0, 400, W, 700);

            ctx.fillStyle = 'rgba(20, 24, 30, 0.94)';
            ctx.beginPath();
            ctx.arc(W / 2, 680, 165, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2A9D8F';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.fillStyle = '#2A9D8F';
            ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.fillText('JOIN THE COMMUNITY', W / 2, 610);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 74px Georgia, serif';
            ctx.fillText('WRITE &', W / 2, 700);
            ctx.fillText('INSPIRE', W / 2, 770);

            ctx.fillStyle = '#2A9D8F';
            roundRect(ctx, 150, 1020, W - 300, 90, 45, true, false);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(`Publish Now → ${ctaDomain}`, W / 2, 1076);

            ctx.fillStyle = 'rgba(244, 239, 235, 0.7)';
            ctx.font = '400 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(`Go to ${ctaDomain}`, W / 2, 1170);

            ctx.globalAlpha = 1.0;
        }
    };

    // Playback loop
    const playLoop = () => {
        const audio = audioRef.current;
        if (!audio) return;

        const currentProg = audio.currentTime / (audio.duration || 14.0);
        setProgress(currentProg);
        drawFrame(currentProg);

        if (!audio.ended && !audio.paused) {
            animationFrameRef.current = requestAnimationFrame(playLoop);
        } else {
            setIsPlaying(false);
            setProgress(1.0);
            drawFrame(1.0);
        }
    };

    const handleTogglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        } else {
            if (audio.currentTime >= (audio.duration || 14.0) - 0.2) {
                audio.currentTime = 0;
            }
            audio.play().catch(console.error);
            setIsPlaying(true);
            animationFrameRef.current = requestAnimationFrame(playLoop);
        }
    };

    const handleReset = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        setIsPlaying(false);
        setProgress(0);
        drawFrame(0.05);
    };

    // Export 1080x1920 WebM with audio
    const handleExport = () => {
        const canvas = canvasRef.current;
        const audio = audioRef.current;
        if (!canvas || !audio) return;

        setIsExporting(true);

        const stream = canvas.captureStream(60);

        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioCtx.createMediaElementSource(audio);
            const dest = audioCtx.createMediaStreamDestination();
            source.connect(dest);
            source.connect(audioCtx.destination);
            dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
        } catch (e) {
            console.warn('Audio context already hooked or CORS:', e);
        }

        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9,opus',
            videoBitsPerSecond: 8000000
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            setIsExporting(false);
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `dailyreads_${videoMode}_day_${dayNumber}_promo.webm`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        };

        audio.currentTime = 0;
        mediaRecorder.start();
        audio.play();
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(playLoop);

        setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }, (audio.duration || 14.0) * 1000 + 300);
    };

    // Initial frame render
    useEffect(() => {
        drawFrame(0.15);
    }, [drawFrame]);

    return (
        <Card className="border-border/60 bg-muted/20 backdrop-blur shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-xs">
                            <Film className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                Cinematic Promo Video Generator
                                <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-500 bg-amber-500/5">
                                    1080×1920 Clean Feed
                                </Badge>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Zero mouse cursor, zero watermarks. Edit any text or day number and export fresh 14s video ads with studio voiceovers.
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-medium shadow-sm h-9"
                        >
                            {isExporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                            {isExporting ? 'Exporting WebM...' : 'Export 1080×1920 WebM'}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 md:p-6 space-y-6">
                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-xl border border-border/40 max-w-md">
                    <button
                        onClick={() => {
                            setVideoMode('habit');
                            setSelectedBg('/backgrounds/calm-lake.jpg');
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                            videoMode === 'habit' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        1. Bradbury Habit & Streak
                    </button>
                    <button
                        onClick={() => {
                            setVideoMode('community');
                            setSelectedBg('/backgrounds/quiet-forest.jpg');
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                            videoMode === 'community' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        2. Member Author Publishing
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Video Canvas Preview Stage */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5 text-primary" />
                                1080×1920 Preview (Clean Cinema Feed)
                            </span>
                            <span className="font-mono text-[11px]">
                                {Math.round(progress * 100)}%
                            </span>
                        </div>

                        {/* Screen Canvas Preview */}
                        <div className="relative mx-auto max-w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-[9/16] flex items-center justify-center">
                            <canvas ref={canvasRef} className="w-full h-full object-cover select-none" />

                            {/* Floating Action Button */}
                            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                                <Button
                                    size="sm"
                                    onClick={handleTogglePlay}
                                    className="bg-black/75 hover:bg-black/90 backdrop-blur text-white border border-white/20 h-8 text-xs rounded-lg px-3"
                                >
                                    {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                                    {isPlaying ? 'Pause' : 'Play Preview'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleReset}
                                    className="bg-black/75 hover:bg-black/90 backdrop-blur text-white border border-white/20 h-8 text-xs rounded-lg px-2"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Hidden Audio */}
                        <audio
                            ref={audioRef}
                            src={videoMode === 'habit' ? '/audio/voiceover_promo_habit_studio.mp3' : '/audio/voiceover_promo_community_studio.mp3'}
                            preload="auto"
                        />

                        {/* Visual Contrast & Dimming Slider */}
                        <div className="p-3 rounded-xl bg-background/60 border border-border/40 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                    <Sliders className="h-3.5 w-3.5" />
                                    Text Contrast & Background Dimming:
                                </span>
                                <span className="font-mono text-[11px] font-bold">
                                    {Math.round(overlayDarkness * 100)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.45"
                                max="0.88"
                                step="0.02"
                                value={overlayDarkness}
                                onChange={(e) => {
                                    setOverlayDarkness(parseFloat(e.target.value));
                                    drawFrame(progress);
                                }}
                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <p className="text-[10px] text-muted-foreground/75">
                                Guarantees the text is easily legible regardless of phone screen brightness.
                            </p>
                        </div>
                    </div>

                    {/* Right: Customization Controls (Day, Titles, Authors, Ending CTA) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="p-4 rounded-xl bg-background/80 border border-border/60 space-y-4">
                            <div className="flex items-center justify-between border-b border-border/40 pb-3">
                                <div>
                                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                                        <Type className="h-4 w-4 text-amber-500" />
                                        <span>Customize Video Content</span>
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">
                                        Swap day numbers, featured pieces, or ending URLs anytime for new campaigns.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => drawFrame(progress)}
                                    className="text-xs h-7"
                                >
                                    Refresh Frame
                                </Button>
                            </div>

                            {/* Day Number & Ending CTA */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Day Number</label>
                                    <Input
                                        type="number"
                                        value={dayNumber}
                                        onChange={(e) => {
                                            setDayNumber(e.target.value);
                                            drawFrame(progress);
                                        }}
                                        className="font-mono text-xs h-8"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Ending Domain CTA</label>
                                    <Input
                                        value={ctaDomain}
                                        onChange={(e) => {
                                            setCtaDomain(e.target.value);
                                            setCtaAction(`Start Today → ${e.target.value}`);
                                            drawFrame(progress);
                                        }}
                                        className="font-mono text-xs h-8"
                                    />
                                </div>
                            </div>

                            {/* Hook Badge & Headline */}
                            <div className="space-y-3 pt-2 border-t border-border/40">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Opening Hook Pill</label>
                                    <Input
                                        value={hookText}
                                        onChange={(e) => {
                                            setHookText(e.target.value);
                                            drawFrame(progress);
                                        }}
                                        className="text-xs h-8"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Headline Text</label>
                                    <Input
                                        value={headlineText}
                                        onChange={(e) => {
                                            setHeadlineText(e.target.value);
                                            drawFrame(progress);
                                        }}
                                        className="text-xs h-8"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Subheadline</label>
                                    <Input
                                        value={subheadlineText}
                                        onChange={(e) => {
                                            setSubheadlineText(e.target.value);
                                            drawFrame(progress);
                                        }}
                                        className="text-xs h-8"
                                    />
                                </div>
                            </div>

                            {/* Three Pieces Shown on Screen */}
                            {videoMode === 'habit' && (
                                <div className="space-y-3 pt-2 border-t border-border/40">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                                        Three Displayed Pieces (Fitted cleanly in cards)
                                    </span>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <label className="text-[9px] text-muted-foreground">Poem Title</label>
                                            <Input
                                                value={poemTitle}
                                                onChange={(e) => {
                                                    setPoemTitle(e.target.value);
                                                    drawFrame(progress);
                                                }}
                                                className="h-7 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-muted-foreground">Poem Author</label>
                                            <Input
                                                value={poemAuthor}
                                                onChange={(e) => {
                                                    setPoemAuthor(e.target.value);
                                                    drawFrame(progress);
                                                }}
                                                className="h-7 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <label className="text-[9px] text-muted-foreground">Essay Title</label>
                                            <Input
                                                value={essayTitle}
                                                onChange={(e) => {
                                                    setEssayTitle(e.target.value);
                                                    drawFrame(progress);
                                                }}
                                                className="h-7 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-muted-foreground">Essay Author</label>
                                            <Input
                                                value={essayAuthor}
                                                onChange={(e) => {
                                                    setEssayAuthor(e.target.value);
                                                    drawFrame(progress);
                                                }}
                                                className="h-7 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <label className="text-[9px] text-muted-foreground">Story Title</label>
                                            <Input
                                                value={storyTitle}
                                                onChange={(e) => {
                                                    setStoryTitle(e.target.value);
                                                    drawFrame(progress);
                                                }}
                                                className="h-7 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-muted-foreground">Story Author</label>
                                            <Input
                                                value={storyAuthor}
                                                onChange={(e) => {
                                                    setStoryAuthor(e.target.value);
                                                    drawFrame(progress);
                                                }}
                                                className="h-7 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Voiceover Attribution */}
                            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <Volume2 className="h-4 w-4 text-emerald-500" />
                                    <div>
                                        <div className="font-semibold text-foreground">RyanNeural Calm Studio Audio</div>
                                        <div className="text-[10px] text-muted-foreground">Synchronized 14.0s duration • High-bitrate audio export</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono">
                                    Ready
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
