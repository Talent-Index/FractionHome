/**
 * @typedef {Object} Property
 * @property {string} id
 * @property {string} title
 * @property {string} address
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} valuation
 * @property {number} totalSupply
 * @property {string} description
 * @property {string} imageUrl
 * @property {string} [documentUrl]
 * @property {string} [contentHash]
 * @property {string} [tokenId]
 * @property {string} [hcsEventId]
 * @property {string} createdAt
 * @property {number} [ownedTokens]
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} propertyId
 * @property {'tokenize' | 'purchase'} type
 * @property {number} amount
 * @property {string} txId
 * @property {string} eventId
 * @property {string} timestamp
 */
