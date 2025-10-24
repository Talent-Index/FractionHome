/**
 * IPFS Client Configuration
 * Uses Pinata as the primary IPFS pinning service
 * Supports fallback to Infura and migration to self-hosted
 */

const axios = require('axios');
const FormData = require('form-data');
const logger = require('./logger');

class IPFSClient {
  constructor() {
    this.provider = process.env.IPFS_PROVIDER || 'pinata'; // 'pinata', 'infura', or 'local'
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'pinata':
        this.apiKey = process.env.PINATA_API_KEY;
        this.apiSecret = process.env.PINATA_API_SECRET;
        this.gateway = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
        this.pinEndpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
        this.pinJsonEndpoint = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
        
        if (!this.apiKey || !this.apiSecret) {
          throw new Error('Pinata credentials not configured');
        }
        break;

      case 'infura':
        this.projectId = process.env.INFURA_PROJECT_ID;
        this.projectSecret = process.env.INFURA_PROJECT_SECRET;
        this.gateway = `https://ipfs.infura.io:5001/api/v0`;
        
        if (!this.projectId || !this.projectSecret) {
          throw new Error('Infura credentials not configured');
        }
        break;

      case 'local':
        this.gateway = process.env.IPFS_LOCAL_GATEWAY || 'http://localhost:5001';
        break;

      default:
        throw new Error(`Unknown IPFS provider: ${this.provider}`);
    }

