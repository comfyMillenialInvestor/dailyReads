import mongoose, { Schema, Document, Model } from 'mongoose';

export type ContentType = 'short_story' | 'poem' | 'idea' | 'essay' | 'quote';

export const VALID_THEMES = [
    'philosophy',
    'science',
    'history',
    'personal growth',
    'technology',
    'environment',
    'literature',
    'mystery',
    'fantasy',
    'art',
    'politics',
    'economy',
    'community',
] as const;

export type Theme = (typeof VALID_THEMES)[number] | 'more';

export interface IContent extends Document {
    type: ContentType;
    subType?: 'quote' | 'micro_essay' | string;
    originalType?: string;
    theme: Theme;
    title: string;
    author: string;
    source?: string;
    content: string;
    estimatedWords?: number;
    readTime?: string;
    date?: Date; // For manually scheduled daily reads if needed
    pauseNumber?: number;
    scheduledDate?: Date;
    createdAt: Date;
    title_de?: string;
    content_de?: string;
    summary_de?: string;
    title_en?: string;
    content_en?: string;
    summary_en?: string;
    // Community & Author features
    userId?: mongoose.Types.ObjectId;
    authorName?: string;
    isCommunity?: boolean;
    upvotes?: number;
    downvotes?: number;
    score?: number;
    status?: 'published' | 'draft' | 'archived';
    copyrightAgreed?: boolean;
    copyrightAgreedAt?: Date;
    termsVersion?: string;
}

const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

const ContentSchema: Schema = new Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['short_story', 'poem', 'idea', 'essay', 'quote'],
        },
        subType: { type: String },
        originalType: { type: String },
        theme: {
            type: String,
            required: true,
            enum: [...VALID_THEMES, 'more'],
        },
        title: { type: String, required: true },
        author: { type: String, required: true },
        source: { type: String },
        content: { type: String, required: true },
        estimatedWords: { type: Number },
        readTime: { type: String },
        date: { type: Date },
        pauseNumber: { type: Number },
        scheduledDate: { type: Date },
        title_de: { type: String },
        content_de: { type: String },
        summary_de: { type: String },
        title_en: { type: String },
        content_en: { type: String },
        summary_en: { type: String },
        // Community & Author features
        userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
        authorName: { type: String },
        isCommunity: { type: Boolean, default: false, index: true },
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        score: { type: Number, default: 0, index: true },
        status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published' },
        copyrightAgreed: { type: Boolean, default: false },
        copyrightAgreedAt: { type: Date },
        termsVersion: { type: String, default: '1.0' },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME // Explicitly set collection name
    }
);

ContentSchema.index({ theme: 1, score: -1 });
ContentSchema.index({ isCommunity: 1, score: -1 });


// Prevent overwrite model error in watch mode
const Content: Model<IContent> =
    (mongoose.models && mongoose.models[COLLECTION_NAME]) ||
    mongoose.model<IContent>(COLLECTION_NAME, ContentSchema);

export default Content;


