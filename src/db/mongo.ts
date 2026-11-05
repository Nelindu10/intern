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

function getMongoUri(): string {
  return process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/simulatehub';
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

  const uri = getMongoUri();
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
    console.error(`[MongoDB Atlas FAILURE] Could not connect to MongoDB Atlas:`, err?.message || err);
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
