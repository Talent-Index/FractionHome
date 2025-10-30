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