    logger.info(`IPFS Client initialized with provider: ${this.provider}`);
  }

  /**
   * Upload file buffer to IPFS
   * @param {Buffer} buffer - File buffer
   * @param {string} filename - Original filename
   * @param {Object} metadata - Additional pin metadata
   * @returns {Promise<{cid: string, size: number, pinned: boolean}>}
   */
  async uploadFile(buffer, filename, metadata = {}) {
    try {
      if (this.provider === 'pinata') {
        return await this.uploadFileToPinata(buffer, filename, metadata);
      } else if (this.provider === 'infura') {
        return await this.uploadFileToInfura(buffer, filename, metadata);
      } else {
        return await this.uploadFileToLocal(buffer, filename, metadata);
      }
    } catch (error) {
      logger.error('IPFS file upload failed:', error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Upload JSON metadata to IPFS
   * @param {Object} json - JSON object to upload
   * @param {Object} pinMetadata - Additional pin metadata
   * @returns {Promise<{cid: string, size: number, pinned: boolean}>}
   */
  async uploadJSON(json, pinMetadata = {}) {
    try {
      if (this.provider === 'pinata') {
        return await this.uploadJSONToPinata(json, pinMetadata);
      } else if (this.provider === 'infura') {
        return await this.uploadJSONToInfura(json, pinMetadata);
      } else {
        return await this.uploadJSONToLocal(json, pinMetadata);
      }
    } catch (error) {
      logger.error('IPFS JSON upload failed:', error);
      throw new Error(`IPFS JSON upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve content from IPFS by CID
   * @param {string} cid - IPFS Content Identifier
   * @returns {Promise<Buffer>}
   */
  async getFile(cid) {
    try {
      const gatewayUrl = `${this.gateway}/${cid}`;
      const response = await axios.get(gatewayUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      return Buffer.from(response.data);
    } catch (error) {
      logger.error(`Failed to retrieve IPFS content ${cid}:`, error);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  /**
   * Retrieve JSON from IPFS by CID
   * @param {string} cid - IPFS Content Identifier
   * @returns {Promise<Object>}
   */
  async getJSON(cid) {
    try {
      const buffer = await this.getFile(cid);
      return JSON.parse(buffer.toString('utf-8'));
    } catch (error) {
      logger.error(`Failed to retrieve IPFS JSON ${cid}:`, error);
      throw new Error(`IPFS JSON retrieval failed: ${error.message}`);
    }
  }

  /**
   * Verify CID is pinned and accessible
   * @param {string} cid - IPFS Content Identifier
   * @returns {Promise<{pinned: boolean, accessible: boolean}>}
   */
  async verifyPin(cid) {
    try {
      // Check accessibility
      const accessible = await this.checkAccessibility(cid);
      
      // Check pinning status (provider-specific)
      let pinned = false;
      if (this.provider === 'pinata') {
        pinned = await this.checkPinataPin(cid);
      }

      return { pinned, accessible };
    } catch (error) {
      logger.error(`Pin verification failed for ${cid}:`, error);
      return { pinned: false, accessible: false };
    }
  }

  // ==================== PINATA IMPLEMENTATION ====================

  async uploadFileToPinata(buffer, filename, metadata) {
    const formData = new FormData();
    formData.append('file', buffer, filename);

    const pinataMetadata = {
      name: filename,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        ...metadata
      }
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    const response = await axios.post(this.pinEndpoint, formData, {
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: this.apiKey,
        pinata_secret_api_key: this.apiSecret
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    return {
      cid: response.data.IpfsHash,
      size: response.data.PinSize,
      pinned: true,
      timestamp: response.data.Timestamp
    };
  }

  async uploadJSONToPinata(json, pinMetadata) {
    const data = {
      pinataContent: json,
      pinataMetadata: {
        name: pinMetadata.name || 'property-metadata',
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          type: 'metadata',
          ...pinMetadata
        }
      }
    };

    const response = await axios.post(this.pinJsonEndpoint, data, {
      headers: {
        pinata_api_key: this.apiKey,
        pinata_secret_api_key: this.apiSecret,
        'Content-Type': 'application/json'
      }
    });

    return {
      cid: response.data.IpfsHash,
      size: response.data.PinSize,
      pinned: true,
      timestamp: response.data.Timestamp
    };
  }

  async checkPinataPin(cid) {
    try {
      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?hashContains=${cid}`,
        {
          headers: {
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.apiSecret
          }
        }
      );
      return response.data.count > 0;
    } catch (error) {
      return false;
    }
  }

  // ==================== INFURA IMPLEMENTATION ====================

  async uploadFileToInfura(buffer, filename, metadata) {
    const formData = new FormData();
    formData.append('file', buffer, filename);

    const auth = Buffer.from(`${this.projectId}:${this.projectSecret}`).toString('base64');
    
    const response = await axios.post(
      'https://ipfs.infura.io:5001/api/v0/add',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Basic ${auth}`
        }
      }
    );

    return {
      cid: response.data.Hash,
      size: response.data.Size,
      pinned: true
    };
  }

  async uploadJSONToInfura(json, metadata) {
    const buffer = Buffer.from(JSON.stringify(json));
    return await this.uploadFileToInfura(buffer, 'metadata.json', metadata);
  }

  // ==================== LOCAL NODE IMPLEMENTATION ====================

  async uploadFileToLocal(buffer, filename, metadata) {
    const formData = new FormData();
    formData.append('file', buffer, filename);

    const response = await axios.post(
      `${this.gateway}/api/v0/add`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    return {
      cid: response.data.Hash,
      size: response.data.Size,
      pinned: true
    };
  }

  async uploadJSONToLocal(json, metadata) {
    const buffer = Buffer.from(JSON.stringify(json));
    return await this.uploadFileToLocal(buffer, 'metadata.json', metadata);
  }

  // ==================== UTILITY METHODS ====================

  async checkAccessibility(cid) {
    try {
      const gatewayUrl = `${this.gateway}/${cid}`;
      const response = await axios.head(gatewayUrl, { timeout: 10000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get public gateway URL for a CID
   * @param {string} cid - IPFS Content Identifier
   * @returns {string}
   */
  getGatewayUrl(cid) {
    return `${this.gateway}/${cid}`;
  }

  /**
   * Get provider info
   * @returns {Object}
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      gateway: this.gateway,
      configured: this.isConfigured()
    };
  }

  isConfigured() {
    switch (this.provider) {
      case 'pinata':
        return !!(this.apiKey && this.apiSecret);
      case 'infura':
        return !!(this.projectId && this.projectSecret);
      case 'local':
        return !!this.gateway;
      default:
        return false;
    }
  }
}

// Singleton instance
let ipfsClient = null;

function getIPFSClient() {
  if (!ipfsClient) {
    ipfsClient = new IPFSClient();
  }
  return ipfsClient;
}

module.exports = {
  IPFSClient,
  getIPFSClient
};