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
        async jwt({ token, user }) {
            console.debug('JWT Callback:', { hasUser: !!user, tokenEmail: token.email, tokenId: token.id });
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.currentStreak = (user as any).currentStreak || 0;
                token.longestStreak = (user as any).longestStreak || 0;
            }

            // Aggressive override for testing mode: ensure isPaid and ID are ALWAYS present
            if (token.email === 'test@test.com') {
                token.isPaid = true;
                // Always fetch latest streak for the test user to avoid stale session data
                await dbConnect();
                const dbUser = await User.findOne({ email: 'test@test.com' });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.currentStreak = dbUser.currentStreak || 0;
                    token.longestStreak = dbUser.longestStreak || 0;
                    console.debug('Found latest data for test user:', { id: token.id, streak: token.currentStreak });
                } else {
                    console.warn('Test user test@test.com not found in database!');
                }
                console.debug('Forcing isPaid:true for test@test.com');
            } else if (user) {
                token.isPaid = (user as any).isPaid || false;
            }

            return token;
        },
        async session({ session, token }) {
            console.debug('Session Callback:', { hasToken: !!token, tokenEmail: token?.email });
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                (session.user as any).isPaid = token.isPaid || false;
                (session.user as any).currentStreak = token.currentStreak || 0;
                (session.user as any).longestStreak = token.longestStreak || 0;
            }
            console.debug('Final Session User:', session.user);
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
