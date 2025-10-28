import { Low } from 'lowdb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const file = path.join(__dirname, '../../db/properties.json');
const adapter = new FileSync(file);
const db = new Low(adapter);


async function init() {
await db.read();
db.data = db.data || { properties: [] };
await db.write();
}


async function createProperty(record) {
await db.read();
db.data.properties.push(record);
await db.write();
return record;
}


async function getPropertyById(id) {
await db.read();
return db.data.properties.find(p => p.id === id);
}


async function listProperties() {
await db.read();
return db.data.properties;
}

export { init, createProperty, getPropertyById, listProperties };
