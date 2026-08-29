import mongoose, { Schema, Document, Model } from 'mongoose';

export type ContentType = 'short_story' | 'poem' | 'essay';

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
] as const;

export type Theme = (typeof VALID_THEMES)[number] | 'more';

export interface IContent extends Document {
    type: ContentType;
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
}

const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

const ContentSchema: Schema = new Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['short_story', 'poem', 'essay'],
        },
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
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME // Explicitly set collection name
    }
);


// Prevent overwrite model error in watch mode
const Content: Model<IContent> =
    (mongoose.models && mongoose.models[COLLECTION_NAME]) ||
    mongoose.model<IContent>(COLLECTION_NAME, ContentSchema);

export default Content;


