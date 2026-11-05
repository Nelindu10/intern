import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

export interface UserDoc {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'student';
  selectedPlan: 'basic' | 'pro' | 'premium';
  createdAt: Date;
}

const LOCAL_STORE_PATH = path.resolve(process.cwd(), '.data', 'users.json');

// Global connection state caching across serverless / HMR invocations
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

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

// Fallback local file store for continuous availability
function getLocalUsers(): UserDoc[] {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const data = fs.readFileSync(LOCAL_STORE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function saveLocalUsers(users: UserDoc[]) {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    // ignore
  }
}

export async function connectMongo(): Promise<Db | null> {
  if (cachedDb && cachedClient) {
    try {
      await cachedDb.command({ ping: 1 });
      return cachedDb;
    } catch (e) {
      console.warn('[MongoDB] Cached connection stale, reconnecting...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  const uri = getMongoUri();
  const dbName = getDbName(uri);

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    await client.connect();
    const db = client.db(dbName);
    await db.command({ ping: 1 });

    cachedClient = client;
    cachedDb = db;
    console.log(`[MongoDB] Connected successfully to database: "${dbName}"`);
    return db;
  } catch (err: any) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB Atlas (${err?.message || err}). Utilizing fallback storage.`);
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const normalized = email.trim().toLowerCase();

  const db = await connectMongo();
  if (db) {
    try {
      const user = await db.collection<UserDoc>('users').findOne({ email: normalized });
      if (user) return user;
    } catch (e: any) {
      console.warn('[MongoDB] findOne query notice:', e?.message || e);
    }
  }

  const locals = getLocalUsers();
  return locals.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function insertUser(user: UserDoc): Promise<boolean> {
  const normalized: UserDoc = {
    ...user,
    email: user.email.trim().toLowerCase(),
    createdAt: new Date(),
  };

  const db = await connectMongo();
  if (db) {
    try {
      await db.collection<UserDoc>('users').insertOne(normalized);
    } catch (e: any) {
      console.warn('[MongoDB] insertOne notice:', e?.message || e);
    }
  }

  const locals = getLocalUsers();
  const existingIdx = locals.findIndex((u) => u.email.toLowerCase() === normalized.email);
  if (existingIdx >= 0) {
    locals[existingIdx] = normalized;
  } else {
    locals.push(normalized);
  }
  saveLocalUsers(locals);
  return true;
}
