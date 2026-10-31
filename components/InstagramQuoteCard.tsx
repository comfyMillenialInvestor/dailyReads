'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Copy, Check, RefreshCw, Sparkles, Image as ImageIcon, Instagram, Sliders, Eye } from 'lucide-react';

export interface BackgroundImageOption {
    id: string;
    name: string;
    src: string;
    preview: string;
}

export const CALM_BACKGROUNDS: BackgroundImageOption[] = [
    {
        id: 'calm-lake',
        name: 'Misty Lake',
        src: '/backgrounds/calm-lake.jpg',
        preview: '/backgrounds/calm-lake.jpg'
    },
    {
        id: 'morning-mist',
        name: 'Morning Mist',
        src: '/backgrounds/morning-mist.jpg',
        preview: '/backgrounds/morning-mist.jpg'
    },
    {
        id: 'quiet-forest',
        name: 'Quiet Forest',
        src: '/backgrounds/quiet-forest.jpg',
        preview: '/backgrounds/quiet-forest.jpg'
    },
    {
        id: 'serene-mountains',
        name: 'Muted Mountains',
        src: '/backgrounds/serene-mountains.jpg',
        preview: '/backgrounds/serene-mountains.jpg'
    },
    {
        id: 'starry-twilight',
        name: 'Dusk Twilight',
        src: '/backgrounds/starry-twilight.jpg',
        preview: '/backgrounds/starry-twilight.jpg'
    }
];

export interface InstagramQuoteCardProps {
    dayNumber: number | string;
    quote: string;
    author: string;
    sourceTitle?: string;
    theme?: string;
    readings?: Array<{ title: string; author: string; type?: string }>;
    onPostToX?: () => void;
}

