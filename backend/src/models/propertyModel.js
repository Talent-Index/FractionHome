// File: backend/src/models/PropertyModel.js
import db from '../db/index.js';

class PropertyModel {
    constructor(dbInstance) {
        // Accept injected db for testing, fallback to default
        this.db = dbInstance || db;
    }

    // No async init needed — your db loads collections at startup
    // If you really need to ensure 'properties' exists, you can do:
    ensurePropertiesCollection() {
        const props = this.db.get('properties').value();
        if (!Array.isArray(props)) {
            this.db.set('properties', []).write();
        }
    }

    createProperty(record) {
        // Synchronous
        const result = this.db.get('properties').push(record).write();
        return result; // already cloned
    }

    getPropertyById(id) {
        // Synchronous
        return this.db.get('properties').find({ id }).value();
    }

    findById(id) {
        return this.getPropertyById(id);
    }

    listProperties() {
        // Synchronous
        return this.db.get('properties').value();
    }

    updateProperty(id, updates = {}) {
        if (!id) throw new Error('id is required to update a property');

        const existing = this.db.get('properties').find({ id }).value();
        if (!existing) return null;

        // Prevent changing the id
        const { id: _ignore, ...rest } = updates;

        const updated = this.db
            .get('properties')
            .find({ id })
            .assign(rest)
            .write();

        return updated;
    }
}

export default PropertyModel;