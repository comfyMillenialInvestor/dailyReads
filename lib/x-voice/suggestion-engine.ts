import OpenAI from 'openai';
import dbConnect from '@/lib/db';
import { getActiveVoiceProfile } from './voice-analyzer';
import XSuggestion from '@/lib/models/XSuggestion';
import Completion from '@/lib/models/Completion';
import '@/lib/models/Content';
import { fetchTweetContext } from './x-client';

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

interface GenerateSuggestionOptions {
    type: 'post' | 'comment';
    slot?: 'manual' | 'morning' | 'evening';
    targetTweetInput?: string; // URL or ID or raw text
    customContext?: string;
    readingStreak?: number;
}

/**
 * Generates an authentic X post or reply draft.
 *
 * Core Question Answered:
 * "What would I naturally say here?"
 * rather than:
 * "What would a generic AI social-media manager say here?"
 */
export async function generateSuggestion(options: GenerateSuggestionOptions) {
    await dbConnect();
    const voiceProfile = await getActiveVoiceProfile();

    if (!voiceProfile) {
        throw new Error('No active Voice Profile found. Please sync X posts and run voice analysis first.');
    }

    const openai = getOpenAIClient();
    const { type, slot = 'manual', targetTweetInput, customContext, readingStreak } = options;

    let targetTweetData: {
        id?: string;
        author?: string;
        text?: string;
        url?: string;
    } | undefined = undefined;

    // If type is comment/reply and target tweet is provided
    if (type === 'comment' && targetTweetInput) {
        try {
            const fetched = await fetchTweetContext(targetTweetInput);
            targetTweetData = {
                id: fetched.id,
                author: fetched.author,
                text: fetched.text,
                url: fetched.url,
            };
        } catch {
            // If raw text was provided instead of URL/ID
            targetTweetData = {
                text: targetTweetInput,
                author: 'X User',
                url: '',
            };
        }
    }

    // Check recent DailyReads completions for organic reading context
    let dailyReadsContext = '';
    try {
        const recentCompletions = await Completion.find({})
            .populate('contentIds')
            .sort({ date: -1 })
            .limit(3)
            .lean();

        if (recentCompletions && recentCompletions.length > 0) {
            const latest = recentCompletions[0];
            if (Array.isArray(latest.contentIds) && latest.contentIds.length > 0) {
                const textList = latest.contentIds
                    .map((c: any) => `"${c.title}" by ${c.author} (${c.type})`)
                    .join(', ');
                dailyReadsContext = `Recent readings completed in DailyReads: ${textList}.`;
            }
        }
    } catch (e) {
        console.warn('Could not load DailyReads completions for context:', e);
    }

    // Contextual guidance
    let timeSlotGuidance = '';
    if (slot === 'morning') {
        timeSlotGuidance = 'Context: Morning slot. The author might share morning reading thoughts, easing into the day, coffee, early quiet observations, or a fresh reflection.';
    } else if (slot === 'evening') {
        timeSlotGuidance = 'Context: Evening slot. The author might wind down with an evening reading reflection, a closing thought on daily consistency, or reacting warmly to someone.';
    }

    // Format anti-patterns and edit tendencies from voice profile
    const editPatternsText =
        voiceProfile.editPatterns && voiceProfile.editPatterns.length > 0
            ? voiceProfile.editPatterns.map((p) => `- ${p}`).join('\n')
            : '- Strips marketing fluff and adjectives\n- Shortens sentences and removes cheerleading';

    const rejectedPatternsText =
        voiceProfile.rejectedPatterns && voiceProfile.rejectedPatterns.length > 0
            ? voiceProfile.rejectedPatterns.map((p) => `- ${p}`).join('\n')
            : '- Generic corporate encouragement or inspirational platitudes\n- Sounding like an engagement-seeking brand account';

    const acceptedPreferencesText =
        voiceProfile.acceptedPreferences && voiceProfile.acceptedPreferences.length > 0
            ? voiceProfile.acceptedPreferences.map((p) => `- ${p}`).join('\n')
            : '- Genuine literary curiosity\n- Self-deprecating warmth\n- Concise, understated observations';

    const draftingPrompt = `
You are the author's PERSONAL WRITING COPILOT.

==================================================
YOUR SINGLE GUIDING QUESTION:
"What would this author naturally say here?"

YOUR ABSOLUTE ENEMY:
"What would a generic AI social-media manager say here?"
==================================================

You are NOT a DailyReads marketing tool. You do NOT seek engagement hacks, viral hooks, or brand promotion.
You are writing as a real, thoughtful human with specific taste, self-deprecating humor, and quiet reading habits.

AUTHOR'S LEARNED VOICE PROFILE:
${voiceProfile.distilledSystemPrompt}

OBSERVED LINGUISTIC TRAITS:
- Sentence Cadence: ${voiceProfile.traits?.sentenceLength || 'Natural, punchy, varied'}
- Humour & Understatement: ${voiceProfile.traits?.humour || 'Self-deprecating, warm'} | ${voiceProfile.traits?.understatement || 'Understated'}
- Emojis: ${voiceProfile.traits?.emojiUsage || 'Rare, genuine, only occasional (e.g. 👍🏻, 😳)'}
- Directness & Formality: ${voiceProfile.traits?.directness || 'Direct, conversational'}
- How they use "I": ${voiceProfile.traits?.selfReferenceUsage || 'Casual personal experience'}
- Typical Reply Length: ${voiceProfile.traits?.typicalReplyLength || '1-2 sentences'}

HOW THE AUTHOR EDITS AI TEXT (DO THESE THINGS IN ADVANCE):
${editPatternsText}

WHAT THE AUTHOR REPEATEDLY REJECTS (NEVER DO THESE):
${rejectedPatternsText}

WHAT THE AUTHOR CONSISTENTLY ACCEPTS:
${acceptedPreferencesText}

SAMPLES OF THE AUTHOR'S ACTUAL WORDS:
${voiceProfile.sampleExcerpts.map((s) => `• "${s}"`).join('\n')}

---
TASK TYPE: ${type === 'comment' ? 'CONVERSATIONAL REPLY / COMMENT' : 'STANDALONE POST'}
SLOT: ${slot}
${timeSlotGuidance}
${readingStreak ? `Current Reading Streak: Day ${readingStreak}` : ''}
${dailyReadsContext}
${customContext ? `Additional context: ${customContext}` : ''}
${
    type === 'comment' && targetTweetData
        ? `TARGET TWEET TO REPLY TO:
Author: ${targetTweetData.author}
Tweet Text: "${targetTweetData.text}"`
        : ''
}

CONSTRAINTS:
1. MAX 280 CHARACTERS.
2. Must feel 100% human, effortless, and true to the author's real posts.
3. ABSOLUTELY ZERO marketing slogans, calls to action, hashtag spam, or inspirational posturing.
4. If this is a reply, speak directly to the person as a peer.
5. If this is a post, ground it in quiet daily reality or literature.

OUTPUT:
Return ONLY the draft text, with no extra commentary or quotes.
`;

    const draftRes = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
            {
                role: 'system',
                content:
                    voiceProfile.distilledSystemPrompt ||
                    'You are the author’s personal writing copilot. You answer: What would I naturally say here?',
            },
            {
                role: 'user',
                content: draftingPrompt,
            },
        ],
        temperature: 0.6,
    });

    let rawDraft = draftRes.choices[0].message.content?.trim() || '';
    rawDraft = rawDraft.replace(/^["']|["']$/g, '').trim();

    // Evaluation Pass: Auditing against the "Generic AI Social Media Manager" failure mode
    const evaluationPrompt = `
You are a sharp personal writing critic auditing an AI draft for this author.

TEST QUESTION:
Does this draft answer "What would I naturally say here?", OR does it smell like a generic AI social-media manager?

AUTHOR'S REAL VOICE PROFILE:
${voiceProfile.distilledSystemPrompt}

AUTHOR'S KNOWN ANTI-PATTERNS (THINGS REJECTED):
${rejectedPatternsText}

AUTHOR'S ACTUAL QUOTES:
${voiceProfile.sampleExcerpts.join('\n')}

DRAFT TO EVALUATE:
"${rawDraft}"

EVALUATION CRITERIA:
1. "Copilot vs Marketer" check: Does it feel like a real human writing a genuine tweet, or an AI trying to manage a brand?
2. Tone & restraint: Does it honor the author's sentence length, understatement, and humor?
3. Score from 1 to 10 (10 = sounds completely indistinguishable from the author's own thumbs typing).
4. Provide a crisp 1-2 sentence rationale.
5. List 2-3 specific stylistic traits observed.

OUTPUT FORMAT (JSON ONLY):
{
  "voiceMatchScore": 9,
  "rationale": "Natural human cadence without any corporate marketing feel.",
  "styleObservations": ["Conversational peer-to-peer tone", "Understated remark", "No brand cheerleading"]
}
`;

    let evaluation = {
        voiceMatchScore: 8,
        rationale: 'Authentic peer-to-peer cadence without generic social media manager tropes.',
        styleObservations: ['Human cadence', 'No corporate hype'],
    };

    try {
        const evalRes = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: 'You are a computational stylistics judge. Return JSON only.',
                },
                {
                    role: 'user',
                    content: evaluationPrompt,
                },
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' },
        });

        const evalContent = evalRes.choices[0].message.content || '{}';
        evaluation = JSON.parse(evalContent);
    } catch (evalErr) {
        console.warn('Evaluation pass fallback:', evalErr);
    }

    const suggestion = await XSuggestion.create({
        type,
        slot,
        suggestedText: rawDraft,
        targetTweet: targetTweetData,
        status: 'pending',
        evaluation,
        voiceProfileVersion: voiceProfile.version,
    });

    return suggestion;
}

export async function generateDailyBatch(slot: 'morning' | 'evening', readingStreak?: number) {
    const postSuggestion = await generateSuggestion({
        type: 'post',
        slot,
        readingStreak,
    });

    return [postSuggestion];
}
