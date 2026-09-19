import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getActiveVoiceProfile, analyzeVoiceProfile } from '@/lib/x-voice/voice-analyzer';

export async function GET() {
    try {
        await dbConnect();
        const profile = await getActiveVoiceProfile();
        return NextResponse.json({
            success: true,
            profile,
        });
    } catch (error: any) {
        console.error('Error in GET /api/admin/x-voice/profile:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch voice profile' }, { status: 500 });
    }
}

export async function POST() {
    try {
        const newProfile = await analyzeVoiceProfile();
        return NextResponse.json({
            success: true,
            profile: newProfile,
        });
    } catch (error: any) {
        console.error('Error in POST /api/admin/x-voice/profile:', error);
        return NextResponse.json({ error: error?.message || 'Failed to analyze voice profile' }, { status: 500 });
    }
}
