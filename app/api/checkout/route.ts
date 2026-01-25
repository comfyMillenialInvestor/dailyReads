import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe() {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }
    return stripeInstance;
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { provider } = await request.json();

        if (provider === 'stripe') {
            const stripe = getStripe();
            const checkoutSession = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: 'Daily Reads - Ritual Member',
                                description: 'Enable tracking, streaks, and support the ritual.',
                            },
                            unit_amount: 250, // €2.50
                            recurring: {
                                interval: 'month',
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal?success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal?canceled=true`,
                customer_email: session.user.email!,
                metadata: {
                    userId: session.user.id,
                },
            });

            return NextResponse.json({ url: checkoutSession.url });
        }

        // PayPal logic would go here, or just a simple placeholder for now
        if (provider === 'paypal') {
            return NextResponse.json({ error: 'PayPal integration coming soon' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
