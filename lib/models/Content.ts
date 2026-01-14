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
    createdAt: Date;
}

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
    },
    { timestamps: true }
);

// Prevent overwrite model error in watch mode
const Content: Model<IContent> =
    mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);

export default Content;
