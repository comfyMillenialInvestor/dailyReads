'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UserPlus, Check, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function RegisterPage() {
    const router = useRouter();
    const { t } = useLanguage();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Real-time password validation
    const passwordChecks = useMemo(() => ({
        length: password.length >= 8,
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }), [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setErrorDetails([]);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                router.push('/auth/login?registered=true');
            } else {
                const data = await res.json();
                if (data.error === 'User already exists') {
                    setError(t('register.alreadyExists'));
                } else {
                    setError(data.error || t('register.failed'));
                }
                if (data.details) {
                    setErrorDetails(data.details);
                }
            }
        } catch (err) {
            setError(t('register.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[70vh] px-4">
            <Card className="w-full max-w-md shadow-xl border-border">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-serif font-bold">{t('register.title')}</CardTitle>
                    <CardDescription>
                        {t('register.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('register.fullName')}</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder={t('register.namePlaceholder')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('register.email')}</Label>
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
                            <Label htmlFor="password">{t('register.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {/* Password requirements indicator */}
                            {password && (
                                <div className="mt-2 space-y-1 text-xs">
                                    <div className={`flex items-center gap-1 ${passwordChecks.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {passwordChecks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        {t('register.minChars')}
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {passwordChecks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        {t('register.minNumber')}
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordChecks.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {passwordChecks.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        {t('register.minSpecial')}
                                    </div>
                                </div>
                            )}
                        </div>
                        {error && (
                            <div className="text-sm text-destructive font-medium">
                                <p>{error}</p>
                                {errorDetails.length > 0 && (
                                    <ul className="mt-1 list-disc list-inside text-xs">
                                        {errorDetails.map((detail, i) => (
                                            <li key={i}>{detail}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            {loading ? t('register.creating') : t('register.createAccount')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground italic">
                    <p>
                        {t('register.quote')}
                    </p>
                    <p className="text-sm text-muted-foreground not-italic mt-2">
                        {t('register.hasAccount')}{' '}
                        <Link href="/auth/login" className="text-primary hover:underline">
                            {t('register.signIn')}
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
