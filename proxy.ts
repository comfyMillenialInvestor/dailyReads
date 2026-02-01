import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes
    if (pathname.startsWith('/admin')) {
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return new NextResponse('Authentication required', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="Admin Area"',
                },
            });
        }

        const auth = authHeader.split(' ')[1];
        const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

        const adminUser = process.env.ADMIN_USER || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'password123'; // Default for safety, user should update .env.local

        if (user !== adminUser || pwd !== adminPass) {
            return new NextResponse('Authentication required', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="Admin Area"',
                },
            });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
