import OpenAI from 'openai';
import dbConnect from '@/lib/db';
import XPostTracked from '@/lib/models/XPostTracked';
import XVoiceProfile from '@/lib/models/XVoiceProfile';
import XSuggestion from '@/lib/models/XSuggestion';

function getOpenAIClient() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        throw new Error('Missing DEEPSEEK_API_KEY in environment variables');
    }

    return new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.deepseek.com/v1',
    });
}

/**
 * Analyzes the user's actual published X posts, replies, edits to AI suggestions,
 * and rejection/approval patterns using DeepSeek.
 *
 * North Star:
 * Over several weeks of use, the AI should become increasingly good at answering:
 * "What would I naturally say here?"
 * rather than:
 * "What would a generic AI social-media manager say here?"
 */
export async function analyzeVoiceProfile() {
    await dbConnect();

    // 1. Fetch tracked posts & replies from X
    const posts = await XPostTracked.find({}).sort({ createdAt: -1 }).lean();

    if (!posts || posts.length === 0) {
        throw new Error('No tracked posts found to analyze. Please sync posts from X first.');
    }

    const originalPosts = posts.filter((p) => p.type === 'original');
    const replies = posts.filter((p) => p.type === 'reply');

    // 2. Fetch feedback history from XSuggestion:
    // - Edits made by user (AI suggested X, User edited to Y)
    // - Rejections (AI drafts user repeatedly rejected)
    // - Approvals (AI drafts user approved with 0/minor edits)
    const editedSuggestions = await XSuggestion.find({
        status: 'posted',
        wasEdited: true,
        finalText: { $exists: true, $ne: '' },
    })
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();

    const rejectedSuggestions = await XSuggestion.find({ status: 'rejected' })
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();

    const approvedSuggestions = await XSuggestion.find({
        status: 'posted',
        wasEdited: false,
    })
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();

    // Build samples
    const originalPostSamples = originalPosts
        .slice(0, 35)
        .map((p, i) => `[ORIGINAL #${i + 1} | ${p.createdAt.toISOString().slice(0, 10)}]\n${p.text}`)
        .join('\n\n');

    const replySamples = replies
        .slice(0, 35)
        .map((p, i) => `[REPLY #${i + 1} | ${p.createdAt.toISOString().slice(0, 10)}]\n${p.text}`)
        .join('\n\n');

    const editDeltas = editedSuggestions
        .map(
            (s, i) =>
                `[EDIT #${i + 1}]\nAI Suggested: "${s.suggestedText}"\nUser Edited To: "${s.finalText}"`
        )
        .join('\n\n');

    const rejectedDeltas = rejectedSuggestions
        .map((s, i) => `[REJECTED #${i + 1} (${s.type})]: "${s.suggestedText}"`)
        .join('\n');

    const approvedDeltas = approvedSuggestions
        .map((s, i) => `[ACCEPTED AS-IS #${i + 1} (${s.type})]: "${s.suggestedText}"`)
        .join('\n');

    const prompt = `
You are an expert computational linguist and personal writing copilot engine.
Your mission is to construct an authentic, deeply personalized writing model for a specific human on X.

=========================================
THE SUPREME OBJECTIVE:
Over time and across dozens of interactions, the AI must become extraordinarily good at answering:
"What would THIS SPECIFIC PERSON naturally say here?"
rather than:
"What would a generic AI social-media manager say here?"

The system must be a personal writing copilot, NOT a generic DailyReads marketing tool.
=========================================

CORE PRINCIPLES:
1. THE AUTHOR'S ACTUAL WRITING IS THE ULTIMATE TRUTH.
   - If a brand guideline or predefined persona says one thing, but the author's real writing shows something else, THE AUTHOR'S ACTUAL POSTS WIN.
2. DISTINGUISH ORIGINAL POSTS VS REPLIES:
   - Standalone posts show how they frame reading, daily discipline, and thoughts.
   - Replies show their natural conversational instincts (how they banter, agree/disagree, joke, and keep replies brief).
3. LEARN FROM THE INTERACTION SIGNALS:
   - Edits: Look at how the author altered AI suggestions. What did they remove? (e.g. did they strip marketing fluff, tone down excessive cheer, shorten sentences, add personal self-deprecation?)
   - Rejections: What kinds of drafts did the author flat-out reject? What made them sound like a fake social media manager?
   - Accepted drafts: What kinds of suggestions did the author approve with minimal edits?
4. STRUCTURAL PATTERNS OVER PHRASES:
   - Capture cadence, restraint, understatement, punctuation, and psychological posture rather than merely copying a few keywords.

---
DATASET 1: AUTHOR'S REAL STANDALONE POSTS (${originalPosts.length} available):
${originalPostSamples || '(None yet)'}

---
DATASET 2: AUTHOR'S REAL CONVERSATIONAL REPLIES (${replies.length} available):
${replySamples || '(None yet)'}

---
DATASET 3: HOW THE AUTHOR EDITED PAST AI SUGGESTIONS (${editedSuggestions.length} examples):
${editDeltas || '(No edits recorded yet — this will grow as the user uses the tool)'}

---
DATASET 4: SUGGESTIONS THE AUTHOR REJECTED (${rejectedSuggestions.length} examples):
${rejectedDeltas || '(No rejections recorded yet)'}

---
DATASET 5: SUGGESTIONS THE AUTHOR APPROVED WITHOUT CHANGES (${approvedSuggestions.length} examples):
${approvedDeltas || '(No direct approvals recorded yet)'}

---
ANALYZE ACROSS THESE CORE DIMENSIONS:
1. Sentence length and cadence
2. Vocabulary & word choice
3. Punctuation patterns
4. Paragraph structure & layout
5. Use of questions
6. Use of humour (e.g. self-deprecating, dry, warm)
7. Use of understatement
8. Use of irony
9. Use of emojis (exact frequency, placement, specific emojis like 👍🏻, 😳)
10. Use of abbreviations & casualisms ("Haha", "got to admit", "seldomly")
11. Directness & brevity
12. Formality level
13. Conversational style in replies vs posts
14. How they agree / disagree
15. How they introduce opinions
16. How they make observations
17. Reaction to surprising ideas
18. How they make jokes
19. How they express uncertainty & confessions
20. Self-reference & frequency of "I"
21. Typical reply length (in words/sentences)

---
OUTPUT FORMAT:
Return strictly valid JSON with no markdown code blocks:
{
  "rawAnalysis": "Detailed 2-3 paragraph breakdown of the author's authentic personal voice, contrasting it sharply with what a generic AI social-media manager would sound like.",
  "traits": {
    "sentenceLength": "description",
    "vocabulary": "description",
    "punctuation": "description",
    "paragraphStructure": "description",
    "useOfQuestions": "description",
    "humour": "description",
    "understatement": "description",
    "irony": "description",
    "emojiUsage": "description",
    "abbreviations": "description",
    "directness": "description",
    "formality": "description",
    "conversationalStyle": "description",
    "agreeDisagreeStyle": "description",
    "opinionIntroduction": "description",
    "observationStyle": "description",
    "surprisingIdeasReaction": "description",
    "jokesStyle": "description",
    "uncertaintyExpression": "description",
    "selfReferenceUsage": "description",
    "typicalReplyLength": "description",
    "keyObservationsSummary": "The singular essence of how this human talks"
  },
  "editPatterns": [
    "2 to 4 concrete patterns describing how the author edits AI drafts (e.g. 'Strips promotional adjectives', 'Replaces pompous conclusions with grounded self-deprecation', 'Shortens sentences')"
  ],
  "rejectedPatterns": [
    "2 to 4 anti-patterns explaining what the author rejects (e.g. 'Never write inspirational platitudes', 'Avoid hollow rhetorical questions', 'Do not sound like a community manager cheering people on')"
  ],
  "acceptedPreferences": [
    "2 to 3 patterns explaining what makes suggestions succeed with this author"
  ],
  "sampleExcerpts": [
    "3 to 5 quotes from the author's real tweets that best prove their voice"
  ],
  "distilledSystemPrompt": "A comprehensive 300-500 word system prompt that will be given to the suggestion generator. It MUST explicitly command the model: 'Answer the question: What would THIS human naturally say here? Do NOT sound like a social media manager or marketer. Follow these specific rules of cadence, humor, understatement, and anti-patterns.'"
}
`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
            {
                role: 'system',
                content: 'You are an expert computational linguist and writing copilot. You output strictly valid JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    let parsed: any;
    try {
        parsed = JSON.parse(content);
    } catch {
        const cleaned = content.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
        parsed = JSON.parse(cleaned);
    }

    const latestProfile = await XVoiceProfile.findOne({}).sort({ version: -1 });
    const nextVersion = latestProfile ? latestProfile.version + 1 : 1;

    await XVoiceProfile.updateMany({}, { isActive: false });

    const newProfile = await XVoiceProfile.create({
        version: nextVersion,
        isActive: true,
        rawAnalysis: parsed.rawAnalysis || 'Analysis generated from actual posts and interaction feedback.',
        traits: parsed.traits || {},
        distilledSystemPrompt: parsed.distilledSystemPrompt || '',
        postCountAnalyzed: {
            total: posts.length,
            original: originalPosts.length,
            replies: replies.length,
        },
        editPatterns: parsed.editPatterns || [],
        rejectedPatterns: parsed.rejectedPatterns || [],
        acceptedPreferences: parsed.acceptedPreferences || [],
        interactionStats: {
            totalInteractions: editedSuggestions.length + rejectedSuggestions.length + approvedSuggestions.length,
            editsCount: editedSuggestions.length,
            rejectionsCount: rejectedSuggestions.length,
            approvalsCount: approvedSuggestions.length,
        },
        sampleExcerpts: parsed.sampleExcerpts || [],
        lastAnalyzedAt: new Date(),
    });

    await XPostTracked.updateMany(
        { _id: { $in: posts.map((p) => p._id) } },
        { analyzedInProfileVersion: nextVersion }
    );

    return newProfile;
}

export async function getActiveVoiceProfile() {
    await dbConnect();
    return XVoiceProfile.findOne({ isActive: true }).sort({ version: -1 });
}
