'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { IContent } from '@/lib/models/Content';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface TextReaderModalProps {
    item: IContent | null;
    onClose: () => void;
}

export function TextReaderModal({ item, onClose }: TextReaderModalProps) {
    const { lang, t } = useLanguage();
    const [readerTextSize, setReaderTextSize] = React.useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('lg');
    const [readerTheme, setReaderTheme] = React.useState<'system' | 'sepia' | 'dark'>('system');
    const [scrollProgress, setScrollProgress] = React.useState(0);
    const readerScrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!item) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [item, onClose]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight <= clientHeight) {
            setScrollProgress(100);
            return;
        }
        const progress = Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100));
        setScrollProgress(progress);
    };

    const increaseTextSize = () => {
        const sizes: Array<'sm' | 'base' | 'lg' | 'xl' | '2xl'> = ['sm', 'base', 'lg', 'xl', '2xl'];
        const currentIndex = sizes.indexOf(readerTextSize);
        if (currentIndex < sizes.length - 1) {
            setReaderTextSize(sizes[currentIndex + 1]);
        }
    };

    const decreaseTextSize = () => {
        const sizes: Array<'sm' | 'base' | 'lg' | 'xl' | '2xl'> = ['sm', 'base', 'lg', 'xl', '2xl'];
        const currentIndex = sizes.indexOf(readerTextSize);
        if (currentIndex > 0) {
            setReaderTextSize(sizes[currentIndex - 1]);
        }
    };

    const getTypeLabel = (type: string) => {
        if (type === 'quote' || type === 'idea') return t('carousel.type.idea') || (lang === 'de' ? 'Idee' : 'Idea');
        if (type === 'short_story') return t('carousel.type.short_story') || (lang === 'de' ? 'Geschichte' : 'Short Story');
        if (type === 'poem') return t('carousel.type.poem') || (lang === 'de' ? 'Gedicht' : 'Poem');
        if (type === 'essay') return t('carousel.type.essay') || 'Story';
        return type.replace('_', ' ');
    };

    if (!item) return null;

    return (
        <div
            ref={readerScrollRef}
            onScroll={handleScroll}
            className={cn(
                "fixed inset-0 z-50 overflow-y-auto flex flex-col transition-colors duration-300 animate-in fade-in zoom-in-95",
                readerTheme === 'sepia' && "bg-[#FBF6EF] text-[#332A22]",
                readerTheme === 'dark' && "bg-[#121317] text-zinc-100",
                readerTheme === 'system' && "bg-background text-foreground"
            )}
        >
            {/* Top Sticky Header */}
            <div
                className={cn(
                    "sticky top-0 z-10 backdrop-blur-md border-b px-3 md:px-6 py-2 md:py-3 flex items-center justify-between transition-colors",
                    readerTheme === 'sepia' && "border-[#E6DEC9]/60 bg-[#FBF6EF]/90",
                    readerTheme === 'dark' && "border-[#2F3034] bg-[#121317]/90",
                    readerTheme === 'system' && "border-border/60 bg-background/90"
                )}
            >
                <div className="flex-1 min-w-0 pr-2 md:pr-4">
                    <h2 className="text-xs md:text-sm font-bold truncate font-serif">
                        {lang === 'de' && item.title_de ? item.title_de : (item.title_en || item.title)}
                    </h2>
                    <p className="text-[10px] md:text-xs opacity-75 truncate font-sans">
                        by {item.author}
                    </p>
                </div>

                {/* Control Panel */}
                <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                    {/* Font Size Adjuster */}
                    <div className="flex items-center border rounded-full overflow-hidden p-0.5 bg-muted/20">
                        <button
                            onClick={decreaseTextSize}
                            className="p-1 px-1.5 md:px-2.5 text-[10px] md:text-xs font-semibold hover:bg-muted/40 rounded-full transition-colors"
                            title={t('carousel.decreaseTextSize')}
                        >
                            A-
                        </button>
                        <span className="text-[9px] md:text-[10px] uppercase font-bold opacity-60 px-1 md:px-1.5 border-x select-none hidden sm:inline">
                            {readerTextSize}
                        </span>
                        <button
                            onClick={increaseTextSize}
                            className="p-1 px-1.5 md:px-2.5 text-[10px] md:text-xs font-semibold hover:bg-muted/40 rounded-full transition-colors"
                            title={t('carousel.increaseTextSize')}
                        >
                            A+
                        </button>
                    </div>

                    {/* Reading Theme selector */}
                    <div className="flex items-center gap-1 md:gap-1.5 border rounded-full p-0.5 md:p-1 bg-muted/20">
                        <button
                            onClick={() => setReaderTheme('system')}
                            className={cn(
                                "h-4 w-4 md:h-5 md:w-5 rounded-full border transition-all bg-card cursor-pointer",
                                readerTheme === 'system' ? "ring-2 ring-primary border-transparent scale-110" : "opacity-75 hover:opacity-100"
                            )}
                            title={t('carousel.systemTheme')}
                        />
                        <button
                            onClick={() => setReaderTheme('sepia')}
                            className={cn(
                                "h-4 w-4 md:h-5 md:w-5 rounded-full border border-[#D5CBB3] bg-[#FBF6EF] transition-all cursor-pointer",
                                readerTheme === 'sepia' ? "ring-2 ring-amber-700/60 scale-110" : "opacity-75 hover:opacity-100"
                            )}
                            title={t('carousel.warmSepia')}
                        />
                        <button
                            onClick={() => setReaderTheme('dark')}
                            className={cn(
                                "h-4 w-4 md:h-5 md:w-5 rounded-full border border-zinc-800 bg-zinc-950 transition-all cursor-pointer",
                                readerTheme === 'dark' ? "ring-2 ring-zinc-400 scale-110" : "opacity-75 hover:opacity-100"
                            )}
                            title={t('carousel.darkTheme')}
                        />
                    </div>

                    {/* Exit Button */}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-full h-7 w-7 md:h-8 md:w-8 hover:bg-muted/50"
                        title={t('carousel.closeReader')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scroll Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/30">
                    <div
                        className={cn(
                            "h-full transition-all duration-75",
                            readerTheme === 'sepia' ? "bg-amber-700/80" : "bg-primary"
                        )}
                        style={{ width: `${scrollProgress}%` }}
                    />
                </div>
            </div>

            {/* Reader Text Area */}
            <div className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-20 flex flex-col justify-between">
                <div>
                    {/* Meta header in reader */}
                    <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
                        <span className={cn(
                            "inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full",
                            readerTheme === 'sepia' ? "bg-[#E6DEC9] text-[#5B4636]" : readerTheme === 'dark' ? "bg-zinc-800 text-zinc-300" : "bg-primary/10 text-primary"
                        )}>
                            {getTypeLabel(item.type)}
                        </span>
                        <h1 className="text-2xl md:text-5xl font-serif font-extrabold tracking-tight leading-tight">
                            {lang === 'de' && item.title_de ? item.title_de : (item.title_en || item.title)}
                        </h1>
                        <div className="text-sm md:text-lg opacity-85 font-serif italic">
                            by {item.author}
                        </div>
                        <div className="flex items-center justify-center gap-3 md:gap-4 text-[10px] md:text-xs opacity-60 font-sans flex-wrap">
                            {item.readTime && <span>{item.readTime} {t('carousel.read')}</span>}
                            {item.estimatedWords && <span>~{item.estimatedWords} {t('carousel.words')}</span>}
                            {item.source && !(item.source.startsWith("HF:") || item.source.startsWith("HF: ") || item.source.length > 20) && <span>{t('carousel.source')}: {item.source}</span>}
                        </div>
                        <div className="h-[1px] w-24 mx-auto bg-muted-foreground/30 my-4 md:my-6" />
                    </div>

                    {/* Main story text */}
                    <div className={cn(
                        "markdown-content prose-lg max-w-none leading-relaxed",
                        item.type === 'poem' ? 'poetry-mode font-serif pl-2 md:pl-12 italic' : (item.type === 'quote' || item.type === 'idea') ? 'quote-mode font-serif py-4' : 'prose-mode font-serif'
                    )}>
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => (
                                    <p
                                        className={cn(
                                            item.type === 'poem' ? 'mb-3' : (item.type === 'quote' || item.type === 'idea') ? 'mb-6 text-left font-serif text-xl md:text-2xl leading-relaxed' : 'mb-6 md:mb-8 text-left md:text-justify',
                                            readerTextSize === 'sm' && "text-sm md:text-base",
                                            readerTextSize === 'base' && "text-base md:text-lg",
                                            readerTextSize === 'lg' && "text-lg md:text-xl",
                                            readerTextSize === 'xl' && "text-xl md:text-2xl",
                                            readerTextSize === '2xl' && "text-2xl md:text-3xl leading-loose"
                                        )}
                                    >
                                        {children}
                                    </p>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-primary/50 pl-6 md:pl-8 py-4 my-6 italic text-xl md:text-3xl font-serif text-foreground/95 bg-primary/5 rounded-r-2xl">
                                        {children}
                                    </blockquote>
                                ),
                                em: ({ children }) => <em className="italic opacity-90">{children}</em>,
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                            }}
                        >
                            {lang === 'de' && item.content_de ? item.content_de : (item.content_en || item.content)}
                        </ReactMarkdown>
                        {item.source && (item.source.startsWith("HF:") || item.source.startsWith("HF: ") || item.source.length > 20) && (
                            <div className="mt-8 pt-4 border-t border-border/20 text-xs text-muted-foreground/50 font-sans italic text-center">
                                Source: {item.source}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reader mode footer */}
                <div className="mt-12 md:mt-16 text-center">
                    <div className="h-[1px] w-full bg-muted-foreground/20 my-6 md:my-8" />
                    <p className="text-sm opacity-60 italic font-serif mb-6">
                        {t('carousel.readerQuote')}
                    </p>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="rounded-full px-6 border-primary/20"
                    >
                        {t('carousel.finishReading')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
