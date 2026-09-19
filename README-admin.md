# Daily Reads Admin Dashboard Guide

This guide explains how to log into the Admin Dashboard and post your daily readings to X (Twitter).

---

## 1. Login Credentials

When visiting any page under `/admin/` (such as http://localhost:3000/admin/challenge), your browser will prompt you with a **Basic Authentication** dialog.

* **Username**: `admin` *(Default if `ADMIN_USER` is not set in `.env.local`)*
* **Password**: `test123` *(Defined by `ADMIN_PASSWORD` in `.env.local`)*

---

## 2. Setting Up Your Session

Make sure you are also logged into your standard user account on the website (e.g. via `/auth/login`). This ensures your current reading streak is correctly retrieved and displayed on the dashboard.

---

## 3. Daily Posting Options & Workflow

Here is how to draft and publish your post every day in the Admin Area:

### Step 1: Open the Dashboard
Navigate to `/admin/challenge` in your browser.

### Step 2: Set the Challenge Day
* The screen displays your **Current Reading Streak** from your session.
* Click **"Use Streak Day"** next to the day input field to automatically fill it with your current streak number.

### Step 3: Enter the Texts (Bradbury Method)
Fill in the Title and Author for all three required readings:
1. **Text 1 (Poem)**: Title & Author
2. **Text 2 (Essay)**: Title & Author
3. **Text 3 (Short Story)**: Title & Author

### Step 4: Choose a Post Pattern
Select one of the formatting styles to keep posts engaging:
* **Austere / Ritual**: Pure record keeping. Ends with: *"Read during the midday pause."*
* **Atmospheric / Observational**: Appends a natural, sensory remark (e.g., *"Rain on the glass; coffee growing cold."*).
* **Resonance / Margin Note**: Appends a brief, cryptic insight on how the three texts connect (e.g., *"Technology advances, but the wheelbarrow remains."*).

### Step 5: Draft the Post
1. Click **"Generate X Post"**.
2. The system uses your `DEEPSEEK_API_KEY` (configured via DeepSeek API) to draft a post.
3. Review the generated text and character count. You can edit the text area directly to make changes or shorten the copy.

### Step 6: Publish to X
Click **"Approve & Post to X"** to tweet the log using your configured API keys.

---

## 4. X Personal Voice & Suggestions (`/admin/x-suggestions`)

Navigate to `/admin/x-suggestions` (or click the **"X Voice & Suggestions"** button from the top of `/admin/challenge`) to access the continuous learning AI system:

* **Sync from X**: Reads and categorizes your published standalone posts and conversational replies.
* **Continuous Voice Profile**: DeepSeek analyzes 20+ linguistic dimensions from your actual writing (sentence length, humor, emojis, directness, "I" usage, etc.). Click **"Learned Traits"** to see what was extracted.
* **Generate Suggestions**: Click **Morning Post**, **Evening Post**, or **Instant Standalone Post** for on-demand drafts, or use the **Quick Reply Assistant** to draft conversational replies to any tweet.
* **Review & 1-Click Publish**: Review the draft, check the DeepSeek Voice Match score, edit the text if desired, and click **Approve & Post to X**. Any edits are recorded back into the training data to continuously refine your voice profile!

