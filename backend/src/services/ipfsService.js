const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const { ipfs, pinata } = require('../config/ipfsClient');
const logger = require('../config/logger');


async function uploadBufferToIpfs(buffer, filename) {
if (ipfs) {
const result = await ipfs.add({ path: filename, content: buffer });
// result is an object; return CID string
return result.cid.toString();
}


if (pinata) {
const form = new FormData();
form.append('file', buffer, { filename });
const resp = await axios.post(`${pinata.baseUrl}/pinning/pinFileToIPFS`, form, {
maxBodyLength: 'Infinity',
headers: {
...form.getHeaders(),
pinata_api_key: pinata.key,
pinata_secret_api_key: pinata.secret,
},
});
return resp.data.IpfsHash;
}


throw new Error('No IPFS provider configured');
}


async function uploadJsonToIpfs(obj) {
const json = JSON.stringify(obj);
if (ipfs) {
const result = await ipfs.add({ path: 'metadata.json', content: Buffer.from(json) });
return result.cid.toString();
}
if (pinata) {
const resp = await axios.post(`${pinata.baseUrl}/pinning/pinJSONToIPFS`, obj, {
headers: {
pinata_api_key: pinata.key,
pinata_secret_api_key: pinata.secret,
}
});
return resp.data.IpfsHash;
}
throw new Error('No IPFS provider configured');
}


async function fetchIpfsJson(cid) {
// try gateway
const gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
const url = `${gateway}${cid}`;
const resp = await axios.get(url, { timeout: 10000 });
return resp.data;
}


module.exports = { uploadBufferToIpfs, uploadJsonToIpfs, fetchIpfsJson };
