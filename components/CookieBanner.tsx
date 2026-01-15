'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-sm z-[100] animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="bg-background/80 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-2xl shadow-primary/10 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

                <div className="relative space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                            <Cookie className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold tracking-tight">Cookie Wisdom</h3>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="ml-auto p-1 hover:bg-muted rounded-full transition-colors opacity-50 hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        To provide you with the most thoughtful reading experience, we use subtle cookies to understand how you interact with our curated collection.
                    </p>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            onClick={handleAccept}
                            className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest h-10 rounded-xl"
                        >
                            Accept All
                        </Button>
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleDecline}
                                className="text-[10px] uppercase tracking-wider font-bold h-8 flex-1"
                            >
                                Necessary Only
                            </Button>
                            <Link
                                href="/datenschutz"
                                className="text-[10px] text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 font-medium"
                            >
                                Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
