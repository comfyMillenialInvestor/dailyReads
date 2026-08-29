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
                from: process.env.EMAIL_FROM || '"Daily Reads Support" <support@dailyreads.eu>',
                to: email,
                subject: 'Your Password Has Been Reset - Daily Reads',
                text: `Daily Reads\n\nYour password has been reset.\n\nYour new temporary password is: ${newPassword}\n\nPlease log in to your portal and change this password immediately: https://www.dailyreads.eu/auth/login\n\nWarmly,\nThe Daily Reads Team\nsupport@dailyreads.eu`,
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Your Password</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #fbf9f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fbf9f6; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border: 1px solid #e6dec9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(67, 52, 34, 0.05);">
                                    <!-- Header Banner -->
                                    <tr>
                                        <td style="background-color: #121317; padding: 30px 40px; text-align: center;">
                                            <h1 style="margin: 0; font-family: Georgia, serif; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: -0.02em;">Daily Reads</h1>
                                        </td>
                                    </tr>
                                    <!-- Body Content -->
                                    <tr>
                                        <td style="padding: 40px 40px 30px 40px;">
                                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #2f3034;">
                                                You are receiving this email because a password reset request was made for your Daily Reads account.
                                            </p>
                                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #2f3034;">
                                                Your temporary password is:
                                            </p>
                                            <div style="background-color: #f8f6f2; border: 1px dashed #cdd4dc; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 28px;">
                                                <code style="font-family: monospace; font-size: 20px; font-weight: bold; color: #121317; letter-spacing: 0.05em;">${newPassword}</code>
                                            </div>
                                            <!-- Action Button -->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                                                <tr>
                                                    <td align="center">
                                                        <a href="https://www.dailyreads.eu/auth/login" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: bold; color: #ffffff; background-color: #121317; text-decoration: none; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; transition: background-color 0.2s;">
                                                            Log In to Your Portal
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.5; color: #ff5252; font-style: italic;">
                                                * For security reasons, please change this temporary password immediately after logging in via your Account Settings.
                                            </p>
                                        </td>
                                    </tr>
                                    <!-- Divider -->
                                    <tr>
                                        <td style="padding: 0 40px;">
                                            <div style="border-top: 1px solid #f0eae1;"></div>
                                        </td>
                                    </tr>
                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px 40px 40px 40px; text-align: center;">
                                            <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #828a95;">
                                                If you did not request a password reset, you can safely ignore this email.
                                            </p>
                                            <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #b2bbc5; text-transform: uppercase; letter-spacing: 0.05em;">
                                                © 2026 Daily Reads &bull; <a href="https://www.dailyreads.eu" target="_blank" style="color: #b2bbc5; text-decoration: underline;">www.dailyreads.eu</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                `
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
