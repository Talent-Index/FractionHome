// Mock Hedera blockchain utilities

export const generateTxId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `0.0.${Math.floor(Math.random() * 1000000)}@${timestamp}.${random}`;
};

export const generateEventId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `0.0.${Math.floor(Math.random() * 1000000)}-${timestamp}-${random}`;
};

export const generateTokenId = () => {
  return `0.0.${Math.floor(Math.random() * 1000000)}`;
};

export const simulateBlockchainDelay = (ms = 2000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateContentHash = async (data) => {
  const jsonString = JSON.stringify(data);
  const msgBuffer = new TextEncoder().encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const DEMO_ACCOUNT = "0.0.123456";
export const DEMO_NETWORK = "Hedera Testnet";
