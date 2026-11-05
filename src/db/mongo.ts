import { MongoClient, Db } from 'mongodb';
import crypto from 'crypto';

export interface UserDoc {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'student';
  selectedPlan: 'basic' | 'pro' | 'premium';
  createdAt: Date;
}

// Global connection state caching across serverless invocations (Vercel)
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Password hashing utilities using Node.js native crypto
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (password === storedHash) return true; // Direct match fallback (for legacy unhashed passwords)
  const hashedInput = hashPassword(password);
  return hashedInput === storedHash;
}

// Robust URI parser that strips quotes, whitespace, and validates scheme prefixes
export function getCleanMongoUri(): string {
  const raw =
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL ||
    '';

  // Strip leading/trailing double or single quotes, quotes inside env, whitespace, and linebreaks
  let clean = raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\"/g, '')
    .trim();

  if (clean.startsWith('mongodb://') || clean.startsWith('mongodb+srv://')) {
    return clean;
  }

  // If user provided user:pass@cluster string without scheme prefix, auto-prefix with mongodb+srv://
  if (clean.includes('@') && (clean.includes('.mongodb.net') || clean.includes('.'))) {
    const stripped = clean.replace(/^mongodb(\+srv)?:\/\//i, '');
    return `mongodb+srv://${stripped}`;
  }

  console.warn('[MongoDB Atlas] Invalid or unconfigured MONGODB_URI. Defaulting to local connection string.');
  return 'mongodb://127.0.0.1:27017/simulatehub';
}

function getDbName(uri: string): string {
  if (process.env.MONGODB_DB_NAME) return process.env.MONGODB_DB_NAME;
  try {
    const parsed = new URL(uri);
    const pathname = parsed.pathname.replace(/^\//, '');
    if (pathname && !pathname.includes('?')) {
      return pathname;
    }
  } catch (e) {
    // ignore
  }
  return 'simulatehub';
}

export async function connectMongo(): Promise<Db> {
  if (cachedDb && cachedClient) {
    try {
      await cachedDb.command({ ping: 1 });
      return cachedDb;
    } catch (e) {
      console.warn('[MongoDB Atlas] Stale connection detected, reconnecting...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  const uri = getCleanMongoUri();
  const dbName = getDbName(uri);
  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');

  console.log(`[MongoDB Atlas] Connecting to database "${dbName}" via URI: ${maskedUri}`);

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    await client.connect();
    const db = client.db(dbName);
    await db.command({ ping: 1 });

    cachedClient = client;
    cachedDb = db;
    console.log(`[MongoDB Atlas SUCCESS] Connected successfully to database: "${dbName}"`);
    return db;
  } catch (err: any) {
    console.error(`[MongoDB Atlas FAILURE] Could not connect to MongoDB Atlas (${err?.message || err}).`);
    throw new Error(`MongoDB connection error: ${err?.message || 'Server selection timeout'}`);
  }
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const normalized = email.trim().toLowerCase();
  const db = await connectMongo();
  console.log(`[MongoDB Query] Searching for user "${normalized}" in "users" collection...`);
  const user = await db.collection<UserDoc>('users').findOne({ email: normalized });
  if (user) {
    console.log(`[MongoDB Query SUCCESS] User found in MongoDB Atlas: "${normalized}"`);
    return user;
  }
  console.log(`[MongoDB Query] User not found in MongoDB Atlas: "${normalized}"`);
  return null;
}

export async function insertUser(user: UserDoc): Promise<boolean> {
  const normalized: UserDoc = {
    ...user,
    email: user.email.trim().toLowerCase(),
    createdAt: user.createdAt || new Date(),
  };

  const db = await connectMongo();
  console.log(`[MongoDB Insert] Inserting new user "${normalized.email}" into "users" collection...`);
  const result = await db.collection<UserDoc>('users').insertOne(normalized);
  console.log(`[MongoDB Insert SUCCESS] Inserted user "${normalized.email}" into MongoDB Atlas with ID: ${result.insertedId}`);
  return true;
}
