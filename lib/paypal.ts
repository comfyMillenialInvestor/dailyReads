import fs from 'fs';
import path from 'path';

const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
const CACHE_FILE = path.join(process.cwd(), 'lib', 'paypal_cache.json');

interface PayPalCache {
    productId?: string;
    planId?: string;
}

function readCache(): PayPalCache {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading PayPal cache file:', error);
    }
    return {};
}

function writeCache(data: PayPalCache) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing PayPal cache file:', error);
    }
}

export async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('PayPal client credentials are not configured in environment variables.');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get PayPal access token: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function getOrCreatePayPalProduct(accessToken: string): Promise<string> {
    const cache = readCache();
    if (cache.productId) {
        return cache.productId;
    }

    // Create a new product
    const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            name: 'Daily Reads - Ritual Member',
            description: 'Enable tracking, streaks, and support the ritual.',
            type: 'SERVICE',
            category: 'SOFTWARE',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create PayPal product: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const productId = data.id;

    cache.productId = productId;
    writeCache(cache);

    return productId;
}

export async function getOrCreatePayPalPlan(accessToken: string, productId: string): Promise<string> {
    const cache = readCache();
    if (cache.planId) {
        return cache.planId;
    }

    // Create a new billing plan
    const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            Prefer: 'return=representation',
        },
        body: JSON.stringify({
            product_id: productId,
            name: 'Daily Reads Ritual Member Plan',
            description: 'Daily Reads - Ritual Member subscription plan',
            status: 'ACTIVE',
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: 'MONTH',
                        interval_count: 1,
                    },
                    tenure_type: 'REGULAR',
                    sequence: 1,
                    total_cycles: 0,
                    pricing_scheme: {
                        fixed_price: {
                            value: '2.50',
                            currency_code: 'EUR',
                        },
                    },
                },
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: {
                    value: '0',
                    currency_code: 'EUR',
                },
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create PayPal billing plan: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const planId = data.id;

    cache.planId = planId;
    writeCache(cache);

    return planId;
}

export async function createPayPalSubscription(
    accessToken: string,
    planId: string,
    email: string,
    userId: string
): Promise<string> {
    const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            Prefer: 'return=representation',
        },
        body: JSON.stringify({
            plan_id: planId,
            subscriber: {
                email_address: email,
            },
            application_context: {
                brand_name: 'Daily Reads',
                locale: 'en-US',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'SUBSCRIBE_NOW',
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal?success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal?canceled=true`,
            },
            custom_id: userId,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create PayPal subscription: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const approveLink = data.links.find((link: any) => link.rel === 'approve');

    if (!approveLink) {
        throw new Error('No approval link found in PayPal subscription response');
    }

    return approveLink.href;
}

export async function verifyPayPalWebhookSignature(
    headers: Record<string, string>,
    rawBody: string,
    webhookId: string
): Promise<boolean> {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: webhookId,
            webhook_event: JSON.parse(rawBody),
        }),
    });

    if (!response.ok) {
        console.error('PayPal webhook signature verification request failed:', await response.text());
        return false;
    }

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
}
