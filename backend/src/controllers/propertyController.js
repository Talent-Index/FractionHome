import PropertyModel from '../models/propertyModel.js';
import { sha256Hex } from '../utils/hashUtil.js'; // ensure these utilities exist and export these functions
import { fetchIpfsJson } from '../config/ipfsClient.js';

const propertyModel = new PropertyModel();

async function uploadProperty(req, res, next) {
    try {
        const { canonical, metadataCid, canonicalHash, media } = req.body || {};
        if (!canonical || !canonical.id) {
            return res.status(400).json({ error: 'Missing canonical id' });
        }

        const record = {
            id: canonical.id,
            metadataCid,
            canonicalHash,
            createdAt: canonical.createdAt,
            preview: Array.isArray(media) ? media[0] || null : media || null,
        };

        await propertyModel.createProperty(record);

        return res.json({ ok: true, record });
    } catch (err) {
        next(err);
    }
}

async function getProperty(req, res, next) {
    try {
        const id = req.params.id;
        const p = await propertyModel.getPropertyById(id);
        if (!p) return res.status(404).json({ error: 'Not found' });
        return res.json({ ok: true, property: p });
    } catch (err) {
        next(err);
    }
}

async function verifyProperty(req, res, next) {
    try {
        const id = req.params.id;
        const p = await propertyModel.getPropertyById(id);
        if (!p) return res.status(404).json({ error: 'Not found' });

        const meta = await fetchIpfsJson(p.metadataCid);
        // Note: To avoid canonicalization mismatch we compute hash the same way we created it
        const recomputed = sha256Hex(JSON.stringify({
            id: meta.id,
            createdAt: meta.createdAt,
            properties: meta.properties,
            media: meta.media,
        }));

        const ok = recomputed === p.canonicalHash || recomputed === meta.sha256;
        return res.json({ ok, storedHash: p.canonicalHash, metaSha: meta.sha256 || null, recomputed });
    } catch (err) {
        next(err);
    }
}

async function listAll(_req, res, next) {
    try {
        const items = await propertyModel.listProperties();
        res.json({ ok: true, items });
    } catch (err) {
        next(err);
    }
}

export { uploadProperty, getProperty, verifyProperty, listAll };
