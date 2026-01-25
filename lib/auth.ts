import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./mongodb"
import dbConnect from "./db"
import User from "./models/User"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                await dbConnect();
                const user = await User.findOne({ email: credentials.email });

                if (user && user.password) {
                    const isValid = await bcrypt.compare(credentials.password as string, user.password);
                    if (isValid) {
                        return {
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            image: user.image,
                        };
                    }
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;
                // For paid status, we'll fetch it from the database or trust the adapter user
                // The adapter user object is what's in the DB
                // We need to type-cast or extend the session user type
                (session.user as any).isPaid = (user as any).isPaid || false;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
    session: {
        strategy: "jwt", // Use JWT for credentials support
    },
})
