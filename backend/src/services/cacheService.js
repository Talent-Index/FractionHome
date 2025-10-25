const logger = require('../config/logger');

/**
 * Simple in-memory cache with TTL support
 * For production, consider Redis or Memcached
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set a cache entry with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  set(key, value, ttl) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store the value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);

    logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
  }

  /**
   * Get a cache entry
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.debug(`Cache miss: ${key}`);
      return null;
    }

    // Check if expired (double-check in case timer didn't fire)
    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > entry.ttl) {
      this.delete(key);
      logger.debug(`Cache expired: ${key}`);
      return null;
    }

    logger.debug(`Cache hit: ${key}`);
    return entry.value;
  }

  /**
   * Delete a cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Invalidate cache entries by prefix
   * @param {string} prefix - Key prefix to match
   */
  invalidateByPrefix(prefix) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
        count++;
      }
    }
    logger.info(`Cache invalidated: ${count} entries with prefix "${prefix}"`);
    return count;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Build a cache key
   * @param {string} prefix - Key prefix
   * @param {...string} parts - Key parts
   */
  static buildKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;