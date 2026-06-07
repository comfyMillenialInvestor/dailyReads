import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

function generateRandomPassword() {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specials = '!@#$%^&*';
    
    let pwd = '';
    for (let i = 0; i < 8; i++) pwd += letters[Math.floor(Math.random() * letters.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += specials[Math.floor(Math.random() * specials.length)];
    
    return pwd;
}

export async function POST(request: NextRequest) {
    const clientIP = getClientIP(request.headers);
    const rateLimitResult = rateLimit(`reset-password:${clientIP}`, { limit: 3, windowSeconds: 60 });

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email });

        // Return same success message whether user exists or not to prevent email enumeration
        if (user) {
            const newPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            user.password = hashedPassword;
            await user.save();

            // Set up Nodemailer transport
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
                port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
                secure: process.env.EMAIL_SERVER_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_SERVER_USER || 'test',
                    pass: process.env.EMAIL_SERVER_PASSWORD || 'test',
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_FROM || '"Lennart Severin" <support@dailyreads.eu>',
                to: email,
                subject: 'Your New Password - Daily Reads',
                text: `Your password has been reset.\n\nYour new password is: ${newPassword}\n\nPlease log in and change it immediately.`,
                html: `<p>Your password has been reset.</p><p>Your new password is: <strong>${newPassword}</strong></p><p>Please log in and change it immediately in your portal settings.</p>`
            };

            try {
                if (process.env.EMAIL_SERVER_HOST) {
                    const info = await transporter.sendMail(mailOptions);
                    console.log('Password reset email sent: %s', info.messageId);
                } else {
                    console.log(`[DEV MODE] Password reset email not sent because SMTP is not configured. Email: ${email}, New Password: ${newPassword}`);
                }
            } catch (emailError) {
                console.error('Failed to send reset email:', emailError);
                console.log(`[DEV MODE] Fallback generated password for ${email}: ${newPassword}`);
            }
        }

        return NextResponse.json(
            { message: 'If an account exists, a new password has been sent.' },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
