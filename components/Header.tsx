'use client';

import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

export function Header() {
    const { data: session } = useSession();

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between mx-auto px-4">
                <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
                    Daily Reads
                </Link>
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
                        <Link href="/ueber" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
                        {session ? (
                            <>
                                <Link href="/portal" className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60">
                                    <User className="h-4 w-4" />
                                    Portal
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut()}
                                    className="text-foreground/60 hover:text-foreground"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="transition-colors hover:text-foreground/80 text-foreground/60">Login</Link>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/auth/register">Join Ritual</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
