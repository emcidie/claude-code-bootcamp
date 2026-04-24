const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'bootcamp.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

const cols = db.prepare("PRAGMA table_info(participants)").all().map(c => c.name);
if (!cols.includes('username')) db.exec('ALTER TABLE participants ADD COLUMN username TEXT');
if (!cols.includes('password_hash')) db.exec('ALTER TABLE participants ADD COLUMN password_hash TEXT');
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_username ON participants(username) WHERE username IS NOT NULL');

module.exports = db;
