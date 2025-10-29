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

async function uploadPhoto(req, res, next) {
    try {
        // Accept common upload shapes:
        // - multer: req.file (with .buffer, .originalname, .mimetype)
        // - multiple files: req.files[0]
        // - base64 body: req.body.data (optionally "data:<mime>;base64,<data>") and optional req.body.filename
        const file = req.file || (Array.isArray(req.files) && req.files[0]) || null;

        let content;
        let filename = 'file';
        let contentType = 'application/octet-stream';

        if (file) {
            // multer-style or similar
            content = file.buffer || file; // buffer or stream-like
            filename = file.originalname || file.name || filename;
            contentType = file.mimetype || contentType;
        } else if (req.body && req.body.data) {
            const dataStr = req.body.data;
            const matches = dataStr.match(/^data:(.+);base64,(.*)$/);
            if (matches) {
                contentType = matches[1];
                content = Buffer.from(matches[2], 'base64');
            } else {
                // assume raw base64
                content = Buffer.from(dataStr, 'base64');
            }
            filename = req.body.filename || filename;
        } else {
            return res.status(400).json({ error: 'No file provided' });
        }

        const PINATA_API_KEY = process.env.PINATA_API_KEY;
        const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
        if (!PINATA_API_KEY || !PINATA_API_SECRET) {
            return res.status(500).json({ error: 'Pinata API credentials not configured' });
        }

        const pinataUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

        // Normalize content to a Blob so FormData works in Node 18+ and browsers
        let blob;
        if (typeof Blob !== 'undefined') {
            // if content is already a Blob/File, use it
            if (content instanceof Blob) {
                blob = content;
            } else {
                // Buffer -> Uint8Array for Blob
                const uint8 = content instanceof Uint8Array ? content : Buffer.from(content);
                blob = new Blob([uint8], { type: contentType });
            }
        } else {
            // Fallback: append Buffer directly (some runtimes support this)
            blob = content;
        }

        const form = new FormData();
        // Append file. In environments supporting Blob+FormData, third arg is filename.
        form.append('file', blob, filename);

        const resp = await fetch(pinataUrl, {
            method: 'POST',
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_API_SECRET,
                // Do NOT set Content-Type; fetch/form-data will set boundary automatically
            },
            body: form,
        });

        const respText = await resp.text();
        let data;
        try {
            data = respText ? JSON.parse(respText) : null;
        } catch (e) {
            // non-JSON response
            data = respText;
        }

        if (!resp.ok) {
            return res.status(resp.status || 502).json({ error: 'Pinata pin failed', details: data || respText });
        }

        const cid = (data && (data.IpfsHash || data.ipfs_hash || data.cid)) || null;
        const gatewayBase = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
        const gateway = cid ? `${gatewayBase.replace(/\/+$/, '')}/${cid}` : null;

        return res.json({ ok: true, cid, gateway, ipfsResult: data });
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

        let meta;
        try {
            meta = await fetchIpfsJson(p.metadataCid);
        } catch (fetchErr) {
            // If the IPFS fetch indicates a 404 / Not Found, return a 404 JSON response
            const message = (fetchErr && (fetchErr.message || fetchErr.toString())) || 'Unknown error';
            const isNotFound =
                (fetchErr && (fetchErr.status === 404 || fetchErr.statusCode === 404)) ||
                /404|not found/i.test(message);
            if (isNotFound) {
                return res.status(404).json({ error: 'Metadata not found on IPFS', details: message });
            }
            // For other fetch errors, rethrow to be handled by outer catch
            throw fetchErr;
        }

        // Ensure we actually got metadata back
        if (!meta) {
            return res.status(502).json({ error: 'Empty metadata fetched from IPFS' });
        }

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
async function updateProperty(req, res, next) {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ error: 'Missing id' });

        const existing = await propertyModel.getPropertyById(id);
        if (!existing) return res.status(404).json({ error: 'Not found' });

        const body = req.body || {};

        if (body.canonical && body.canonical.id && body.canonical.id !== id) {
            return res.status(400).json({ error: 'Canonical id mismatch' });
        }

        const updates = {};
        if (body.metadataCid !== undefined) updates.metadataCid = body.metadataCid;
        if (body.canonicalHash !== undefined) updates.canonicalHash = body.canonicalHash;
        if (body.canonical && body.canonical.createdAt !== undefined) updates.createdAt = body.canonical.createdAt;
        if (body.preview !== undefined) updates.preview = body.preview;
        if (body.media !== undefined) {
            updates.preview = Array.isArray(body.media) ? body.media[0] || null : body.media || null;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided' });
        }

        // Expect propertyModel.updateProperty(id, updates) to apply partial updates and return the updated record.
        const updated = await propertyModel.updateProperty(id, updates);

        // If the model returns nothing, merge locally for response consistency.
        const responseRecord = updated || { ...existing, ...updates };

        return res.json({ ok: true, property: responseRecord });
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

export { uploadProperty, uploadPhoto, getProperty, verifyProperty, listAll, updateProperty };
