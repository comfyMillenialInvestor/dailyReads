'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

import { Suspense } from 'react';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const { t } = useLanguage();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Reset password state
    const [showResetForm, setShowResetForm] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetting, setResetting] = useState(false);
    const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setError(t('login.invalidCredentials'));
            } else {
                router.push(callbackUrl);
            }
        } catch (err) {
            setError(t('login.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl });
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetting(true);
        setResetMessage(null);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                setResetMessage({ type: 'success', text: t('login.resetSuccess') });
            } else {
                setResetMessage({ type: 'error', text: data.error || t('login.resetError') });
            }
        } catch (err) {
            setResetMessage({ type: 'error', text: t('login.resetGenericError') });
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[70vh] px-4">
            <Card className="w-full max-w-md shadow-xl border-border">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-serif font-bold">{t('login.title')}</CardTitle>
                    <CardDescription>
                        {t('login.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleLogin}
                        >
                            <LogIn className="mr-2 h-4 w-4" />
                            {t('login.google')}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">{t('login.orEmail')}</span>
                        </div>
                    </div>

                    {showResetForm ? (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">{t('login.email')}</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                />
                            </div>
                            {resetMessage && (
                                <p className={`text-sm font-medium ${resetMessage.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                                    {resetMessage.text}
                                </p>
                            )}
                            <Button type="submit" className="w-full" disabled={resetting || !resetEmail}>
                                {resetting ? t('login.resetSending') : t('login.resetSendPassword')}
                            </Button>
                            <Button type="button" variant="ghost" className="w-full" onClick={() => setShowResetForm(false)}>
                                {t('login.backToLogin')}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('login.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">{t('login.password')}</Label>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowResetForm(true)}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        {t('login.forgotPassword')}
                                    </button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? t('login.loggingIn') : t('login.signIn')}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <p className="text-sm text-muted-foreground">
                        {t('login.noAccount')}{' '}
                        <Link href="/auth/register" className="text-primary hover:underline">
                            {t('login.joinRitual')}
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-[70vh]">
                <Card className="w-full max-w-md shadow-xl border-border animate-pulse">
                    <div className="h-[400px]" />
                </Card>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
