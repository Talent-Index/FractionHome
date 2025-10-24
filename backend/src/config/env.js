// Add to existing env configuration
module.exports = {
  // ... existing config
  dummyBuyers: [
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
  ].filter(b => b.accountId && b.privateKey)
};


require('dotenv').config();


// minimal validation
if (!process.env.IPFS_API_URL && !process.env.PINATA_API_KEY) {
console.warn('No IPFS provider configured. Set IPFS_API_URL or PINATA_* env vars.');
}