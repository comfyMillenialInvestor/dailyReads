import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { validatePassword } from '@/lib/password-validation';

export async function POST(request: NextRequest) {
    // Rate limiting: 5 registration attempts per IP per minute
    const clientIP = getClientIP(request.headers);
    const rateLimitResult = rateLimit(`register:${clientIP}`, { limit: 5, windowSeconds: 60 });

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: 'Too many registration attempts. Please try again later.',
                retryAfter: rateLimitResult.resetIn
            },
            {
                status: 429,
                headers: {
                    'Retry-After': String(rateLimitResult.resetIn),
                    'X-RateLimit-Remaining': '0',
                }
            }
        );
    }

    try {
        await dbConnect();
        const { name, email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                {
                    error: 'Password does not meet requirements',
                    details: passwordValidation.errors
                },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            isPaid: false,
            currentStreak: 0,
            longestStreak: 0,
        });

        return NextResponse.json(
            { message: 'User registered successfully' },
            {
                status: 201,
                headers: {
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                }
            }
        );
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
