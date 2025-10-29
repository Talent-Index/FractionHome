const PROPERTIES_KEY = 'hedera_properties';
const TRANSACTIONS_KEY = 'hedera_transactions';

export const getProperties = () => {
  const stored = localStorage.getItem(PROPERTIES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveProperty = (property) => {
  const properties = getProperties();
  properties.push(property);
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
};

export const updateProperty = (id, updates) => {
  const properties = getProperties();
  const index = properties.findIndex(p => p.id === id);
  if (index !== -1) {
    properties[index] = { ...properties[index], ...updates };
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
  }
};

export const getProperty = (id) => {
  return getProperties().find(p => p.id === id);
};

export const getTransactions = () => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransaction = (transaction) => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getPropertyTransactions = (propertyId) => {
  return getTransactions().filter(t => t.propertyId === propertyId);
};
