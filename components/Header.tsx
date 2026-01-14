'use client';

import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';

export function Header() {
    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between mx-auto px-4">
                <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
                    Daily Reads
                </Link>
                <div className="flex items-center gap-4">
                    {/* Navigation Links could go here if needed, keeping it minimal */}
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <Link href="/ueber" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
                    </nav>
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
