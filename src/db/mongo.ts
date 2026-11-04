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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/simulatehub';
const DB_NAME = process.env.MONGODB_DB_NAME || 'simulatehub';
const LOCAL_STORE_PATH = path.resolve(process.cwd(), '.data', 'users.json');

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

// Fallback local memory & file store for continuous availability
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
  if (db && isConnected) return db;
  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });
    await client.connect();
    db = client.db(DB_NAME);
    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${DB_NAME} at ${MONGODB_URI.split('@').pop()}`);
    return db;
  } catch (err: any) {
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB URI (${err.message}). Using persistent local fallback storage.`);
    isConnected = false;
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const normalized = email.trim().toLowerCase();
  if (isConnected && db) {
    try {
      const user = await db.collection<UserDoc>('users').findOne({ email: normalized });
      if (user) return user;
    } catch (e) {
      console.warn('[MongoDB] Query fallback:', e);
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

  // Insert to MongoDB collection 'users'
  if (isConnected && db) {
    try {
      await db.collection<UserDoc>('users').insertOne(normalized);
    } catch (e) {
      console.warn('[MongoDB] insertOne error:', e);
    }
  }

  // Always sync to persistent local file store
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
