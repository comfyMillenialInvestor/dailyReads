import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name?: string;
    email: string;
    image?: string;
    password?: string;
    isPaid: boolean;
    stripeCustomerId?: string;
    currentStreak: number;
    longestStreak: number;
    lastCompletionDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        image: { type: String },
        password: { type: String }, // For email/password auth
        isPaid: { type: Boolean, default: false },
        stripeCustomerId: { type: String },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastCompletionDate: { type: Date },
    },
    { timestamps: true }
);

const User: Model<IUser> =
    (mongoose.models && mongoose.models.User) ||
    mongoose.model<IUser>('User', UserSchema);

export default User;
