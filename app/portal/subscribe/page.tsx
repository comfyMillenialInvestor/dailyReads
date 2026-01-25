'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubscribePage() {
    const [loading, setLoading] = useState<string | null>(null);

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

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <Link href="/portal" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Portal
            </Link>

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-serif font-bold">Choose Your Commitment</h1>
                <p className="text-muted-foreground">Support the ritual and unlock personal tracking for €2.50/month.</p>
            </div>

            <Card className="border-primary shadow-xl">
                <CardHeader className="bg-primary/5 border-b text-center py-8">
                    <CardTitle className="text-4xl font-bold">€2.50<span className="text-lg font-normal text-muted-foreground"> / month</span></CardTitle>
                    <CardDescription className="mt-2 text-primary font-medium uppercase tracking-widest text-xs">Ritual Member</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                    <ul className="space-y-4">
                        {[
                            "Daily ritual tracking",
                            "Streak counting (current & best)",
                            "30-day completion history",
                            "Support for free literature access",
                            "Cancel anytime"
                        ].map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="space-y-3 pt-6">
                        <Button
                            className="w-full h-12 text-lg rounded-full"
                            onClick={() => handleSubscribe('stripe')}
                            disabled={!!loading}
                        >
                            {loading === 'stripe' ? 'Connecting to Stripe...' : 'Pay with Stripe'}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-12 text-lg rounded-full border-2"
                            onClick={() => handleSubscribe('paypal')}
                            disabled={!!loading}
                        >
                            {loading === 'paypal' ? 'Connecting...' : 'Pay with PayPal'}
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t justify-center py-4">
                    <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">
                        Secure payment processing. No hidden fees.
                    </p>
                </CardFooter>
            </Card>

            <div className="text-center text-sm text-muted-foreground italic">
                "Rituals are the handrails of life."
            </div>
        </div>
    );
}
