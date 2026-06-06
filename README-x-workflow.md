# Ray Bradbury Challenge — X Posting Workflow

This document explains the workflow for logging daily readings and posting them to X (Twitter) via the Admin Dashboard.

## Prerequisites & Environment Configuration

To use the workflow, ensure the following environment variables are set in your `.env.local` file:

```env
# DeepSeek API (for drafting posts)
DEEPSEEK_API_KEY="your-deepseek-api-key"

# X (Twitter) Developer Portal API Keys
X_API_KEY="your-api-key"
X_API_SECRET="your-api-secret"
X_ACCESS_TOKEN="your-access-token"
X_ACCESS_SECRET="your-access-secret"
```

## Step-by-Step Workflow

1. **Access the Admin Dashboard**:
   - Go to `/admin/challenge` in your browser. (Ensure you are logged in so your current reading streak is accessible).

2. **Select the Challenge Day**:
   - The dashboard displays your **Current Reading Streak**.
   - You can click the **"Use Streak Day"** helper next to the day input field to automatically fill the input with your current streak number.

3. **Enter Your Reading List**:
   - Input the **Title** and **Author** for the three texts required by the Bradbury Method:
     - Title 1 & Author 1 (Poem)
     - Title 2 & Author 2 (Essay)
     - Title 3 & Author 3 (Short Story)

4. **Choose a Post Pattern**:
   - To keep posts short, natural, and non-AI-like, select one of the three patterns:
     - **Austere / Ritual**: Pure record keeping. Ends with *"Read during the midday pause."*
     - **Atmospheric / Observational**: Ends with a brief sensory/physical observation (e.g., *"Rain on the glass; coffee growing cold."*).
     - **Resonance / Margin Note**: Ends with a short, cryptic connection or note on the relationship between the pieces (e.g., *"Technology advances, but the wheelbarrow remains."*).

5. **Generate & Review**:
   - Click **"Generate X Post"**.
   - A draft will appear in the text area below. Review the text and character count (limit is 280). You can edit the text directly in the box to adjust any phrasing or fix any details.

6. **Post to X**:
   - Once satisfied, click **"Approve & Post to X"**.
   - A success message will confirm when the tweet has been successfully published.
