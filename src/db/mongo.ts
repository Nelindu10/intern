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
      console.warn('[MongoDB Atlas] Cached connection stale, reconnecting...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  const uri = getMongoUri();
  const dbName = getDbName(uri);
  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');

  console.log(`[MongoDB Atlas] Attempting connection to database "${dbName}" via URI: ${maskedUri}`);

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
    console.log(`[MongoDB Atlas SUCCESS] Connected successfully to database: "${dbName}"`);
    return db;
  } catch (err: any) {
    console.error(`[MongoDB Atlas FAILURE] Could not connect to MongoDB (${err?.message || err}). Details:`, {
      name: err?.name,
      message: err?.message,
      code: err?.code,
    });
    console.warn('[MongoDB Atlas] Utilizing local fallback storage for continuous availability.');
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const normalized = email.trim().toLowerCase();

  const db = await connectMongo();
  if (db) {
    try {
      console.log(`[MongoDB Query] Searching for user email: "${normalized}" in collection "users"`);
      const user = await db.collection<UserDoc>('users').findOne({ email: normalized });
      if (user) {
        console.log(`[MongoDB Query SUCCESS] User found in MongoDB Atlas: "${normalized}"`);
        return user;
      }
      console.log(`[MongoDB Query] User not found in MongoDB Atlas: "${normalized}"`);
    } catch (e: any) {
      console.error('[MongoDB Query ERROR] findOne failed:', e?.message || e);
    }
  }

  console.log(`[Fallback Store] Checking local storage for email: "${normalized}"`);
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
      console.log(`[MongoDB Insert] Inserting new user: "${normalized.email}" into collection "users"`);
      await db.collection<UserDoc>('users').insertOne(normalized);
      console.log(`[MongoDB Insert SUCCESS] User inserted into MongoDB Atlas: "${normalized.email}"`);
    } catch (e: any) {
      console.error('[MongoDB Insert ERROR] insertOne failed:', e?.message || e);
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
  console.log(`[Fallback Store] Synced user to local storage: "${normalized.email}"`);
  return true;
}
