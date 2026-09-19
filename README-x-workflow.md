# Ray Bradbury Challenge & Personal Voice — X Posting & Continuous Learning

This document explains the X (Twitter) workflows in DailyReads:
1. **Ray Bradbury Challenge Logging**: Logging daily reading streaks and formatting posts.
2. **Personal Voice & Continuous Learning**: Reading actual published posts and replies via the official X API, synthesizing your real personal writing style with DeepSeek, and generating suggestions for posts and comments.

---

## Prerequisites & Environment Configuration

Ensure the following environment variables are set in your `.env.local` file:

```env
# DeepSeek API (for voice learning, suggestion drafting, and voice evaluation)
DEEPSEEK_API_KEY="your-deepseek-api-key"

# X (Twitter) Developer Portal API Keys (OAuth 1.0a User Context)
X_CONSUMER_KEY="your-consumer-key"
X_CONSUMER_KEY_SECRET="your-consumer-key-secret"
X_ACCESS_TOKEN="your-access-token"
X_ACCESS_TOKEN_SECRET="your-access-token-secret"
```

---

## Personal Voice & Continuous Learning System (`/admin/x-suggestions`)

### Core Philosophy: My Actual Posts Are the Source of Truth
The AI does **not** rely on a generic brand persona. Instead:
- It tracks and stores your **actual published posts and replies** directly from X.
- Standalone original posts and conversational replies are distinguished.
- DeepSeek continuously analyzes your writing across 20+ linguistic dimensions (sentence length, humor, irony, understatement, emojis, directness, formality, conversational style, how you agree/disagree, use of "I", typical reply length).
- **Your actual posts win** over any preconceived notions.

### Continuous Feedback Loop
```text
Your published X posts & replies
              ↓
  Sync & analyze with DeepSeek
              ↓
    Active Voice Profile
              ↓
 Generate suggestions (posts/replies)
              ↓
  You review & edit draft in admin
              ↓
 Approve & publish to X (Official API)
              ↓
  Saved back into training data
              ↓
   Voice profile evolves continuously
```

---

## How to Use in the Admin Panel

### URLs to Access the Admin Area
* **Production Live URL**: `https://dailyreads.eu/admin/x-suggestions` (or `https://<your-deployed-domain>/admin/x-suggestions`)
* **Ray Bradbury Challenge Logger**: `https://dailyreads.eu/admin/challenge`
* **Local Development**: `http://localhost:3000/admin/x-suggestions`

> [!NOTE]
> All `/admin/*` routes are protected by HTTP Basic Authentication:
> * **Username**: `admin` (or `ADMIN_USER` in `.env.local` / production environment variables)
> * **Password**: Defined by `ADMIN_PASSWORD` in `.env.local` / production environment variables (e.g. `test123`).

---

### Step-by-Step Workflow

1. **Open the Dashboard**: Navigate to `/admin/x-suggestions`.
2. **Sync From X**:
   - Click **"Sync from X"** to ingest your latest published tweets and replies.
3. **Inspect the Learned Voice**:
   - Inspect your active **Voice Profile version**, analyzed post counts, and streak.
   - Click **"Learned Traits"** to inspect linguistic dimensions.
4. **Discover & Comment on Others' Posts ("Find People & Posts to Comment On")**:
   - Switch between **"Home Feed"** (accounts you follow) and **"Literature & Discussions"** (discover organic book discussions).
   - **One-Click Topic Chips**: Filter instantly by *Short Stories & Reading*, *Ray Bradbury & Routine*, *Philosophy & Stoics*, *Writing & Essays*, or *Book Discussions*.
   - **Authentic X Cards**: Complete with avatar pictures, `@handles`, relative time, engagement counts (💬 replies, 🔁 retweets, ❤️ likes), and direct links.
   - **Hide Noise (✕ / Eye-off)**: Dismiss posts you don't care about to keep your feed clean.
5. **Interactive Inline Reply Workbench (No Tab Switching)**:
   - Click **"Draft Reply in My Voice"** or pick a specific **Lens Preset**:
     - `💡 Insightful Take`
     - `❓ Thoughtful Question`
     - `📚 Bradbury / Routine`
     - `🤝 Warm Nuance`
   - The interactive workbench expands **inline directly below the tweet**.
   - Edit the draft in-place with real-time character counting (`/280`) and authentic voice score verification.
   - Click **"Post to X (Official API)"** to publish your reply directly from the card!
   - You can also **Copy to Clipboard** or switch lenses on the fly.
6. **Copilot Standalone Suggestions**:
   - Access **"Copilot Drafts"** to review 2x daily standalone reading reflections.
   - Edit, approve, or reject with continuous feedback.

---

## Automated 2x Daily Suggestions (Cron Endpoint)

DailyReads includes an automated generation endpoint:
- **`GET /api/cron/x-suggestions`** (or `POST`)
  - Automatically determines whether to generate a **morning** or **evening** suggestion batch based on Berlin local time.
  - Optional query parameter: `?slot=morning` or `?slot=evening`.
  - Can be invoked by GitHub Actions, cron-job.org, or Vercel Cron twice daily (e.g. at 09:00 and 18:00).
