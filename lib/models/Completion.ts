import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompletion extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date; // The calendar date of completion (normalized to midnight)
    pauseNumber?: number;
    contentIds: mongoose.Types.ObjectId[]; // The IDs of the texts completed that day
    createdAt: Date;
}

const CompletionSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
        pauseNumber: { type: Number },
        contentIds: [{ type: Schema.Types.ObjectId, ref: 'Content' }],
    },
    { timestamps: true }
);

// Ensure one completion per day per user
CompletionSchema.index({ userId: 1, date: 1 }, { unique: true });

const Completion: Model<ICompletion> =
    (mongoose.models && mongoose.models.Completion) ||
    mongoose.model<ICompletion>('Completion', CompletionSchema);

export default Completion;
