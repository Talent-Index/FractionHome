import { apiFetch } from '../config/api';

const BUYER1_ACCOUNT_ID = import.meta.env.VITE_BUYER1_ACCOUNT_ID;
const BUYER1_PRIVATE_KEY = import.meta.env.VITE_BUYER1_PRIVATE_KEY;
console.log("ENV CHECK:", BUYER1_ACCOUNT_ID, BUYER1_PRIVATE_KEY);

// Properties
export const listProperties = () => apiFetch('/api/properties');
// export const getProperty = (id) => apiFetch(`/api/properties/${id}`);

// Upload property (FormData)
export async function uploadProperty(formData) {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const resp = await fetch(`${API_BASE}/api/properties`, {
    method: 'POST',
    body: formData
  });
  if (!resp.ok) throw new Error('Upload failed');
  return resp.json();
}

// fetch prperties
export const getProperties = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/properties`);
  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }
  return response.json();
};

export const getProperty = async (id) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/properties/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch property');
  }
  return response.json();
};

// Purchase
export const buyTokens = (propertyId, body) =>
  apiFetch(`/api/properties/${propertyId}/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

// Holders / mirror-node-backed endpoints
export const getTokenHolders = (tokenId, useCache = true) =>
  apiFetch(`/api/holders/${tokenId}?useCache=${useCache}`);

export const getTokenTransfers = (tokenId, limit = 25, useCache = true) =>
  apiFetch(`/api/holders/${tokenId}/transfers?limit=${limit}&useCache=${useCache}`);

// Tokenization
export const tokenizeProperty = async (propertyId, formData) => {
  console.log("ENV CHECK:", BUYER1_ACCOUNT_ID, BUYER1_PRIVATE_KEY);
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/properties/${propertyId}/treasury`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      propertyId, // ✅ backend expects this
      name: formData.tokenName, // ✅ rename field
      symbol: formData.tokenSymbol, // ✅ rename field
      initialSupply: formData.initialSupply,
      treasuryAccountId: BUYER1_ACCOUNT_ID,
      treasuryPrivateKey: BUYER1_PRIVATE_KEY,
    }),
    
  });
  // log payload
  
  console.log(response)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Tokenization error response:", errorData);
    throw new Error(errorData.message || "Failed to tokenize property");
  }

  return response.json();
};
export const getPropertyTokens = async (propertyId) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/properties/${propertyId}/tokens`);
  if (!response.ok) {
    throw new Error("Failed to fetch token information");
  }

  const json = await response.json();
  const chainInfo = json.data?.chainInfo;

  // 🧩 Normalize totalSupply
  const totalSupply =
    typeof chainInfo?.totalSupply === "object"
      ? chainInfo.totalSupply.low || 0
      : chainInfo?.totalSupply || 0;

  return {
    ...json,
    data: {
      ...json.data,
      chainInfo: {
        ...chainInfo,
        totalSupply, // now just a number
      },
    },
  };
};

export const getPropertyById = async (propertyId) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/properties/${propertyId}`);
  
  if (!response.ok) {
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    throw new Error(`Failed to fetch property details: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Return data.property if it exists, otherwise return data
  const property = data.property || data;
  
  // Ensure required fields have default values
  return {
    ...property,
    valuation: property.valuation || 0,
    totalSupply: property.totalSupply || 0,
    tokenId: property.tokenId || null,
    ownedTokens: property.ownedTokens || 0
  };
};