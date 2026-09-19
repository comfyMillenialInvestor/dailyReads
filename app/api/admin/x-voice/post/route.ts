import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import XSuggestion from '@/lib/models/XSuggestion';
import XPostTracked from '@/lib/models/XPostTracked';
import { publishToX } from '@/lib/x-voice/x-client';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { suggestionId, text, inReplyToTweetId, recordOnly = false } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
        }

        let tweetId = `web_${Date.now()}`;

        if (!recordOnly) {
            // 1. Publish to X via official API
            try {
                const published = await publishToX({
                    text,
                    inReplyToTweetId,
                });
                tweetId = published.id;
            } catch (apiError: any) {
                const detail = apiError?.data?.detail || apiError?.message || 'Failed to publish to X';
                console.error('Twitter API publishing error:', detail);
                
                const isTierRestriction = 
                    detail.includes('only reply to or quote posts where you are mentioned') ||
                    apiError?.status === 403 ||
                    apiError?.code === 403;

                return NextResponse.json({
                    error: isTierRestriction
                        ? 'X API Free Tier restricts automated bot replies to posts where you are mentioned. Use the "Reply on X ↗" button below to post with your text pre-filled in 1 click!'
                        : detail,
                    isTierRestriction,
                    canUseWebIntent: true,
                }, { status: 403 });
            }
        }

        // 2. Update the suggestion record if suggestionId was provided
        let wasEdited = false;
        let suggestionType: 'original' | 'reply' = inReplyToTweetId ? 'reply' : 'original';

        if (suggestionId) {
            const suggestion = await XSuggestion.findById(suggestionId);
            if (suggestion) {
                wasEdited = suggestion.suggestedText.trim() !== text.trim();
                suggestion.status = 'posted';
                suggestion.finalText = text;
                suggestion.wasEdited = wasEdited;
                if (wasEdited) {
                    suggestion.editDelta = `Suggested: "${suggestion.suggestedText}" -> Final: "${text}"`;
                }
                suggestion.postedTweetId = tweetId;
                suggestion.postedAt = new Date();
                await suggestion.save();
                suggestionType = suggestion.type === 'comment' ? 'reply' : 'original';
            }
        }

        // 3. Feed the final published text directly into XPostTracked
        // so it immediately becomes part of the training data for the continuous voice profile!
        await XPostTracked.findOneAndUpdate(
            { tweetId },
            {
                $set: {
                    tweetId,
                    text,
                    type: suggestionType,
                    inReplyToTweetId,
                    source: 'published_via_dailyreads',
                    userEdited: wasEdited,
                    createdAt: new Date(),
                },
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            tweetId,
            text,
            feedbackRecorded: true,
        });
    } catch (error: any) {
        console.error('Error in POST /api/admin/x-voice/post:', error);
        return NextResponse.json({ error: error?.message || 'Failed to publish post to X' }, { status: 500 });
    }
}
