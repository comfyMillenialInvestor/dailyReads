'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Calendar, CreditCard, ChevronRight, Loader2, Download, Trash2, AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';

export default function PortalPage() {
    const { data: session, status } = useSession();
    const [completions, setCompletions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [exporting, setExporting] = useState(false);

    const isPaid = (session?.user as any)?.isPaid || false;

    useEffect(() => {
        if (status === 'authenticated' && isPaid) {
            fetch('/api/completions')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setCompletions(data);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else if (status === 'authenticated') {
            setLoading(false);
        }
    }, [status, isPaid]);

    const handleExportData = async () => {
        setExporting(true);
        try {
            const response = await fetch('/api/user/export');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `daily-reads-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const response = await fetch('/api/user/delete', { method: 'DELETE' });
            if (response.ok) {
                await signOut({ callbackUrl: '/' });
            } else {
                alert('Failed to delete account. Please try again.');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex flex-col justify-center items-center py-20 min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground font-serif italic text-lg">Entering your ritual space...</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col justify-center items-center py-20 min-h-[60vh] text-center space-y-4">
                <h1 className="text-2xl font-serif font-bold">Access Restricted</h1>
                <p className="text-muted-foreground">Please sign in to view your portal and track your ritual.</p>
                <Button asChild>
                    <Link href="/auth/login">Sign In</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="space-y-2 border-b pb-6">
                <h1 className="text-3xl font-serif font-bold tracking-tight">Your Ritual Space</h1>
                <p className="text-muted-foreground">Welcome back, {session?.user?.name || session?.user?.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`${isPaid ? 'bg-primary/5 border-primary/20' : 'opacity-80'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <Flame className={`h-4 w-4 ${isPaid ? 'text-orange-500' : 'text-muted-foreground'}`} />
                            Current Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{isPaid ? (session?.user as any).currentStreak || 0 : '—'}</div>
                        <p className="text-xs text-muted-foreground mt-1">days of showing up</p>
                    </CardContent>
                </Card>

                <Card className={`${!isPaid && 'opacity-80'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <Calendar className={`h-4 w-4 ${isPaid ? 'text-primary' : 'text-muted-foreground'}`} />
                            Longest Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{isPaid ? (session?.user as any).longestStreak || 0 : '—'}</div>
                        <p className="text-xs text-muted-foreground mt-1">your best record</p>
                    </CardContent>
                </Card>

                <Card className={`${isPaid ? 'bg-primary/5 border-primary/20' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            Subscription
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{isPaid ? 'Ritual Member' : 'Free Member'}</div>
                        <p className="text-xs text-muted-foreground mt-1">{isPaid ? 'Lifetime of consistency' : 'Basic access only'}</p>
                    </CardContent>
                </Card>
            </div>

            {!isPaid ? (
                <Card className="border-primary/40 bg-primary/5 border-dashed">
                    <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-4 text-center md:text-left">
                            <h3 className="text-2xl font-serif font-bold">Unlock Your Ritual History</h3>
                            <p className="text-muted-foreground max-w-md leading-relaxed">
                                Join our community to unlock personal tracking, maintain your reading streak, and <span className="font-semibold text-foreground">access your full history of completed readings</span>.
                                <br /><br />
                                Your journey of consistency starts here, with a dedicated dashboard to reflect on your daily moments of presence.
                            </p>
                        </div>
                        <Button size="lg" className="rounded-full px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all" asChild>
                            <Link href="/portal/subscribe">Enable History & Tracking</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif">History of Presence</CardTitle>
                        <CardDescription>Your last 30 ritual completions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {completions.length > 0 ? (
                                    completions.map((comp, idx) => (
                                        <details key={idx} className="group overflow-hidden rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300">
                                            <summary className="flex items-center justify-between p-4 cursor-pointer list-none outline-none">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                                    <span className="font-medium">
                                                        {new Date(comp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary/60">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Readings</span>
                                                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                                                </div>
                                            </summary>
                                            <div className="px-5 pb-5 pt-2 border-t border-border/20 bg-background/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="grid grid-cols-1 gap-2">
                                                    {comp.contentIds && comp.contentIds.length > 0 ? (
                                                        comp.contentIds.map((item: any, i: number) => (
                                                            <div key={i} className="flex flex-col py-2 border-b border-border/10 last:border-0">
                                                                <span className="text-xs font-bold text-primary/70 uppercase tracking-tighter mb-0.5">{item.type?.replace('_', ' ')}</span>
                                                                <span className="font-serif italic text-foreground">{item.title}</span>
                                                                <span className="text-[10px] text-muted-foreground opacity-70">by {item.author}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground opacity-60">No specific records for this day.</p>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-primary/40 font-serif italic text-right mt-2">"I showed up today."</p>
                                            </div>
                                        </details>
                                    ))
                                ) : (
                                    <div className="text-center py-12 px-6 border border-dashed rounded-xl">
                                        <p className="text-muted-foreground italic mb-4">You haven't marked any pauses yet today.</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/">Back to Today's Pause</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Account Settings Section */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Account Settings
                    </CardTitle>
                    <CardDescription>Manage your data and account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={handleExportData}
                            disabled={exporting}
                            className="flex items-center gap-2"
                        >
                            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Export My Data
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                        </Button>
                    </div>

                    {/* Delete Confirmation Dialog */}
                    {showDeleteConfirm && (
                        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5 space-y-3">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-medium text-destructive">Permanently delete your account?</p>
                                    <p className="text-sm text-muted-foreground">
                                        This will delete your account and all associated data, including your completion history and streaks. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                >
                                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Yes, Delete My Account
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col items-center gap-4 pt-8 pb-12">
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                    <Link href="/" className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Return to the Today's Pause
                    </Link>
                </Button>
            </div>
        </div>
    );
}
