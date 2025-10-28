import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// File: backend/src/db/index.js
// Lightweight SQLite-backed lowdb-like shim for this project.
// Exports a db object with .get(collection).value()/find()/push()/assign() and .set().write()
// Uses better-sqlite3 for synchronous I/O and keeps an in-memory cache for fast reads.


const DB_FILE = process.env.DB_FILE || path.resolve(__dirname, '..', '..', 'data', 'db.sqlite');

// ensure directory exists
const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const conn = new Database(DB_FILE);
conn.prepare(`
    CREATE TABLE IF NOT EXISTS collections (
        name TEXT PRIMARY KEY,
        data TEXT NOT NULL
    )
`).run();

const store = Object.create(null);

// load existing collections into memory
const rows = conn.prepare('SELECT name, data FROM collections').all();
for (const { name, data } of rows) {
    try {
        store[name] = JSON.parse(data);
    } catch (e) {
        store[name] = [];
    }
}

function persistCollection(name) {
    const data = JSON.stringify(store[name] || []);
    conn.prepare('INSERT INTO collections(name, data) VALUES(?, ?) ON CONFLICT(name) DO UPDATE SET data=excluded.data').run(name, data);
}

function match(record, criteria) {
    if (!criteria || typeof criteria !== 'object') return false;
    for (const k of Object.keys(criteria)) {
        if (record == null || record[k] !== criteria[k]) return false;
    }
    return true;
}

function clone(v) {
    return JSON.parse(JSON.stringify(v));
}

function getCollectionProxy(name) {
    return {
        value() {
            return clone(store[name] || []);
        },
        find(criteria) {
            const arr = store[name] || [];
            const found = arr.find(r => match(r, criteria)) || null;
            return {
                value() {
                    return clone(found);
                },
                assign(obj = {}) {
                    return {
                        write() {
                            if (!found) return null;
                            Object.assign(found, obj);
                            persistCollection(name);
                            return clone(found);
                        }
                    };
                }
            };
        },
        push(record) {
            return {
                write() {
                    if (!store[name]) store[name] = [];
                    store[name].push(record);
                    persistCollection(name);
                    return clone(record);
                }
            };
        }
    };
}

const db = {
    // low-level helpers used by models in this project
    get(collectionName) {
        return getCollectionProxy(collectionName);
    },
    set(collectionName, arr) {
        return {
            write() {
                store[collectionName] = Array.isArray(arr) ? arr : [];
                persistCollection(collectionName);
                return clone(store[collectionName]);
            }
        };
    },
    // convenience: list all collection names (not required but useful)
    _listCollections() {
        return Object.keys(store);
    },
    // ensure process can close DB if needed
    _close() {
        try {
            conn.close();
        } catch (e) {
            // ignore
        }
    }
};

export default db;