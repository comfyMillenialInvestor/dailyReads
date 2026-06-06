import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

/**
 * GET /api/health
 * Health check endpoint for uptime monitoring services
 * Returns status of the application and database connectivity
 */
export async function GET() {
    const startTime = Date.now();

    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
            database: 'unknown' as 'ok' | 'error' | 'unknown',
        },
        responseTime: 0,
    };

    try {
        // Check database connectivity
        await dbConnect();
        health.checks.database = 'ok';
    } catch (error) {
        health.checks.database = 'error';
        health.status = 'degraded';
        console.error('Health check - DB connection failed:', error);
    }

    health.responseTime = Date.now() - startTime;

    // Return 503 if any critical service is down
    const statusCode = health.status === 'ok' ? 200 : 503;

    return NextResponse.json(health, {
        status: statusCode,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
    });
}
