'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Header() {
    const { data: session } = useSession();
    const { lang, setLang, t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between mx-auto px-4">
                <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
                    Daily Reads
                </Link>
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
                        <Link href="/ueber" className="transition-colors hover:text-foreground/80 text-foreground/60">{t('header.about')}</Link>
                        {session ? (
                            <>
                                <Link href="/portal" className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60">
                                    <User className="h-4 w-4" />
                                    {t('header.portal')}
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut()}
                                    className="text-foreground/60 hover:text-foreground"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    {t('header.signOut')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="transition-colors hover:text-foreground/80 text-foreground/60">{t('header.login')}</Link>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/auth/register">{t('header.joinRitual')}</Link>
                                </Button>
                            </>
                        )}
                    </nav>

                    {/* Language Toggle */}
                    <button
                        onClick={() => setLang(lang === 'en' ? 'de' : 'en')}
                        className="flex items-center gap-0.5 px-2 py-1.5 rounded-full border border-border/50 bg-muted/30 text-xs font-bold uppercase tracking-wider hover:bg-muted/60 transition-colors select-none"
                        title={lang === 'en' ? 'Auf Deutsch wechseln' : 'Switch to English'}
                    >
                        <span className={lang === 'en' ? 'text-foreground' : 'text-muted-foreground/50'}>EN</span>
                        <span className="text-muted-foreground/40">|</span>
                        <span className={lang === 'de' ? 'text-foreground' : 'text-muted-foreground/50'}>DE</span>
                    </button>

                    <ModeToggle />

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-md hover:bg-muted/50 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={t('header.menu')}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background/98 backdrop-blur animate-in slide-in-from-top-2 duration-200">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-3 text-sm font-medium">
                        <Link
                            href="/ueber"
                            onClick={() => setMobileMenuOpen(false)}
                            className="py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors text-foreground/70"
                        >
                            {t('header.about')}
                        </Link>
                        {session ? (
                            <>
                                <Link
                                    href="/portal"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors text-foreground/70 flex items-center gap-2"
                                >
                                    <User className="h-4 w-4" />
                                    {t('header.portal')}
                                </Link>
                                <button
                                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                    className="py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors text-foreground/70 flex items-center gap-2 text-left"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {t('header.signOut')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors text-foreground/70"
                                >
                                    {t('header.login')}
                                </Link>
                                <Link
                                    href="/auth/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-2 px-3 rounded-lg bg-primary text-primary-foreground text-center font-semibold"
                                >
                                    {t('header.joinRitual')}
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
