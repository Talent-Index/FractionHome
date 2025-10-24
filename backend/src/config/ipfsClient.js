// supports either ipfs-http-client (INFURA/local) or Pinata via HTTP
const { create } = require('ipfs-http-client');
const axios = require('axios');


const IPFS_API_URL = process.env.IPFS_API_URL; // e.g. https://ipfs.infura.io:5001
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;


let ipfs = null;


if (IPFS_API_URL) {
ipfs = create({ url: IPFS_API_URL });
}


module.exports = {
ipfs,
pinata: PINATA_API_KEY && PINATA_API_SECRET ? {
key: PINATA_API_KEY,
secret: PINATA_API_SECRET,
baseUrl: 'https://api.pinata.cloud'
} : null,
};