---
description: How to test Stripe webhooks locally
---

To test Stripe webhooks on your local machine, follow these steps:

### 1. Install Stripe CLI
If you don't have it yet, you can install it via:
- **Scoop:** `scoop install stripe`
- **Chocolatey:** `choco install stripe-cli`
- **Direct Download:** [Download from GitHub](https://github.com/stripe/stripe-cli/releases/latest)

Verify installation:
```powershell
stripe --version
```

### 2. Login to Stripe
Run the login command and follow the instructions in your browser:
```powershell
stripe login
```

### 3. Start Local Webhook Listener
Keep this terminal window open. It will forward Stripe events to your local server:
```powershell
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

### 4. Update Your Environment Variables
After running the `listen` command, look for the **Webhook Signing Secret** (starts with `whsec_`) printed in the terminal.

Copy it and update your `c:\Development\daily-reads\.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Trigger a Test Event
You can trigger a test event from a **separate terminal**:
```powershell
stripe trigger checkout.session.completed
```

Or simply go through the checkout flow on `localhost:3000` while the listener is running.

### 6. Verify in Logs
You should see `POST /api/webhook/stripe 200 OK` in your server console and the event details in the Stripe listener terminal.
