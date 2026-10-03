import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyRitual extends Document {
    dayNumber: number;
    date: Date; // Normalized to Europe/Berlin calendar day midnight
    contentIds: mongoose.Types.ObjectId[];
    note?: string;
    mood?: string;
    publishedToX?: boolean;
    xPostText?: string;
    selectedVariant?: 'A' | 'B' | 'C' | string;
    createdAt: Date;
    updatedAt: Date;
}

const DailyRitualSchema: Schema = new Schema(
    {
        dayNumber: { type: Number, required: true, index: true },
        date: { type: Date, required: true, index: true },
        contentIds: [{ type: Schema.Types.ObjectId, ref: 'Content', required: true }],
        note: { type: String, default: '' },
        mood: { type: String, default: '' },
        publishedToX: { type: Boolean, default: false },
        xPostText: { type: String, default: '' },
        selectedVariant: { type: String, default: '' },
    },
    { timestamps: true }
);

// Prevent overwrite in Next.js development watch mode
const DailyRitual: Model<IDailyRitual> =
    (mongoose.models && mongoose.models.DailyRitual) ||
    mongoose.model<IDailyRitual>('DailyRitual', DailyRitualSchema);

export default DailyRitual;
