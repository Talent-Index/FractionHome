import { apiFetch } from '../config/api';

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
export const tokenizeProperty = async (propertyId, tokenizationDetails) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/properties/${propertyId}/tokenize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tokenizationDetails)
  });

  if (!response.ok) {
    throw new Error('Failed to tokenize property');
  }
  return response.json();
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
  // Return the nested property object from the response
  if (!data.ok || !data.property) {
    throw new Error('Property not found');
  }
  
  return data.property;
};