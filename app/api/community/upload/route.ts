import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content from '@/lib/models/Content';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Nur angemeldete Autoren können eigene Texte veröffentlichen.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            type,
            content,
            authorName,
            language = 'de',
            copyrightAgreed,
            title_de,
            content_de,
            title_en,
            content_en,
        } = body;

        // Strict copyright and terms agreement check
        if (!copyrightAgreed) {
            return NextResponse.json(
                {
                    error: 'Die Zustimmung zur Urheberrechtserklärung und den Nutzungsbedingungen ist zwingend erforderlich.',
                },
                { status: 400 }
            );
        }

        // Validate type
        const validTypes = ['short_story', 'poem', 'quote', 'idea'];
        if (!type || !validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Ungültiger Texttyp. Erlaubt sind Gedichte, Kurzgeschichten und Zitate/Gedanken.' },
                { status: 400 }
            );
        }

        const cleanTitle = (title || title_de || title_en || '').trim();
        const cleanContent = (content || content_de || content_en || '').trim();
        const cleanAuthor = (authorName || '').trim() || session.user.name || 'Community-Autor';

        const finalTitleDe = (title_de || cleanTitle).trim();
        const finalContentDe = (content_de || cleanContent).trim();
        const finalTitleEn = (title_en || cleanTitle).trim();
        const finalContentEn = (content_en || cleanContent).trim();

        if (cleanTitle.length < 2 || cleanTitle.length > 120) {
            return NextResponse.json(
                { error: 'Der Titel muss zwischen 2 und 120 Zeichen lang sein.' },
                { status: 400 }
            );
        }

        if (cleanContent.length < 10) {
            return NextResponse.json(
                { error: 'Der Textinhalt muss mindestens 10 Zeichen lang sein.' },
                { status: 400 }
            );
        }

        if (cleanContent.length > 35000) {
            return NextResponse.json(
                { error: 'Der Text ist zu lang (maximal 35.000 Zeichen).' },
                { status: 400 }
            );
        }

        const words = cleanContent.split(/\s+/).filter(Boolean).length;
        const readTimeMinutes = Math.max(1, Math.ceil(words / 180));
        const readTimeStr = `${readTimeMinutes} min`;

        await dbConnect();

        const newContent = await Content.create({
            type,
            theme: 'community',
            title: cleanTitle,
            author: cleanAuthor,
            authorName: cleanAuthor,
            content: cleanContent,
            estimatedWords: words,
            readTime: readTimeStr,
            userId: session.user.id,
            isCommunity: true,
            status: 'published',
            upvotes: 0,
            downvotes: 0,
            score: 0,
            copyrightAgreed: true,
            copyrightAgreedAt: new Date(),
            termsVersion: '1.0',
            // Distinct German and English translated contents
            title_de: finalTitleDe,
            content_de: finalContentDe,
            title_en: finalTitleEn,
            content_en: finalContentEn,
        });

        return NextResponse.json({
            success: true,
            item: newContent,
            message: 'Dein Text wurde erfolgreich in der Community-Kategorie veröffentlicht!',
        });
    } catch (error: any) {
        console.error('Error uploading community text:', error);
        return NextResponse.json(
            { error: error?.message || 'Fehler beim Veröffentlichen des Textes.' },
            { status: 500 }
        );
    }
}
