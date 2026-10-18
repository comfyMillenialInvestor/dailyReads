'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    PenTool,
    BookOpen,
    Quote,
    Feather,
    Scale,
    AlertCircle,
    Loader2,
    X,
    CheckCircle2,
    Info,
    ArrowRight,
    ArrowLeft,
    Languages,
    Sparkles,
    RefreshCw,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import type { IContent } from '@/lib/models/Content';

interface AuthorUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (item: IContent) => void;
    defaultAuthorName?: string;
}

export function AuthorUploadModal({
    isOpen,
    onClose,
    onSuccess,
    defaultAuthorName = '',
}: AuthorUploadModalProps) {
    const { lang } = useLanguage();
    const isDe = lang === 'de';

    // Step state: 'compose' -> 'review'
    const [step, setStep] = useState<'compose' | 'review'>('compose');

    // Compose fields
    const [type, setType] = useState<'poem' | 'short_story' | 'quote'>('short_story');
    const [title, setTitle] = useState('');
    const [authorName, setAuthorName] = useState(defaultAuthorName);
    const [content, setContent] = useState('');
    // Only two languages offered: German or English
    const [sourceLang, setSourceLang] = useState<'de' | 'en'>(isDe ? 'de' : 'en');

    // Dual-language translated fields
    const [titleDe, setTitleDe] = useState('');
    const [contentDe, setContentDe] = useState('');
    const [titleEn, setTitleEn] = useState('');
    const [contentEn, setContentEn] = useState('');

    // Tab state for review on mobile
    const [activeReviewTab, setActiveReviewTab] = useState<'de' | 'en'>('de');

    // Legal & Submission
    const [copyrightAgreed, setCopyrightAgreed] = useState(false);
    const [showFullTerms, setShowFullTerms] = useState(false);

    // Loading & Feedback
    const [translating, setTranslating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Calculated metrics for draft
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const estReadMinutes = Math.max(1, Math.ceil(words / 180));

    if (!isOpen) return null;

    const handleTranslateAndReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError(isDe ? 'Bitte gib einen Titel ein.' : 'Please provide a title.');
            return;
        }

        if (content.trim().length < 10) {
            setError(
                isDe
                    ? 'Der Textinhalt muss mindestens 10 Zeichen lang sein.'
                    : 'The text content must be at least 10 characters long.'
            );
            return;
        }

        setTranslating(true);

        try {
            const res = await fetch('/api/community/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    type,
                    sourceLang,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Fehler bei der Übersetzung.');
            }

            setTitleDe(data.title_de || title);
            setContentDe(data.content_de || content);
            setTitleEn(data.title_en || title);
            setContentEn(data.content_en || content);

            // Pre-select the other language tab on mobile so they immediately see the translation
            setActiveReviewTab(sourceLang === 'de' ? 'en' : 'de');
            setStep('review');
        } catch (err: any) {
            console.error('Translation error:', err);
            // Fallback: copy directly if translation service fails
            if (sourceLang === 'de') {
                setTitleDe(title);
                setContentDe(content);
                setTitleEn(title);
                setContentEn(content);
            } else {
                setTitleEn(title);
                setContentEn(content);
                setTitleDe(title);
                setContentDe(content);
            }
            setError(
                isDe
                    ? 'Übersetzungsservice vorübergehend nicht erreichbar. Du kannst die Übersetzung manuell eingeben.'
                    : 'Translation service unavailable. You can enter the translation manually.'
            );
            setStep('review');
        } finally {
            setTranslating(false);
        }
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!copyrightAgreed) {
            setError(
                isDe
                    ? 'Bitte bestätige die Urheberrechts- und Veröffentlichungsvereinbarung.'
                    : 'Please accept the copyright and publishing declaration.'
            );
            return;
        }

        setPublishing(true);

        try {
            const res = await fetch('/api/community/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: sourceLang === 'de' ? titleDe : titleEn,
                    content: sourceLang === 'de' ? contentDe : contentEn,
                    title_de: titleDe.trim(),
                    content_de: contentDe.trim(),
                    title_en: titleEn.trim(),
                    content_en: contentEn.trim(),
                    type,
                    authorName: authorName.trim() || defaultAuthorName || 'Autor',
                    copyrightAgreed: true,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Fehler beim Veröffentlichen.');
            }

            setSuccessMessage(
                isDe
                    ? 'Dein Werk wurde erfolgreich auf Deutsch und Englisch veröffentlicht!'
                    : 'Your work has been published in both German and English!'
            );

            if (onSuccess && data.item) {
                onSuccess(data.item);
            }

            setTimeout(() => {
                onClose();
                // Reset form
                setStep('compose');
                setTitle('');
                setContent('');
                setTitleDe('');
                setContentDe('');
                setTitleEn('');
                setContentEn('');
                setCopyrightAgreed(false);
                setSuccessMessage(null);
            }, 1200);
        } catch (err: any) {
            setError(err.message || (isDe ? 'Ein Fehler ist aufgetreten.' : 'An error occurred.'));
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className={cn(
                "relative w-full bg-card border border-border shadow-2xl rounded-2xl overflow-hidden my-6 transition-all duration-300",
                step === 'review' ? "max-w-4xl" : "max-w-2xl"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            {step === 'review' ? <Languages className="h-5 w-5" /> : <PenTool className="h-5 w-5" />}
                        </div>
                        <div>
                            <h2 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                                <span>{step === 'compose' ? (isDe ? 'Eigenes Werk verfassen' : 'Compose Your Piece') : (isDe ? 'Zweisprachige Vorschau (DE & EN)' : 'Dual-Language Preview (DE & EN)')}</span>
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    {step === 'compose' ? (isDe ? 'Schritt 1 von 2' : 'Step 1 of 2') : (isDe ? 'Schritt 2 von 2' : 'Step 2 of 2')}
                                </span>
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {step === 'compose'
                                    ? (isDe ? 'Schreibe dein Werk. Wir erstellen automatisch die Übersetzung.' : 'Write your piece. We will generate the translation for you.')
                                    : (isDe ? 'Daily Reads bietet Texte auf Deutsch & Englisch an. Überprüfe beide Fassungen.' : 'Daily Reads exclusively offers texts in German & English. Review both versions.')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Schließen"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Step 1: Compose Mode */}
                {step === 'compose' && (
                    <form onSubmit={handleTranslateAndReview} className="p-6 space-y-5">
                        {/* Format / Type Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {isDe ? 'Art des Werkes' : 'Format / Type'}
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setType('short_story')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer",
                                        type === 'short_story'
                                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                            : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                                    )}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="text-xs">{isDe ? 'Kurzgeschichte' : 'Short Story'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setType('poem')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer",
                                        type === 'poem'
                                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                            : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                                    )}
                                >
                                    <Feather className="h-4 w-4" />
                                    <span className="text-xs">{isDe ? 'Gedicht' : 'Poem'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setType('quote')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer",
                                        type === 'quote'
                                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                            : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                                    )}
                                >
                                    <Quote className="h-4 w-4" />
                                    <span className="text-xs">{isDe ? 'Zitat / Gedanke' : 'Quote / Thought'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Language of Draft (Strictly German or English only) */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {isDe ? 'Sprache des verfassten Textes' : 'Language of your text'}
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSourceLang('de')}
                                    className={cn(
                                        "flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-medium",
                                        sourceLang === 'de'
                                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                            : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                                    )}
                                >
                                    <span className="text-base">🇩🇪</span>
                                    <span>Deutsch (German)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSourceLang('en')}
                                    className={cn(
                                        "flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-medium",
                                        sourceLang === 'en'
                                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                            : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                                    )}
                                >
                                    <span className="text-base">🇬🇧</span>
                                    <span>English (Englisch)</span>
                                </button>
                            </div>
                            <p className="text-[11px] text-muted-foreground italic">
                                {isDe
                                    ? `Die jeweils andere Sprache (${sourceLang === 'de' ? 'Englisch' : 'Deutsch'}) wird im nächsten Schritt automatisch übersetzt und zur Prüfung angezeigt.`
                                    : `The matching translation (${sourceLang === 'de' ? 'English' : 'German'}) will be generated in the next step for your review.`}
                            </p>
                        </div>

                        {/* Title & Author Pen Name */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="author-title" className="text-xs font-semibold">
                                    {isDe ? 'Titel des Werkes' : 'Title'} *
                                </Label>
                                <Input
                                    id="author-title"
                                    placeholder={sourceLang === 'de' ? 'z. B. Der Klang der Dämmerung' : 'e.g. The Sound of Dusk'}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={120}
                                    required
                                    className="font-serif"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="author-penname" className="text-xs font-semibold">
                                    {isDe ? 'Autorenname / Pseudonym' : 'Author Name / Pen Name'}
                                </Label>
                                <Input
                                    id="author-penname"
                                    placeholder={defaultAuthorName || 'Dein Autorenname'}
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    maxLength={60}
                                />
                            </div>
                        </div>

                        {/* Content TextArea */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="author-content" className="text-xs font-semibold">
                                    {isDe ? 'Textinhalt (Markdown unterstützt)' : 'Content (Markdown supported)'} *
                                </Label>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                    {words} {isDe ? 'Wörter' : 'words'} • ~{estReadMinutes} min {isDe ? 'Lesezeit' : 'read'}
                                </span>
                            </div>
                            <textarea
                                id="author-content"
                                rows={type === 'quote' ? 4 : 7}
                                placeholder={
                                    type === 'poem'
                                        ? sourceLang === 'de'
                                            ? 'Schreibe dein Gedicht hier...\nZeilenumbrüche werden übernommen.'
                                            : 'Write your poem here...\nLine breaks are preserved.'
                                        : type === 'quote'
                                        ? sourceLang === 'de'
                                            ? 'Ein prägnanter Gedanke oder Aphorismus...'
                                            : 'A concise thought or aphorism...'
                                        : sourceLang === 'de'
                                        ? 'Deine Kurzgeschichte... (Absätze mit doppelter Eingabetaste trennen)'
                                        : 'Your short story... (Separate paragraphs with double enter)'
                                }
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                className={cn(
                                    "w-full p-3.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground resize-y transition-all text-sm leading-relaxed",
                                    type === 'poem' ? "font-serif italic" : type === 'quote' ? "font-serif text-base" : "font-serif"
                                )}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Continue Button */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                disabled={translating}
                            >
                                {isDe ? 'Abbrechen' : 'Cancel'}
                            </Button>

                            <Button
                                type="submit"
                                disabled={translating || !title.trim() || content.trim().length < 10}
                                className="px-6 font-semibold shadow-md"
                            >
                                {translating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground" />
                                        <span>
                                            {sourceLang === 'de'
                                                ? 'Übersetze ins Englische...'
                                                : 'Übersetze ins Deutsche...'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>{isDe ? 'Übersetzung erstellen & prüfen' : 'Generate & Review Translation'}</span>
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 2: Dual-Language Review Mode */}
                {step === 'review' && (
                    <form onSubmit={handlePublish} className="p-6 space-y-5">
                        {/* Information Banner */}
                        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="text-xs leading-relaxed space-y-1">
                                <p className="font-bold text-foreground">
                                    {isDe
                                        ? 'Zweisprachige Publikation (Deutsch & Englisch)'
                                        : 'Bilingual Publication (German & English)'}
                                </p>
                                <p className="text-muted-foreground">
                                    {isDe
                                        ? 'Daily Reads bietet Inhalte ausschließlich auf Deutsch und Englisch an. Beide Versionen stehen den Lesern je nach Spracheinstellung zur Verfügung. Du kannst beide Fassungen hier vor dem Upload überprüfen und verfeinern.'
                                        : 'Daily Reads exclusively offers texts in German and English. Both versions will be available according to the reader\'s language setting. You can review and refine both texts below before publishing.'}
                                </p>
                            </div>
                        </div>

                        {/* Mobile Language Toggle */}
                        <div className="md:hidden flex rounded-xl border border-border/50 p-1 bg-muted/20">
                            <button
                                type="button"
                                onClick={() => setActiveReviewTab('de')}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all",
                                    activeReviewTab === 'de' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                                )}
                            >
                                <span>🇩🇪</span>
                                <span>{isDe ? 'Deutsche Fassung' : 'German Version'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveReviewTab('en')}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all",
                                    activeReviewTab === 'en' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                                )}
                            >
                                <span>🇬🇧</span>
                                <span>{isDe ? 'Englische Fassung' : 'English Version'}</span>
                            </button>
                        </div>

                        {/* Dual Language Side-by-Side (Desktop) / Tabbed (Mobile) */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* German Column */}
                            <div className={cn(
                                "space-y-3 p-4 rounded-xl border border-border/60 bg-muted/10",
                                activeReviewTab !== 'de' && "hidden md:block"
                            )}>
                                <div className="flex items-center justify-between pb-1 border-b border-border/30">
                                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                                        <span className="text-base">🇩🇪</span>
                                        <span>{isDe ? 'Deutsche Fassung' : 'German Version'}</span>
                                        {sourceLang === 'de' && (
                                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                                                {isDe ? 'Original' : 'Source'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {contentDe.split(/\s+/).filter(Boolean).length} {isDe ? 'Wörter' : 'words'}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-muted-foreground">Titel (DE)</Label>
                                    <Input
                                        value={titleDe}
                                        onChange={(e) => setTitleDe(e.target.value)}
                                        className="font-serif text-sm font-semibold"
                                        placeholder="Deutscher Titel"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-muted-foreground">Inhalt (DE)</Label>
                                    <textarea
                                        rows={type === 'quote' ? 5 : 9}
                                        value={contentDe}
                                        onChange={(e) => setContentDe(e.target.value)}
                                        className={cn(
                                            "w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground resize-y text-xs leading-relaxed font-serif",
                                            type === 'poem' && "italic"
                                        )}
                                        placeholder="Deutscher Textinhalt..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* English Column */}
                            <div className={cn(
                                "space-y-3 p-4 rounded-xl border border-border/60 bg-muted/10",
                                activeReviewTab !== 'en' && "hidden md:block"
                            )}>
                                <div className="flex items-center justify-between pb-1 border-b border-border/30">
                                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                                        <span className="text-base">🇬🇧</span>
                                        <span>{isDe ? 'Englische Fassung' : 'English Version'}</span>
                                        {sourceLang === 'en' && (
                                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                                                {isDe ? 'Original' : 'Source'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {contentEn.split(/\s+/).filter(Boolean).length} words
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-muted-foreground">Title (EN)</Label>
                                    <Input
                                        value={titleEn}
                                        onChange={(e) => setTitleEn(e.target.value)}
                                        className="font-serif text-sm font-semibold"
                                        placeholder="English Title"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-muted-foreground">Content (EN)</Label>
                                    <textarea
                                        rows={type === 'quote' ? 5 : 9}
                                        value={contentEn}
                                        onChange={(e) => setContentEn(e.target.value)}
                                        className={cn(
                                            "w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground resize-y text-xs leading-relaxed font-serif",
                                            type === 'poem' && "italic"
                                        )}
                                        placeholder="English content..."
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bulletproof Copyright & Legal Disclaimer Box */}
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                            <div className="flex items-start gap-2.5">
                                <Scale className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div className="space-y-1 text-xs leading-relaxed">
                                    <p className="font-bold text-foreground flex items-center gap-1.5">
                                        <span>{isDe ? 'Urheberrecht & Rechtliche Zusicherung' : 'Copyright & Legal Declaration'}</span>
                                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-primary/20 text-primary">
                                            {isDe ? 'Geschützt' : 'Protected'}
                                        </span>
                                    </p>
                                    <p className="text-muted-foreground">
                                        {isDe ? (
                                            <>
                                                <strong>Daily Reads beansprucht keinerlei Copyright an deinem Werk.</strong> Das geistige Eigentum verbleibt zu 100 % bei dir als Autor. Der Upload erfolgt freiwillig. Du erteilst Daily Reads lediglich das einfache Nutzungsrecht, den Text in beiden Sprachen auf der Plattform darzustellen und im Leaderboard für Leser bewertbar zu machen.
                                            </>
                                        ) : (
                                            <>
                                                <strong>Daily Reads claims NO copyright over your work.</strong> Intellectual property remains 100% yours. You publish voluntarily and grant Daily Reads a simple, royalty-free license to display your text in both languages and include it in leaderboard rankings.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Mandatory Checkbox */}
                            <label className="flex items-start gap-2.5 pt-2 border-t border-border/40 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={copyrightAgreed}
                                    onChange={(e) => setCopyrightAgreed(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                                    required
                                />
                                <span className="text-xs text-foreground font-medium leading-snug">
                                    {isDe ? (
                                        <>
                                            Ich bestätige verbindlich, dass ich der <strong>alleinige Urheber</strong> dieses Werkes bin, der Upload <strong>freiwillig</strong> erfolgt und Daily Reads <strong>kein Copyright</strong> an meinem Werk beansprucht. Ich akzeptiere die Bedingungen.
                                        </>
                                    ) : (
                                        <>
                                            I confirm that I am the <strong>sole author</strong> of this work, this upload is <strong>voluntary</strong>, and Daily Reads claims <strong>no copyright</strong> on my work. I accept the publishing terms.
                                        </>
                                    )}
                                </span>
                            </label>
                        </div>

                        {/* Error & Success Messages */}
                        {error && (
                            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep('compose')}
                                disabled={publishing}
                                className="flex items-center gap-1.5"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>{isDe ? 'Entwurf bearbeiten' : 'Edit Draft'}</span>
                            </Button>

                            <Button
                                type="submit"
                                disabled={publishing || !copyrightAgreed || !titleDe.trim() || !titleEn.trim() || !contentDe.trim() || !contentEn.trim()}
                                className="px-6 font-semibold shadow-md"
                            >
                                {publishing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground" />
                                        <span>{isDe ? 'Wird veröffentlicht...' : 'Publishing...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        <span>{isDe ? 'In beiden Sprachen veröffentlichen' : 'Publish in Both Languages'}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
