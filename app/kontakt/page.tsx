'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, Maximize2, Minimize2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Kontakt() {
    const [message, setMessage] = useState('');
    const [isMessageExpanded, setIsMessageExpanded] = useState(false);
    const { t } = useLanguage();

    return (
        <div className="max-w-4xl mx-auto py-8 md:py-12 space-y-12 md:space-y-16 px-2">
            <section className="text-center space-y-4">
                <div className="flex justify-center mb-2">
                    <div className="p-2 bg-primary/5 rounded-full border border-primary/10 text-primary/60">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">{t('contact.title')}</h1>
                <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
                    {t('contact.subtitle')}
                </p>
            </section>

            <div className="grid md:grid-cols-5 gap-8 md:gap-12">
                <div className="md:col-span-3">
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 md:p-8 shadow-sm">
                        <form className="space-y-5 md:space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs uppercase tracking-wider font-semibold opacity-70">{t('contact.name')}</Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        placeholder={t('contact.namePlaceholder')}
                                        className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold opacity-70">{t('contact.email')}</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        placeholder={t('contact.emailPlaceholder')}
                                        className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="message" className="text-xs uppercase tracking-wider font-semibold opacity-70">{t('contact.message')}</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsMessageExpanded(!isMessageExpanded)}
                                        className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 min-w-[44px]"
                                    >
                                        {isMessageExpanded ? (
                                            <>
                                                <Minimize2 className="h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">{t('contact.collapse')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Maximize2 className="h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">{t('contact.expand')}</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={t('contact.messagePlaceholder')}
                                        className={`w-full bg-background/50 border-border/40 focus:border-primary/50 transition-all duration-300 resize-y ${
                                            isMessageExpanded ? 'min-h-[200px] md:min-h-[380px]' : 'min-h-[120px] md:min-h-[180px]'
                                        }`}
                                    />
                                </div>
                                <div className="text-right text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                                    {message.length} {t('contact.characters')}
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 text-sm font-bold tracking-tight rounded-xl">
                                <Send className="mr-2 h-4 w-4" />
                                {t('contact.send')}
                            </Button>

                            <p className="text-[10px] text-muted-foreground/60 text-center uppercase tracking-widest mt-4">
                                {t('contact.formNote')}
                            </p>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6 md:space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-primary/60">{t('contact.correspondence')}</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                            {t('contact.correspondenceDesc')}
                        </p>
                    </div>

                    <div className="p-5 md:p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                        <div className="flex items-center space-x-3 text-primary">
                            <Mail className="h-5 w-5" />
                            <span className="font-bold text-sm tracking-tight">{t('contact.directEmail')}</span>
                        </div>
                        <a
                            href="mailto:support@dailyreads.eu"
                            className="block text-base md:text-lg font-serif hover:text-primary transition-colors border-b border-border/50 pb-1"
                        >
                            support@dailyreads.eu
                        </a>
                        <p className="text-xs text-muted-foreground italic">
                            {t('contact.emailHint')}
                        </p>
                    </div>

                    <div className="pt-4 italic text-sm text-muted-foreground/80 leading-relaxed border-l-2 border-primary/20 pl-4">
                        {t('contact.quote')}
                        <span className="block not-italic font-bold text-[10px] uppercase mt-1 opacity-60">{t('contact.quoteAuthor')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
