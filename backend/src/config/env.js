require('dotenv').config();


// minimal validation
if (!process.env.IPFS_API_URL && !process.env.PINATA_API_KEY) {
  console.warn('No IPFS provider configured. Set IPFS_API_URL or PINATA_* env vars.');
}

// Build dummy buyers safely and export configuration
const dummyBuyers = [
  {
    accountId: process.env.BUYER1_ACCOUNT_ID,
    privateKey: process.env.BUYER1_PRIVATE_KEY
  },
  {
    accountId: process.env.BUYER2_ACCOUNT_ID,
    privateKey: process.env.BUYER2_PRIVATE_KEY
  },
  {
    accountId: process.env.BUYER3_ACCOUNT_ID,
    privateKey: process.env.BUYER3_PRIVATE_KEY
  }
].filter(b => b && b.accountId && b.privateKey);

module.exports = {
  // Export commonly used env values explicitly to avoid undefined property access elsewhere
  ipfsApiUrl: process.env.IPFS_API_URL || null,
  pinataApiKey: process.env.PINATA_API_KEY || null,
  pinataSecret: process.env.PINATA_SECRET || null,
  // Add other env-derived config entries here as needed

  dummyBuyers
};