export default function InstagramQuoteCard({
    dayNumber,
    quote,
    author,
    sourceTitle,
    theme,
    readings = [],
    onPostToX
}: InstagramQuoteCardProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [selectedBg, setSelectedBg] = useState<string>(CALM_BACKGROUNDS[0].src);
    const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1'>('4:5'); // 4:5 portrait is standard for Instagram feed
    const [overlayDarkness, setOverlayDarkness] = useState<number>(0.48); // 0 to 0.8
    const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Instagram formatted caption
    const cleanDay = String(dayNumber || '42').replace(/[^0-9]/g, '') || '42';
    
    // Pick the most evocative piece for the opening reflection
    const firstStoryOrPoem = readings.find(r => r.type === 'poem') || readings.find(r => r.type === 'short_story') || readings[0];
    const pieceMention = firstStoryOrPoem && firstStoryOrPoem.title ? `“${firstStoryOrPoem.title}” by ${firstStoryOrPoem.author}` : '';

    const formattedCaption = `${pieceMention ? `${pieceMention} — a quiet reflection for today.\n` : ''}Day ${cleanDay}

"${quote || 'Between the pages of a book is a lovely place to be.'}"
— ${author || 'Classic Author'}${sourceTitle ? `, ${sourceTitle}` : ''}

${readings.length > 0 ? `Today's three curated pieces for the pause:
${readings.map((r) => {
    const typeLabel = r.type === 'short_story' ? '• Story' : r.type === 'poem' ? '• Poem' : '• Idea';
    return `${typeLabel}: "${r.title}" by ${r.author}`;
}).join('\n')}\n` : ''}Three pieces waiting for today's pause → dailyreads.eu/today

#dailyreads #readingroutine #literature #classicquotes #slowliving #dailyquote #bookish #philosophy #readingcommunity`;

    const copyCaption = () => {
        navigator.clipboard.writeText(formattedCaption);
        setCopiedCaption(true);
        setTimeout(() => setCopiedCaption(null as any), 2500);
    };

    // Draw quote onto high-resolution canvas with calm aesthetic typography
    const renderCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Resolution: Instagram optimal dimensions
        const width = 1080;
        const height = aspectRatio === '4:5' ? 1350 : 1080;
        canvas.width = width;
        canvas.height = height;

        // Load background image
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => {
                // If local image fails, fall back to drawing solid deep calm gradient
                resolve();
            };
            img.src = selectedBg;
        });

        // 1. Draw image or fallback calm gradient
        if (img.width > 0) {
            // Draw image covering the canvas (cover fit)
            const scale = Math.max(width / img.width, height / img.height);
            const x = (width - img.width * scale) / 2;
            const y = (height - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        } else {
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, '#1c2226');
            grad.addColorStop(1, '#0e1215');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Add soft, dark atmospheric vignette overlay for extreme calm and readability
        ctx.fillStyle = `rgba(14, 18, 22, ${overlayDarkness})`;
        ctx.fillRect(0, 0, width, height);

        // Subtle gradient vignette from bottom & top
        const vignette = ctx.createLinearGradient(0, 0, 0, height);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
        vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Subtle inner frame border for editorial publication look
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.5;
        const margin = 50;
        ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

        // 3. Top Header: "DAILY READS • DAY XXX"
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(240, 235, 225, 0.85)';
        ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.letterSpacing = '5px';
        const topY = margin + 60;
        ctx.fillText(`DAILY READS  •  DAY ${cleanDay}`, width / 2, topY);

        // Subtitle line
        ctx.fillStyle = 'rgba(210, 205, 195, 0.6)';
        ctx.font = '400 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('THE BRADBURY RITUAL', width / 2, topY + 28);

        // Soft small decorative divider
        ctx.strokeStyle = 'rgba(240, 235, 225, 0.25)';
        ctx.beginPath();
        ctx.moveTo(width / 2 - 40, topY + 50);
        ctx.lineTo(width / 2 + 40, topY + 50);
        ctx.stroke();

        // 4. Quotation Mark Icon / Serif
        const quoteY = height * 0.35;
        ctx.fillStyle = 'rgba(235, 225, 205, 0.28)';
        ctx.font = 'italic 700 80px Georgia, serif';
        ctx.letterSpacing = '0px';
        ctx.fillText('“', width / 2, quoteY - 20);

        // 5. Quote Text (Multi-line wrapped, centered, elegant serif font)
        const quoteText = quote || 'To read is to fly: it is to soar to a point of vantage which gives a view over wide terrains of history.';
        
        // Dynamic font size depending on length
        let fontSize = 46;
        if (quoteText.length > 180) fontSize = 36;
        else if (quoteText.length > 120) fontSize = 40;
        else if (quoteText.length < 60) fontSize = 52;

        ctx.font = `italic 400 ${fontSize}px Georgia, "Times New Roman", serif`;
        ctx.fillStyle = '#FAF8F5';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        const maxTextWidth = width - 240; // generous breathing room
        const words = quoteText.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextWidth && currentLine) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeight = fontSize * 1.5;
        const totalQuoteHeight = lines.length * lineHeight;
        const quoteStartY = (height / 2) - (totalQuoteHeight / 2) + 10;

        lines.forEach((line, idx) => {
            ctx.fillText(line, width / 2, quoteStartY + idx * lineHeight);
        });

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // 6. Author Citation & Attribution
        const authorY = quoteStartY + totalQuoteHeight + 50;
        ctx.fillStyle = 'rgba(245, 240, 230, 0.95)';
        ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText(`—  ${(author || 'Unknown').toUpperCase()}  —`, width / 2, authorY);

        if (sourceTitle) {
            ctx.fillStyle = 'rgba(215, 210, 200, 0.65)';
            ctx.font = 'italic 19px Georgia, serif';
            ctx.letterSpacing = '1px';
            ctx.fillText(sourceTitle, width / 2, authorY + 30);
        }

        // 7. Footer Citation / DailyReads branding
        const footerY = height - margin - 35;
        ctx.fillStyle = 'rgba(240, 235, 225, 0.55)';
        ctx.font = '400 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.letterSpacing = '4px';
        ctx.fillText('DAILYREADS.EU', width / 2, footerY);

        return canvas;
    }, [aspectRatio, cleanDay, quote, author, sourceTitle, selectedBg, overlayDarkness]);

    // Update preview when dependencies change
    useEffect(() => {
        let isMounted = true;
        renderCanvas().then((canvas) => {
            if (canvas && isMounted) {
                setPreviewUrl(canvas.toDataURL('image/jpeg', 0.92));
            }
        });
        return () => {
            isMounted = false;
        };
    }, [renderCanvas]);

    // Download formatted JPEG for Instagram
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const canvas = await renderCanvas();
            if (!canvas) return;

            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            const link = document.createElement('a');
            link.download = `dailyreads-day-${cleanDay}-instagram.jpg`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Failed to download image:', e);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card className="border-border/60 bg-muted/20 backdrop-blur shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs">
                            <Instagram className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                Instagram Daily Quote Post
                                <Badge variant="outline" className="text-[10px] font-mono border-rose-500/30 text-rose-500 bg-rose-500/5">
                                    Day {cleanDay}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Calming, high-res formatted download with quote embedded + 1-click matching Instagram caption.
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-medium shadow-sm h-9"
                        >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            {isDownloading ? 'Rendering...' : 'Download Image for Instagram'}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Interactive Canvas Live Preview */}
                    <div className="lg:col-span-6 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5 text-primary" />
                                Live High-Res Image Preview ({aspectRatio})
                            </span>
                            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/40">
                                <button
                                    onClick={() => setAspectRatio('4:5')}
                                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                                        aspectRatio === '4:5'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    4:5 Portrait (Feed)
                                </button>
                                <button
                                    onClick={() => setAspectRatio('1:1')}
                                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                                        aspectRatio === '1:1'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    1:1 Square
                                </button>
                            </div>
                        </div>

                        {/* Hidden canvas used for rendering */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Rendered Preview Container */}
                        <div className="relative mx-auto max-w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 aspect-[4/5] flex items-center justify-center">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt={`Day ${cleanDay} quote on Instagram`}
                                    className="w-full h-full object-cover select-none"
                                />
                            ) : (
                                <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                                    Rendering calm preview...
                                </div>
                            )}

                            {/* Floating Download Button on Hover */}
                            <div className="absolute bottom-3 right-3 opacity-90 hover:opacity-100 transition-opacity">
                                <Button
                                    size="sm"
                                    onClick={handleDownload}
                                    className="text-xs bg-black/70 hover:bg-black/90 backdrop-blur-md text-white border border-white/20 h-8 px-2.5 rounded-lg shadow-lg"
                                >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download JPG
                                </Button>
                            </div>
                        </div>

                        {/* Calm Background Selector */}
                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    Calm Picture Mood
                                </span>
                                <span className="text-[10px] text-muted-foreground font-normal">
                                    5 Serene Minimal Sceneries
                                </span>
                            </label>

                            <div className="grid grid-cols-5 gap-2">
                                {CALM_BACKGROUNDS.map((bg) => {
                                    const isSelected = selectedBg === bg.src;
                                    return (
                                        <button
                                            key={bg.id}
                                            onClick={() => setSelectedBg(bg.src)}
                                            className={`group relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                                                isSelected
                                                    ? 'border-rose-500 ring-2 ring-rose-500/30 scale-105'
                                                    : 'border-border/60 hover:border-border opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={bg.preview}
                                                alt={bg.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                                            <span className="absolute bottom-1 inset-x-0 text-[9px] font-medium text-white truncate px-1 text-center leading-tight">
                                                {bg.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Overlay Darkness Slider */}
                            <div className="flex items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 text-[11px]">
                                    <Sliders className="h-3 w-3" />
                                    Text Contrast / Dimming:
                                </span>
                                <input
                                    type="range"
                                    min="0.25"
                                    max="0.75"
                                    step="0.05"
                                    value={overlayDarkness}
                                    onChange={(e) => setOverlayDarkness(parseFloat(e.target.value))}
                                    className="w-36 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                                <span className="font-mono text-[10px] w-8 text-right">
                                    {Math.round(overlayDarkness * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Instagram Caption + 1-Click Copy */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="p-4 rounded-xl bg-background/80 border border-border/60 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                                        <Instagram className="h-4 w-4 text-rose-500" />
                                        <span>Ready-to-Post Instagram Caption</span>
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">
                                        Includes Day {cleanDay}, the quote citation, today's 3 readings, and bio CTA.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyCaption}
                                    className="text-xs h-8 border-rose-500/30 hover:border-rose-500/60 text-rose-600 dark:text-rose-400"
                                >
                                    {copiedCaption ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5 mr-1" />
                                            <span>Copy Caption</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="relative">
                                <pre className="p-3.5 rounded-lg bg-muted/40 border border-border/40 font-sans text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[340px] overflow-y-auto select-all">
                                    {formattedCaption}
                                </pre>
                            </div>

                            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 text-[11px] text-muted-foreground">
                                <span>📱 1-Click: Download Image &rarr; Copy Caption &rarr; Post to Instagram Feed</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={copyCaption}
                                    className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-0"
                                >
                                    {copiedCaption ? '✓ Caption in clipboard' : 'Click to copy caption text'}
                                </Button>
                            </div>
                        </div>

                        {/* Summary of Quotes & Readings on Image */}
                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-2 text-xs">
                            <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                                Embedded on the Picture:
                            </span>
                            <blockquote className="font-serif italic text-foreground text-sm border-l-2 border-rose-500/40 pl-3 py-0.5">
                                "{quote || 'Reading quote of the day...'}"
                            </blockquote>
                            <div className="text-[11px] text-muted-foreground font-mono flex items-center justify-between pt-1">
                                <span>Citation: — {author}{sourceTitle ? `, ${sourceTitle}` : ''}</span>
                                <span className="text-primary font-semibold">Day {cleanDay}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
