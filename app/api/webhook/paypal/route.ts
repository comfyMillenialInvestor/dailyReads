import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyPayPalWebhookSignature } from '@/lib/paypal';

export async function POST(request: NextRequest) {
    const bodyText = await request.text();
    
    // Parse signature verification headers
    const headers: Record<string, string> = {
        'paypal-auth-algo': request.headers.get('paypal-auth-algo') || '',
        'paypal-cert-url': request.headers.get('paypal-cert-url') || '',
        'paypal-transmission-id': request.headers.get('paypal-transmission-id') || '',
        'paypal-transmission-sig': request.headers.get('paypal-transmission-sig') || '',
        'paypal-transmission-time': request.headers.get('paypal-transmission-time') || '',
    };

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (webhookId) {
        const isValid = await verifyPayPalWebhookSignature(headers, bodyText, webhookId);
        if (!isValid) {
            console.error('PayPal Webhook verification failed.');
            return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
        }
    } else {
        console.warn('PAYPAL_WEBHOOK_ID is not set. Skipping signature verification (development/sandbox mode).');
    }

    try {
        const event = JSON.parse(bodyText);
        await dbConnect();

        const resource = event.resource;
        const subscriptionId = resource?.id;
        const userId = resource?.custom_id;

        console.log(`PayPal Webhook Event received: ${event.event_type}`, {
            subscriptionId,
            userId,
        });

        switch (event.event_type) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED':
                if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        isPaid: true,
                        paypalSubscriptionId: subscriptionId,
                    });
                    console.log(`PayPal subscription activated for user: ${userId}`);
                }
                break;

            case 'BILLING.SUBSCRIPTION.CANCELLED':
            case 'BILLING.SUBSCRIPTION.EXPIRED':
            case 'BILLING.SUBSCRIPTION.SUSPENDED':
                if (subscriptionId) {
                    await User.findOneAndUpdate(
                        { paypalSubscriptionId: subscriptionId },
                        { isPaid: false }
                    );
                    console.log(`PayPal subscription cancelled/expired/suspended: ${subscriptionId}`);
                } else if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        isPaid: false,
                    });
                    console.log(`PayPal subscription cancelled for user: ${userId}`);
                }
                break;

            case 'PAYMENT.SALE.COMPLETED':
                // Recurring payment completed - ensure user status is paid
                const billingAgreementId = resource?.billing_agreement_id; // subscription ID is in billing_agreement_id for sales
                if (billingAgreementId) {
                    await User.findOneAndUpdate(
                        { paypalSubscriptionId: billingAgreementId },
                        { isPaid: true }
                    );
                    console.log(`PayPal recurring payment completed for subscription: ${billingAgreementId}`);
                }
                break;

            default:
                console.log(`Unhandled PayPal event type: ${event.event_type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('PayPal Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
