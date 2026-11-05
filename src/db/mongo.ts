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

// Encodes special unescaped characters in username & password portions of MongoDB URIs
export function encodeMongoUriPassword(uri: string): string {
  if (!uri) return uri;

  let schemePrefix = '';
  let rest = uri;

  if (uri.startsWith('mongodb+srv://')) {
    schemePrefix = 'mongodb+srv://';
    rest = uri.slice('mongodb+srv://'.length);
  } else if (uri.startsWith('mongodb://')) {
    schemePrefix = 'mongodb://';
    rest = uri.slice('mongodb://'.length);
  } else {
    return uri;
  }

  // Find the LAST `@` character in rest before any `/` or `?`
  const pathOrQueryStart = rest.search(/[\/\?]/);
  const searchSubstring = pathOrQueryStart !== -1 ? rest.slice(0, pathOrQueryStart) : rest;
  const lastAtPos = searchSubstring.lastIndexOf('@');

  if (lastAtPos === -1) {
    // No credentials present in URI
    return uri;
  }

  const userInfo = rest.slice(0, lastAtPos);
  const hostAndParams = rest.slice(lastAtPos + 1);

  // Split userInfo into username and password at the FIRST `:`
  const firstColonPos = userInfo.indexOf(':');
  if (firstColonPos === -1) {
    // Username only, no password
    return `${schemePrefix}${userInfo}@${hostAndParams}`;
  }

  const rawUser = userInfo.slice(0, firstColonPos);
  const rawPassword = userInfo.slice(firstColonPos + 1);

  // Safely decode any existing URL encoding first, then re-encode with encodeURIComponent
  let safeUser = rawUser;
  let safePass = rawPassword;

  try {
    safeUser = encodeURIComponent(decodeURIComponent(rawUser));
  } catch (e) {
    safeUser = encodeURIComponent(rawUser);
  }

  try {
    safePass = encodeURIComponent(decodeURIComponent(rawPassword));
  } catch (e) {
    safePass = encodeURIComponent(rawPassword);
  }

  return `${schemePrefix}${safeUser}:${safePass}@${hostAndParams}`;
}

// Robust URI parser that strips quotes, whitespace, formats schemes, and URL-encodes user credentials
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

  if (!clean.startsWith('mongodb://') && !clean.startsWith('mongodb+srv://')) {
    if (clean.includes('@') && (clean.includes('.mongodb.net') || clean.includes('.'))) {
      const stripped = clean.replace(/^mongodb(\+srv)?:\/\//i, '');
      clean = `mongodb+srv://${stripped}`;
    } else {
      console.warn('[MongoDB Atlas] Invalid or unconfigured MONGODB_URI. Defaulting to local connection string.');
      clean = 'mongodb://127.0.0.1:27017/simulatehub';
    }
  }

  // Automatically URL-encode unescaped special characters in credentials
  return encodeMongoUriPassword(clean);
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
