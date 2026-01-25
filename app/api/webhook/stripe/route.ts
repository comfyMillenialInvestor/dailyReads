import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

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

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;

    let event;

    if (!endpointSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'Webhook Secret missing' }, { status: 500 });
    }

    const stripe = getStripe();
    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        await dbConnect();

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        isPaid: true,
                        stripeCustomerId: session.customer as string
                    });
                }
                break;

            case 'customer.subscription.deleted':
            case 'customer.subscription.updated':
                const subscription = event.data.object as Stripe.Subscription;
                const status = subscription.status;

                // If subscription is no longer active
                if (status === 'canceled' || status === 'unpaid' || status === 'incomplete_expired') {
                    await User.findOneAndUpdate({ stripeCustomerId: subscription.customer as string }, {
                        isPaid: false
                    });
                } else if (status === 'active') {
                    await User.findOneAndUpdate({ stripeCustomerId: subscription.customer as string }, {
                        isPaid: true
                    });
                }
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
