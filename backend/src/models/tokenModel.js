import db from '../db/index.js';

// src/models/tokenModel.js
// Lightweight token persistence layer used by controllers/services.
// Supports lowdb-style db (db.get/..write) if available via ../db/index.js
// Falls back to an in-memory store for tests/dev if no db is present.

class TokenModel {
    constructor(dbInstance = db) {
        this.db = dbInstance;
        this.COLLECTION = 'tokens';
        this.memoryStore = { items: new Map() };
    }

    isLowdb() {
        return this.db && typeof this.db.get === 'function';
    }

    ensureCollection() {
        if (this.isLowdb()) {
            if (!this.db.get(this.COLLECTION).value()) {
                this.db.set(this.COLLECTION, []).write();
            }
        }
    }

    nowISO() {
        return new Date().toISOString();
    }

    normalize(record) {
        return record ? { ...record } : null;
    }

    async create(payload) {
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
                createdAt: this.nowISO(),
                updatedAt: this.nowISO()
            };

            if (this.isLowdb()) {
                this.ensureCollection();
                const exists = this.db.get(this.COLLECTION).find({ tokenId: record.tokenId }).value();
                if (exists) throw new Error('Token already exists');
                this.db.get(this.COLLECTION).push(record).write();
                return this.normalize(record);
            } else {
                if (this.memoryStore.items.has(record.tokenId)) throw new Error('Token already exists');
                this.memoryStore.items.set(record.tokenId, record);
                return this.normalize(record);
            }
        } catch (err) {
            throw err;
        }
    }

    async findByTokenId(tokenId) {
        if (!tokenId) return null;
        if (this.isLowdb()) {
            this.ensureCollection();
            const rec = this.db.get(this.COLLECTION).find({ tokenId }).value();
            return this.normalize(rec);
        } else {
            const rec = this.memoryStore.items.get(tokenId) || null;
            return this.normalize(rec);
        }
    }

    async listAll(query = {}) {
        const q = {
            propertyId: query.propertyId,
            symbol: query.symbol,
            limit: query.limit ? Number(query.limit) : 100,
            offset: query.offset ? Number(query.offset) : (query.page ? (Number(query.page) - 1) * (query.limit ? Number(query.limit) : 100) : 0)
        };

        let items = [];
        if (this.isLowdb()) {
            this.ensureCollection();
            items = this.db.get(this.COLLECTION).value();
        } else {
            items = Array.from(this.memoryStore.items.values());
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
            items: slice.map(r => this.normalize(r))
        };
    }

    async incrementSupply(tokenId, amount) {
        const delta = Number(amount);
        if (!tokenId || Number.isNaN(delta)) throw new Error('tokenId and numeric amount required');

        if (this.isLowdb()) {
            this.ensureCollection();
            const found = this.db.get(this.COLLECTION).find({ tokenId }).value();
            if (!found) throw new Error('Token not found');
            const newSupply = Number(found.totalSupply || 0) + delta;
            this.db.get(this.COLLECTION).find({ tokenId }).assign({ totalSupply: newSupply, updatedAt: this.nowISO() }).write();
            return this.normalize(this.db.get(this.COLLECTION).find({ tokenId }).value());
        } else {
            const rec = this.memoryStore.items.get(tokenId);
            if (!rec) throw new Error('Token not found');
            rec.totalSupply = Number(rec.totalSupply || 0) + delta;
            rec.updatedAt = this.nowISO();
            this.memoryStore.items.set(tokenId, rec);
            return this.normalize(rec);
        }
    }

    async decrementSupply(tokenId, amount) {
        const delta = Number(amount);
        if (!tokenId || Number.isNaN(delta)) throw new Error('tokenId and numeric amount required');

        if (this.isLowdb()) {
            this.ensureCollection();
            const found = this.db.get(this.COLLECTION).find({ tokenId }).value();
            if (!found) throw new Error('Token not found');
            const current = Number(found.totalSupply || 0);
            const newSupply = current - delta;
            if (newSupply < 0) throw new Error('Resulting totalSupply would be negative');
            this.db.get(this.COLLECTION).find({ tokenId }).assign({ totalSupply: newSupply, updatedAt: this.nowISO() }).write();
            return this.normalize(this.db.get(this.COLLECTION).find({ tokenId }).value());
        } else {
            const rec = this.memoryStore.items.get(tokenId);
            if (!rec) throw new Error('Token not found');
            const current = Number(rec.totalSupply || 0);
            const newSupply = current - delta;
            if (newSupply < 0) throw new Error('Resulting totalSupply would be negative');
            rec.totalSupply = newSupply;
            rec.updatedAt = this.nowISO();
            this.memoryStore.items.set(tokenId, rec);
            return this.normalize(rec);
        }
    }
}

export default TokenModel;
