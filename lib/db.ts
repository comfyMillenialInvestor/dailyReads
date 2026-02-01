import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'dailyReads';

if (!MONGO_URI) {
    throw new Error(
        'Please define the MONGO_URI environment variable inside .env.local'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            dbName: DB_NAME, // Explicitly set database name
        };

        cached.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
            console.log(`MongoDB connected successfully to database: ${DB_NAME}`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;

