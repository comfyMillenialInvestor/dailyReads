import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVote extends Document {
    contentId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    voterId: string; // Identifier: 'user_<userId>' or 'anon_<token>'
    direction: number; // 1 for upvote, -1 for downvote
    createdAt: Date;
    updatedAt: Date;
}

const VoteSchema: Schema = new Schema(
    {
        contentId: {
            type: Schema.Types.ObjectId,
            ref: 'Content',
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        voterId: {
            type: String,
            required: true,
            index: true,
        },
        direction: {
            type: Number,
            required: true,
            enum: [1, -1],
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to guarantee 1 vote per voter per content piece
VoteSchema.index({ contentId: 1, voterId: 1 }, { unique: true });

const Vote: Model<IVote> =
    (mongoose.models && mongoose.models.Vote) ||
    mongoose.model<IVote>('Vote', VoteSchema);

export default Vote;
