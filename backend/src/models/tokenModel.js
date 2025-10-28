import db from '../db/index.js';

// src/models/tokenModel.js
// Lightweight token persistence layer used by controllers/services.
// Supports lowdb-style db (db.get/..write) if available via ../db/index.js
// Falls back to an in-memory store for tests/dev if no db is present.


const COLLECTION = 'tokens';

// Simple in-memory fallback store
const memoryStore = {
    items: new Map()
};

function isLowdb(d) {
    return d && typeof d.get === 'function';
}

function ensureCollection() {
    if (isLowdb(db)) {
        if (!db.get(COLLECTION).value()) {
            db.set(COLLECTION, []).write();
        }
    }
}

function nowISO() {
    return new Date().toISOString();
}

/**
 * Normalize record before returning (shallow clone)
 */
function normalize(record) {
    return record ? { ...record } : null;
}

async function create(payload) {
    try {
        const record = {
            tokenId: payload.tokenId,
            propertyId: payload.propertyId,
            name: payload.name,
            symbol: payload.symbol,
            decimals: payload.decimals ?? 0,
            totalSupply: Number(payload.totalSupply ?? 0),
            treasury: payload.treasury ?? null,
            metadata: payload.metadata ?? {},
            createdAt: nowISO(),
            updatedAt: nowISO()
        };

        if (isLowdb(db)) {
            ensureCollection();
            // avoid duplicates
            const exists = db.get(COLLECTION).find({ tokenId: record.tokenId }).value();
            if (exists) throw new Error('Token already exists');
            db.get(COLLECTION).push(record).write();
            return normalize(record);
        } else {
            if (memoryStore.items.has(record.tokenId)) throw new Error('Token already exists');
            memoryStore.items.set(record.tokenId, record);
            return normalize(record);
        }
    } catch (err) {
        throw err;
    }
}

async function findByTokenId(tokenId) {
    if (!tokenId) return null;
    if (isLowdb(db)) {
        ensureCollection();
        const rec = db.get(COLLECTION).find({ tokenId }).value();
        return normalize(rec);
    } else {
        const rec = memoryStore.items.get(tokenId) || null;
        return normalize(rec);
    }
}

/**
 * List tokens with optional filters: propertyId, symbol
 * Supports pagination: limit, offset (or page)
 */
async function listAll(query = {}) {
    const q = {
        propertyId: query.propertyId,
        symbol: query.symbol,
        limit: query.limit ? Number(query.limit) : 100,
        offset: query.offset ? Number(query.offset) : (query.page ? (Number(query.page) - 1) * (query.limit ? Number(query.limit) : 100) : 0)
    };

    let items = [];
    if (isLowdb(db)) {
        ensureCollection();
        items = db.get(COLLECTION).value();
    } else {
        items = Array.from(memoryStore.items.values());
    }

    if (q.propertyId) {
        items = items.filter(i => i.propertyId === q.propertyId);
    }
    if (q.symbol) {
        items = items.filter(i => i.symbol === q.symbol);
    }

    const total = items.length;
    const slice = items.slice(q.offset, q.offset + q.limit);
    return {
        total,
        limit: q.limit,
        offset: q.offset,
        items: slice.map(normalize)
    };
}

async function incrementSupply(tokenId, amount) {
    const delta = Number(amount);
    if (!tokenId || Number.isNaN(delta)) throw new Error('tokenId and numeric amount required');

    if (isLowdb(db)) {
        ensureCollection();
        const found = db.get(COLLECTION).find({ tokenId }).value();
        if (!found) throw new Error('Token not found');
        const newSupply = Number(found.totalSupply || 0) + delta;
        db.get(COLLECTION).find({ tokenId }).assign({ totalSupply: newSupply, updatedAt: nowISO() }).write();
        return normalize(db.get(COLLECTION).find({ tokenId }).value());
    } else {
        const rec = memoryStore.items.get(tokenId);
        if (!rec) throw new Error('Token not found');
        rec.totalSupply = Number(rec.totalSupply || 0) + delta;
        rec.updatedAt = nowISO();
        memoryStore.items.set(tokenId, rec);
        return normalize(rec);
    }
}

async function decrementSupply(tokenId, amount) {
    const delta = Number(amount);
    if (!tokenId || Number.isNaN(delta)) throw new Error('tokenId and numeric amount required');

    if (isLowdb(db)) {
        ensureCollection();
        const found = db.get(COLLECTION).find({ tokenId }).value();
        if (!found) throw new Error('Token not found');
        const current = Number(found.totalSupply || 0);
        const newSupply = current - delta;
        if (newSupply < 0) throw new Error('Resulting totalSupply would be negative');
        db.get(COLLECTION).find({ tokenId }).assign({ totalSupply: newSupply, updatedAt: nowISO() }).write();
        return normalize(db.get(COLLECTION).find({ tokenId }).value());
    } else {
        const rec = memoryStore.items.get(tokenId);
        if (!rec) throw new Error('Token not found');
        const current = Number(rec.totalSupply || 0);
        const newSupply = current - delta;
        if (newSupply < 0) throw new Error('Resulting totalSupply would be negative');
        rec.totalSupply = newSupply;
        rec.updatedAt = nowISO();
        memoryStore.items.set(tokenId, rec);
        return normalize(rec);
    }
}

export default {
    create,
    findByTokenId,
    listAll,
    incrementSupply,
    decrementSupply
};