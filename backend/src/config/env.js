require('dotenv').config();


// minimal validation
if (!process.env.IPFS_API_URL && !process.env.PINATA_API_KEY) {
console.warn('No IPFS provider configured. Set IPFS_API_URL or PINATA_* env vars.');
}
