// src/config/ipfsClient.js
import 'dotenv/config';
import { create } from 'ipfs-http-client';
import axios from 'axios';

const IPFS_API_URL = process.env.IPFS_API_URL || null;
const PINATA_API_KEY = process.env.PINATA_API_KEY || null;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET || null;

let ipfs = null;

if (IPFS_API_URL) {
    try {
        ipfs = create({ url: IPFS_API_URL });
    } catch (e) {
        console.warn('Failed to create IPFS client:', e.message || e);
    }
}

if (!IPFS_API_URL && !(PINATA_API_KEY && PINATA_API_SECRET)) {
    console.warn('No IPFS provider configured. Set IPFS_API_URL or PINATA_* env vars.');
}

function normalizeCid(cid) {
    if (!cid) return cid;
    return cid.replace(/^ipfs:\/\//i, '').replace(/^\/ipfs\//i, '');
}

async function _tryFetchUrl(url, { timeout = 15000, headers = {} } = {}) {
    try {
        const res = await axios.get(url, {
            timeout,
            responseType: 'text',
            headers: {
                'User-Agent': 'property-tokenization-backend/1.0',
                ...headers
            }
        });
        const txt = res.data;
        try {
            return JSON.parse(txt);
        } catch {
            return txt;
        }
    } catch (err) {
        const status = err.response?.status;
        const message = `Failed to fetch ${url}${status ? ` (status ${status})` : ''}`;
        const wrapped = new Error(message);
        wrapped.cause = err;
        throw wrapped;
    }
}

async function fetchFromIpfsClient(cid) {
    const normalized = normalizeCid(cid);
    const chunks = [];
    for await (const chunk of ipfs.cat(normalized)) {
        chunks.push(Buffer.from(chunk));
    }
    const txt = Buffer.concat(chunks).toString('utf8');
    try {
        return JSON.parse(txt);
    } catch {
        return txt;
    }
}

async function fetchIpfsJson(cid, { timeout = 15000 } = {}) {
    if (!cid) throw new Error('No CID provided');
    const normalized = normalizeCid(cid);
    let lastErr;

    // 1. Try direct IPFS client (fastest)
    if (ipfs) {
        try {
            return await fetchFromIpfsClient(normalized);
        } catch (err) {
            lastErr = err;
        }
    }

    // 2. Try public gateways (NO trailing spaces, NO Pinata headers on gateway)
    const gateways = [];

    // Add custom gateway from IPFS_API_URL if it's a gateway (not API port 5001)
    if (IPFS_API_URL && !IPFS_API_URL.includes(':5001')) {
        gateways.push(IPFS_API_URL.replace(/\/+$/, ''));
    }

    console.log('Pinata Key Present:', !!PINATA_API_KEY);
    console.log('IPFS API URL:', IPFS_API_URL);

    // Public gateways — CLEAN URLs
    gateways.push(
        'https://gateway.pinata.cloud',
        'https://ipfs.io',
        'https://dweb.link',
        'https://cf-ipfs.com'
    );

    for (const base of gateways) {
        try {
            const url = `${base}/ipfs/${normalized}`;
            return await _tryFetchUrl(url, { timeout });
        } catch (err) {
            lastErr = err;
        }
    }

    // 3. (Optional) If you need authenticated access, use Pinata API to *pin* or *check*, but NOT to fetch content
    //    Content fetch should rely on gateways. Skip authenticated fetch here.

    throw lastErr || new Error(`All IPFS gateways failed for CID: ${normalized}`);
}

const pinata = PINATA_API_KEY && PINATA_API_SECRET
    ? { key: PINATA_API_KEY, secret: PINATA_API_SECRET, baseUrl: 'https://api.pinata.cloud' }
    : null;

export { ipfs, fetchIpfsJson, pinata };