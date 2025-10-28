// supports either ipfs-http-client (INFURA/local) or Pinata via HTTP
import { create } from 'ipfs-http-client'
import axios from 'axios';


const IPFS_API_URL = process.env.IPFS_API_URL; // e.g. https://ipfs.infura.io:5001
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

let ipfs = null;


if (IPFS_API_URL) {
ipfs = create({ url: IPFS_API_URL });
}

async function fetchIpfsJson(cid, { timeout = 10000 } = {}) {
    if (!cid) throw new Error('No CID provided');

    // Prefer local/remote ipfs-http-client when available
    if (ipfs) {
        const chunks = [];
        for await (const chunk of ipfs.cat(cid)) {
            chunks.push(Buffer.from(chunk));
        }
        const buf = Buffer.concat(chunks);
        const txt = buf.toString('utf8');
        try {
            return JSON.parse(txt);
        } catch (e) {
            // return raw text if not JSON
            return txt;
        }
    }

    // Build list of HTTP gateways to try
    const gateways = [];
    if (PINATA_API_KEY && PINATA_API_SECRET) gateways.push('https://gateway.pinata.cloud');
    if (IPFS_API_URL && IPFS_API_URL.startsWith('http')) {
        // try to derive a gateway-like base from IPFS_API_URL (best-effort)
        const base = IPFS_API_URL.replace(/\/+$/, '').replace(/:5001$/, '');
        gateways.push(base);
    }
    gateways.push('https://ipfs.io');

    let lastErr;
    for (const g of gateways) {
        try {
            const url = `${g.replace(/\/+$/, '')}/ipfs/${cid}`;
            const res = await axios.get(url, { timeout });
            return res.data;
        } catch (err) {
            lastErr = err;
        }
    }

    throw lastErr || new Error('Unable to fetch IPFS content');
}
const pinata = PINATA_API_KEY && PINATA_API_SECRET ? {
    key: PINATA_API_KEY,
    secret: PINATA_API_SECRET,
    baseUrl: 'https://api.pinata.cloud'
} : null;

export { ipfs, fetchIpfsJson, pinata };
