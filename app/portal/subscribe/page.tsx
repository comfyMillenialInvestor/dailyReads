'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ──────────────────────────────────────────────────────────
// FEATURE FLAGS – flip to `true` to enable each provider button
// ──────────────────────────────────────────────────────────
const STRIPE_ENABLED = false;   // change to true to enable Stripe
const PAYPAL_ENABLED = false;   // change to true to enable PayPal
// ──────────────────────────────────────────────────────────

export default function SubscribePage() {
    const [loading, setLoading] = useState<string | null>(null);
    const { t } = useLanguage();

    const handleSubscribe = async (provider: 'stripe' | 'paypal') => {
        setLoading(provider);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Something went wrong');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to initiate checkout');
        } finally {
            setLoading(null);
        }
    };

    const features = [
        t('subscribe.feature1'),
        t('subscribe.feature2'),
        t('subscribe.feature3'),
        t('subscribe.feature4'),
        t('subscribe.feature5'),
        t('subscribe.feature6'),
    ];

    return (
        <div className="max-w-2xl mx-auto py-8 md:py-10 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500 px-2">
            <Link href="/portal" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {t('subscribe.backToPortal')}
            </Link>

            <div className="text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-serif font-bold">{t('subscribe.title')}</h1>
                <p className="text-muted-foreground italic text-sm md:text-base">{t('subscribe.subtitle')}</p>
            </div>

            <Card className="border-primary shadow-xl">
                <CardHeader className="bg-primary/5 border-b text-center py-6 md:py-8">
                    <CardTitle className="text-3xl md:text-4xl font-bold">€2.50<span className="text-base md:text-lg font-normal text-muted-foreground"> {t('subscribe.perMonth')}</span></CardTitle>
                    <CardDescription className="mt-2 text-primary font-medium uppercase tracking-widest text-xs">{t('subscribe.ritualMember')}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 md:pt-8 space-y-6">
                    <ul className="space-y-3 md:space-y-4">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm md:text-base">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="space-y-3 pt-6">
                        {/* ── Stripe Button ── */}
                        <Button
                            className="w-full h-12 text-base md:text-lg rounded-full"
                            onClick={() => handleSubscribe('stripe')}
                            disabled={!STRIPE_ENABLED || !!loading}
                            variant={STRIPE_ENABLED ? 'default' : 'outline'}
                        >
                            {!STRIPE_ENABLED
                                ? t('subscribe.stripeComingSoon')
                                : loading === 'stripe'
                                    ? t('subscribe.stripeConnecting')
                                    : t('subscribe.stripePay')}
                        </Button>

                        {/* ── PayPal Button ── */}
                        <Button
                            className="w-full h-12 text-base md:text-lg rounded-full"
                            onClick={() => handleSubscribe('paypal')}
                            disabled={!PAYPAL_ENABLED || !!loading}
                            variant={PAYPAL_ENABLED ? 'default' : 'outline'}
                        >
                            {!PAYPAL_ENABLED
                                ? t('subscribe.paypalComingSoon')
                                : loading === 'paypal'
                                    ? t('subscribe.paypalConnecting')
                                    : t('subscribe.paypalPay')}
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t justify-center py-4">
                    <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">
                        {t('subscribe.securePayment')}
                    </p>
                </CardFooter>
            </Card>

            <div className="text-center text-sm text-muted-foreground italic">
                {t('subscribe.quote')}
            </div>
        </div>
    );
}
