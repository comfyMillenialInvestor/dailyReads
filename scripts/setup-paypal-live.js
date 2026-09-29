// Script to verify PayPal Live credentials, create the Product and Subscription Plan, and cache the IDs.
// Run with: node scripts/setup-paypal-live.js

const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            if (!process.env[key]) {
                process.env[key] = val;
            }
        }
    }
}

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = 'https://api-m.paypal.com';

async function main() {
    console.log('--- PayPal Live Setup ---');
    if (!clientId || !clientSecret) {
        console.error('ERROR: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing in .env.local');
        process.exit(1);
    }

    console.log(`Checking Client ID: ${clientId.substring(0, 8)}...`);

    // 1. Get Access Token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error(`\nFailed to authenticate with PayPal Live API (${tokenRes.status} ${tokenRes.statusText}):\n${errorText}\n`);
        console.error('Make sure you have put your LIVE Client ID and Secret in .env.local (NOT Sandbox).');
        process.exit(1);
    }

    const { access_token } = await tokenRes.json();
    console.log('✓ Successfully authenticated with PayPal Live API!');

    // Read cache
    const cachePath = path.join(__dirname, '..', 'lib', 'paypal_cache.json');
    let cache = { sandbox: {}, live: {} };
    if (fs.existsSync(cachePath)) {
        try {
            cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            if (!cache.live) cache.live = {};
        } catch (e) {}
    }

    let productId = process.env.PAYPAL_PRODUCT_ID || cache.live?.productId;
    let planId = process.env.PAYPAL_PLAN_ID || cache.live?.planId;

    // 2. Create Product if not exists
    if (!productId) {
        console.log('Creating Live Product "Daily Reads - Ritual Member"...');
        const prodRes = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({
                name: 'Daily Reads - Ritual Member',
                description: 'Enable tracking, streaks, and support the ritual.',
                type: 'SERVICE',
                category: 'SOFTWARE',
            }),
        });

        if (!prodRes.ok) {
            console.error('Failed to create product:', await prodRes.text());
            process.exit(1);
        }
        const prodData = await prodRes.json();
        productId = prodData.id;
        console.log(`✓ Live Product Created: ${productId}`);
    } else {
        console.log(`✓ Using existing Live Product ID: ${productId}`);
    }

    // 3. Create Billing Plan if not exists
    if (!planId) {
        console.log('Creating Live Billing Plan (€2.50/month)...');
        const planRes = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`,
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

        if (!planRes.ok) {
            console.error('Failed to create plan:', await planRes.text());
            process.exit(1);
        }
        const planData = await planRes.json();
        planId = planData.id;
        console.log(`✓ Live Plan Created: ${planId}`);
    } else {
        console.log(`✓ Using existing Live Plan ID: ${planId}`);
    }

    // Save to cache file
    cache.live = { productId, planId };
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
    console.log(`✓ Updated lib/paypal_cache.json with Live credentials.`);

    console.log('\n=============================================');
    console.log('Summary of Live Values for Vercel & .env:');
    console.log('=============================================');
    console.log(`PAYPAL_MODE=live`);
    console.log(`PAYPAL_CLIENT_ID=${clientId}`);
    console.log(`PAYPAL_CLIENT_SECRET=${clientSecret}`);
    console.log(`PAYPAL_PRODUCT_ID=${productId}`);
    console.log(`PAYPAL_PLAN_ID=${planId}`);
    console.log('=============================================\n');
}

main().catch(console.error);
