import { Low, JSONFile } from 'lowdb';
import path from 'path';
import { fileURLToPath } from 'url';

import db from '../db/index.js';


class PropertyModel {
    constructor(dbInstance) {
        this.db = dbInstance || db;
    }

    async init() {
        await this.db.read();
        this.db.data = this.db.data || {};
        this.db.data.properties = this.db.data.properties || [];
        await this.db.write();
    }

    async createProperty(record) {
        await this.db.read();
        this.db.data = this.db.data || {};
        this.db.data.properties = this.db.data.properties || [];
        this.db.data.properties.push(record);
        await this.db.write();
        return record;
    }

    async getPropertyById(id) {
        await this.db.read();
        const properties = (this.db.data && this.db.data.properties) || [];
        return properties.find(p => p.id === id);
    }

    async listProperties() {
        await this.db.read();
        return (this.db.data && this.db.data.properties) || [];
    }
}

export default PropertyModel;
