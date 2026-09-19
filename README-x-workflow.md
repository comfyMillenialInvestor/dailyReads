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

1. **Open the Dashboard**: Navigate to `/admin/x-suggestions` in your browser.
2. **Sync From X**:
   - Click the **"Sync from X"** button in the header.
   - The system retrieves your latest posts and replies, cataloging them into standalone posts and conversational replies.
3. **Inspect the Learned Voice**:
   - The dashboard displays your active **Voice Profile version**, analyzed post counts, and streak.
   - Click **"Learned Traits"** to inspect how DeepSeek characterized your sentence structure, humor, emoji habits, and authentic quotes extracted from your timeline.
   - Click **"Re-Learn Voice"** anytime you want to refresh the linguistic model.
4. **Generate Standalone Suggestions (Manual or 2x Daily)**:
   - **Morning Post**: Generates an early morning observation, reading kickoff, or reflection.
   - **Evening Post**: Generates a winding-down thought or reading streak reflection.
   - **Instant Standalone Post**: Immediate post suggestion tailored to your authentic tone.
5. **Find People & Conversations to Comment On (Growth & Feed)**:
   - Click the toggle **"Find People & Posts to Comment On"** at the top of the dashboard.
   - Switch between **"Home Feed"** (see recent tweets from accounts you follow, e.g. authors like `@AuthorGFAllen`) and **"Literature & Reading Discussions"** (discover active conversations on X about books, short stories, essays, and reading habits).
   - Click **"Draft Reply in My Voice"** on any discovered tweet.
   - Your personal copilot immediately analyzes that specific person's post and drafts a genuine, peer-to-peer reply in your learned voice.
6. **Review, Edit & Publish**:
   - Each suggestion card shows the draft, character count (max 280), and DeepSeek's **Human Copilot Match Score** (audited against generic AI social media manager tropes).
   - Edit the draft directly in the box. Notice the amber delta indicator confirming that your edits will teach the copilot your exact refinement habits.
   - Click **"Approve & Post to X (Official API)"** to publish directly as a tweet or reply.
   - Click **✕** to reject, with quick feedback tags (*"Sounds like generic AI"*, *"Too promotional"*, *"Awkward phrasing"*) that teach the model what you reject.

---

## Automated 2x Daily Suggestions (Cron Endpoint)

DailyReads includes an automated generation endpoint:
- **`GET /api/cron/x-suggestions`** (or `POST`)
  - Automatically determines whether to generate a **morning** or **evening** suggestion batch based on Berlin local time.
  - Optional query parameter: `?slot=morning` or `?slot=evening`.
  - Can be invoked by GitHub Actions, cron-job.org, or Vercel Cron twice daily (e.g. at 09:00 and 18:00).
