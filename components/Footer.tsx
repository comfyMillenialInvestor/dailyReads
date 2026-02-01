'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function Footer() {
    const { data: session } = useSession();
    const isPaid = (session?.user as any)?.isPaid || false;

    return (
        <footer className="border-t bg-muted/20 py-10 mt-20">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                    <h3 className="font-serif font-bold text-lg mb-4">Daily Reads</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">
                        Three curated short texts every day. Expand your horizon with a story, a poem, and an idea.
                    </p>
                    <div className="mt-6 pt-6 border-t border-border/40">
                        <p className="text-xs italic text-muted-foreground/70 leading-relaxed font-serif">
                            "A delightful life is a popcorn machine in your head."
                        </p>
                        <p className="text-[10px] uppercase tracking-widest mt-2 opacity-50">— Ray Bradbury</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-sm mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/impressum" className="hover:underline">Impressum</Link></li>
                        <li><Link href="/datenschutz" className="hover:underline">Datenschutz</Link></li>
                        <li><Link href="/kontakt" className="hover:underline">Kontakt</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-4">Connect</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>
                            <Link href="/portal/subscribe" className="hover:underline text-primary/80 font-medium">
                                Ritual Membership {isPaid && "✓"}
                            </Link>
                        </li>
                        <li>
                            <a href="https://x.com/dailyreads" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                Twitter / X
                            </a>
                        </li>
                        <li>
                            <a href="https://linkedin.com/company/dailyreads" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                LinkedIn
                            </a>
                        </li>
                        <li><span className="text-xs mt-2 block opacity-50">© 2026 Daily Reads</span></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
