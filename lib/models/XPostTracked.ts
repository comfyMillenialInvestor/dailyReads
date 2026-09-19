import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IXPostTracked extends Document {
    tweetId: string;
    text: string;
    type: 'original' | 'reply';
    inReplyToUserId?: string;
    inReplyToTweetId?: string;
    conversationId?: string;
    source: 'synced_from_x' | 'published_via_dailyreads';
    userEdited?: boolean;
    createdAt: Date;
    analyzedInProfileVersion?: number;
    updatedAt: Date;
}

const XPostTrackedSchema: Schema = new Schema(
    {
        tweetId: { type: String, required: true, unique: true, index: true },
        text: { type: String, required: true },
        type: { type: String, enum: ['original', 'reply'], required: true, index: true },
        inReplyToUserId: { type: String },
        inReplyToTweetId: { type: String },
        conversationId: { type: String },
        source: { type: String, enum: ['synced_from_x', 'published_via_dailyreads'], default: 'synced_from_x' },
        userEdited: { type: Boolean, default: false },
        createdAt: { type: Date, required: true, index: true },
        analyzedInProfileVersion: { type: Number },
    },
    { timestamps: true }
);

const XPostTracked: Model<IXPostTracked> =
    (mongoose.models && mongoose.models.XPostTracked) ||
    mongoose.model<IXPostTracked>('XPostTracked', XPostTrackedSchema);

export default XPostTracked;
