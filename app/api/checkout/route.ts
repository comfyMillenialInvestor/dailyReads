import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';
import {
    getPayPalAccessToken,
    getOrCreatePayPalProduct,
    getOrCreatePayPalPlan,
    createPayPalSubscription
} from '@/lib/paypal';

// ──────────────────────────────────────────────────────────
// FEATURE FLAGS – flip to `true` to enable each provider
// ──────────────────────────────────────────────────────────
const STRIPE_ENABLED = false;   // change to true to enable Stripe
const PAYPAL_ENABLED = false;   // change to true to enable PayPal
// ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { provider } = await request.json();

        // ── Stripe ──────────────────────────────────────
        if (provider === 'stripe') {
            if (!STRIPE_ENABLED) {
                return NextResponse.json({ error: 'Stripe is coming soon – stay tuned!' }, { status: 503 });
            }

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-12-15.clover' });
            const checkoutSession = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                customer_email: session.user.email!,
                client_reference_id: session.user.id,
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: { name: 'Daily Reads – Ritual Member' },
                            recurring: { interval: 'month' },
                            unit_amount: 250,
                        },
                        quantity: 1,
                    },
                ],
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/subscribe`,
            });

            return NextResponse.json({ url: checkoutSession.url });
        }

        // ── PayPal ──────────────────────────────────────
        if (provider === 'paypal') {
            if (!PAYPAL_ENABLED) {
                return NextResponse.json({ error: 'PayPal is coming soon – stay tuned!' }, { status: 503 });
            }

            const token = await getPayPalAccessToken();
            const productId = await getOrCreatePayPalProduct(token);
            const planId = await getOrCreatePayPalPlan(token, productId);
            const approvalUrl = await createPayPalSubscription(
                token,
                planId,
                session.user.email!,
                session.user.id
            );

            return NextResponse.json({ url: approvalUrl });
        }

        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
