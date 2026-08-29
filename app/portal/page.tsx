'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Calendar, CreditCard, ChevronRight, Loader2, Download, Trash2, AlertTriangle, Settings, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PortalPage() {
    const { data: session, status } = useSession();
    const [completions, setCompletions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [canceling, setCanceling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const isPaid = (session?.user as any)?.isPaid || false;
    const { t } = useLanguage();

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

    const handleCancelSubscription = async () => {
        setCanceling(true);
        try {
            const response = await fetch('/api/user/subscription', { method: 'DELETE' });
            if (response.ok) {
                window.location.reload();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to cancel subscription.');
            }
        } catch (error) {
            console.error('Cancel failed:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setCanceling(false);
            setShowCancelConfirm(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) return;
        
        setChangingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(false);
        
        try {
            const response = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            
            if (response.ok) {
                setPasswordSuccess(true);
                setCurrentPassword('');
                setNewPassword('');
            } else {
                const data = await response.json();
                setPasswordError(data.error || 'Failed to change password');
            }
        } catch (error) {
            setPasswordError('An error occurred. Please try again.');
        } finally {
            setChangingPassword(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex flex-col justify-center items-center py-20 min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground font-serif italic text-base md:text-lg">{t('portal.loading')}</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col justify-center items-center py-20 min-h-[60vh] text-center space-y-4 px-4">
                <h1 className="text-2xl font-serif font-bold">{t('portal.accessRestricted')}</h1>
                <p className="text-muted-foreground">{t('portal.pleaseSignIn')}</p>
                <Button asChild>
                    <Link href="/auth/login">{t('portal.signIn')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700 px-2">
            <div className="space-y-2 border-b pb-6">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">{t('portal.title')}</h1>
                <p className="text-muted-foreground">{t('portal.welcomeBack')}, {session?.user?.name || t('portal.ritualist')}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <Card className={`${isPaid ? 'bg-primary/5 border-primary/20' : 'opacity-80'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <Flame className={`h-4 w-4 ${isPaid ? 'text-orange-500' : 'text-muted-foreground'}`} />
                            {t('portal.currentStreak')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{isPaid ? (session?.user as any).currentStreak || 0 : '—'}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('portal.daysShowingUp')}</p>
                    </CardContent>
                </Card>

                <Card className={`${!isPaid && 'opacity-80'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <Calendar className={`h-4 w-4 ${isPaid ? 'text-primary' : 'text-muted-foreground'}`} />
                            {t('portal.longestStreak')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{isPaid ? (session?.user as any).longestStreak || 0 : '—'}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('portal.bestRecord')}</p>
                    </CardContent>
                </Card>

                <Card className={`${isPaid ? 'bg-primary/5 border-primary/20' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            {t('portal.subscription')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{isPaid ? t('portal.ritualMember') : t('portal.freeMember')}</div>
                        <p className="text-xs text-muted-foreground mt-1">{isPaid ? t('portal.lifetimeConsistency') : t('portal.basicAccess')}</p>
                    </CardContent>
                </Card>
            </div>

            {!isPaid ? (
                <Card className="border-primary/40 bg-primary/5 border-dashed">
                    <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-4 text-center md:text-left">
                            <h3 className="text-xl md:text-2xl font-serif font-bold">{t('portal.unlockHistory')}</h3>
                            <p className="text-muted-foreground max-w-md leading-relaxed text-sm md:text-base" dangerouslySetInnerHTML={{ __html: t('portal.unlockDesc') }} />
                            <p className="text-muted-foreground max-w-md leading-relaxed text-sm md:text-base">
                                {t('portal.unlockDesc2')}
                            </p>
                        </div>
                        <Button size="lg" className="rounded-full px-8 md:px-10 py-6 text-base md:text-lg shadow-lg hover:shadow-xl transition-all" asChild>
                            <Link href="/portal/subscribe">{t('portal.enableHistory')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif">{t('portal.historyTitle')}</CardTitle>
                        <CardDescription>{t('portal.historyDesc')}</CardDescription>
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
                                            <summary className="flex items-center justify-between p-3 md:p-4 cursor-pointer list-none outline-none">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                                    <span className="font-medium text-sm md:text-base">
                                                        {new Date(comp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary/60">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">{t('portal.viewReadings')}</span>
                                                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                                                </div>
                                            </summary>
                                            <div className="px-4 md:px-5 pb-4 md:pb-5 pt-2 border-t border-border/20 bg-background/30 space-y-3 animate-in fade-in slide-in-from-top-2">
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
                                                        <p className="text-xs text-muted-foreground opacity-60">{t('portal.noRecords')}</p>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-primary/40 font-serif italic text-right mt-2">{t('portal.showedUp')}</p>
                                            </div>
                                        </details>
                                    ))
                                ) : (
                                    <div className="text-center py-12 px-6 border border-dashed rounded-xl">
                                        <p className="text-muted-foreground italic mb-4">{t('portal.noPauses')}</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/">{t('portal.backToday')}</Link>
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
                        {t('portal.accountSettings')}
                    </CardTitle>
                    <CardDescription>{t('portal.manageAccount')}</CardDescription>
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
                            {t('portal.exportData')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            {t('portal.deleteAccount')}
                        </Button>
                    </div>

                    {isPaid && (
                        <div className="pt-4 border-t border-border/50">
                            <h4 className="text-sm font-medium mb-3">{t('portal.subscriptionLabel')}</h4>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {showCancelConfirm ? (
                                    <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5 space-y-3 w-full">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="font-medium text-destructive">{t('portal.cancelConfirm')}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('portal.cancelWarning')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowCancelConfirm(false)}
                                                disabled={canceling}
                                            >
                                                {t('portal.keepSubscription')}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleCancelSubscription}
                                                disabled={canceling}
                                            >
                                                {canceling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                {t('portal.yesCancel')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        {t('portal.cancelSubscription')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-border/50">
                        <h4 className="text-sm font-medium mb-3">{t('portal.changePassword')}</h4>
                        <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                            <div className="space-y-1">
                                <Label htmlFor="currentPassword">{t('portal.currentPassword')}</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="newPassword">{t('portal.newPassword')}</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                            {passwordSuccess && <p className="text-sm text-green-600">{t('portal.passwordChanged')}</p>}
                            <Button type="submit" disabled={changingPassword || !currentPassword || !newPassword}>
                                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {t('portal.updatePassword')}
                            </Button>
                        </form>
                    </div>

                    {/* Delete Confirmation Dialog */}
                    {showDeleteConfirm && (
                        <div className="p-4 mt-4 rounded-lg border border-destructive/50 bg-destructive/5 space-y-3">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-medium text-destructive">{t('portal.deleteConfirm')}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('portal.deleteWarning')}
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
                                    {t('portal.cancel')}
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                >
                                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {t('portal.yesDelete')}
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
                        {t('portal.returnToPause')}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
