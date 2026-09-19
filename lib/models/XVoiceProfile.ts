import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVoiceTraits {
    sentenceLength?: string;
    vocabulary?: string;
    punctuation?: string;
    paragraphStructure?: string;
    useOfQuestions?: string;
    humour?: string;
    understatement?: string;
    irony?: string;
    emojiUsage?: string;
    abbreviations?: string;
    directness?: string;
    formality?: string;
    conversationalStyle?: string;
    agreeDisagreeStyle?: string;
    opinionIntroduction?: string;
    observationStyle?: string;
    surprisingIdeasReaction?: string;
    jokesStyle?: string;
    uncertaintyExpression?: string;
    selfReferenceUsage?: string; // frequency of "I" and self-mentions
    typicalReplyLength?: string;
    keyObservationsSummary?: string;
}

export interface IXVoiceProfile extends Document {
    version: number;
    isActive: boolean;
    rawAnalysis: string;
    traits: IVoiceTraits;
    distilledSystemPrompt: string;
    postCountAnalyzed: {
        total: number;
        original: number;
        replies: number;
    };
    editPatterns: string[];
    rejectedPatterns: string[];
    acceptedPreferences: string[];
    interactionStats: {
        totalInteractions: number;
        editsCount: number;
        rejectionsCount: number;
        approvalsCount: number;
    };
    sampleExcerpts: string[];
    lastAnalyzedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const XVoiceProfileSchema: Schema = new Schema(
    {
        version: { type: Number, required: true, default: 1 },
        isActive: { type: Boolean, default: true, index: true },
        rawAnalysis: { type: String, required: true },
        traits: {
            sentenceLength: { type: String },
            vocabulary: { type: String },
            punctuation: { type: String },
            paragraphStructure: { type: String },
            useOfQuestions: { type: String },
            humour: { type: String },
            understatement: { type: String },
            irony: { type: String },
            emojiUsage: { type: String },
            abbreviations: { type: String },
            directness: { type: String },
            formality: { type: String },
            conversationalStyle: { type: String },
            agreeDisagreeStyle: { type: String },
            opinionIntroduction: { type: String },
            observationStyle: { type: String },
            surprisingIdeasReaction: { type: String },
            jokesStyle: { type: String },
            uncertaintyExpression: { type: String },
            selfReferenceUsage: { type: String },
            typicalReplyLength: { type: String },
            keyObservationsSummary: { type: String },
        },
        distilledSystemPrompt: { type: String, required: true },
        postCountAnalyzed: {
            total: { type: Number, default: 0 },
            original: { type: Number, default: 0 },
            replies: { type: Number, default: 0 },
        },
        editPatterns: [{ type: String }],
        rejectedPatterns: [{ type: String }],
        acceptedPreferences: [{ type: String }],
        interactionStats: {
            totalInteractions: { type: Number, default: 0 },
            editsCount: { type: Number, default: 0 },
            rejectionsCount: { type: Number, default: 0 },
            approvalsCount: { type: Number, default: 0 },
        },
        sampleExcerpts: [{ type: String }],
        lastAnalyzedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const XVoiceProfile: Model<IXVoiceProfile> =
    (mongoose.models && mongoose.models.XVoiceProfile) ||
    mongoose.model<IXVoiceProfile>('XVoiceProfile', XVoiceProfileSchema);

export default XVoiceProfile;
