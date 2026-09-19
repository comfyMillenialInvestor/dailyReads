import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IXSuggestion extends Document {
    type: 'post' | 'comment';
    slot: 'manual' | 'morning' | 'evening';
    suggestedText: string;
    finalText?: string;
    wasEdited?: boolean;
    editDelta?: string;
    rejectionReason?: string;
    targetTweet?: {
        id?: string;
        author?: string;
        text?: string;
        url?: string;
    };
    status: 'pending' | 'approved' | 'posted' | 'rejected';
    evaluation?: {
        voiceMatchScore: number;
        rationale: string;
        styleObservations: string[];
    };
    postedTweetId?: string;
    postedAt?: Date;
    voiceProfileVersion?: number;
    createdAt: Date;
    updatedAt: Date;
}

const XSuggestionSchema: Schema = new Schema(
    {
        type: { type: String, enum: ['post', 'comment'], required: true, index: true },
        slot: { type: String, enum: ['manual', 'morning', 'evening'], default: 'manual', index: true },
        suggestedText: { type: String, required: true },
        finalText: { type: String },
        wasEdited: { type: Boolean, default: false },
        editDelta: { type: String },
        rejectionReason: { type: String },
        targetTweet: {
            id: { type: String },
            author: { type: String },
            text: { type: String },
            url: { type: String },
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'posted', 'rejected'],
            default: 'pending',
            index: true,
        },
        evaluation: {
            voiceMatchScore: { type: Number, min: 1, max: 10 },
            rationale: { type: String },
            styleObservations: [{ type: String }],
        },
        postedTweetId: { type: String },
        postedAt: { type: Date },
        voiceProfileVersion: { type: Number },
    },
    { timestamps: true }
);

const XSuggestion: Model<IXSuggestion> =
    (mongoose.models && mongoose.models.XSuggestion) ||
    mongoose.model<IXSuggestion>('XSuggestion', XSuggestionSchema);

export default XSuggestion;
