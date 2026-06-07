import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Stripe from 'stripe';
import { getPayPalAccessToken, cancelPayPalSubscription } from '@/lib/paypal';

export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const user = await User.findById(session.user.id);
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.isPaid) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
        }

        // Cancel Stripe
        if (user.stripeCustomerId) {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-12-15.clover' });
            
            // Get active subscriptions for this customer
            const subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: 'active',
            });
            
            if (subscriptions.data.length > 0) {
                for (const sub of subscriptions.data) {
                    await stripe.subscriptions.cancel(sub.id);
                }
            }
        }

        // Cancel PayPal
        if (user.paypalSubscriptionId) {
            const token = await getPayPalAccessToken();
            await cancelPayPalSubscription(token, user.paypalSubscriptionId);
        }

        user.isPaid = false;
        user.paypalSubscriptionId = undefined;
        // Keep stripeCustomerId as it represents the customer, not just the subscription
        await user.save();

        return NextResponse.json({ message: 'Subscription cancelled successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Subscription cancellation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
