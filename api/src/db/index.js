// api/src/db/index.js
import Database from 'better-sqlite3'

const db = new Database('./data.db')
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,                    -- legacy (unused with Supabase, keep for future profile info)
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  origin_airport TEXT,
  start_date TEXT,
  end_date TEXT,
  budget TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
  user_id TEXT,
  role TEXT,
  content TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
  name TEXT,
  description TEXT,
  day INTEGER,
  start_time TEXT,
  end_time TEXT,
  lat REAL,
  lng REAL,
  address TEXT,
  external_url TEXT,
  source TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`)

export default db
