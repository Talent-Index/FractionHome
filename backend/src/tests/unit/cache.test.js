const cacheService = require('../../services/cacheService.js');

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cacheService.set('test-key', { data: 'value' }, 60);
      
      const result = cacheService.get('test-key');
      
      expect(result).toEqual({ data: 'value' });
    });

    it('should return null for non-existent keys', () => {
      const result = cacheService.get('non-existent');
      
      expect(result).toBeNull();
    });

    it('should expire entries after TTL', (done) => {
      cacheService.set('expire-key', 'value', 1); // 1 second TTL
      
      // Should exist immediately
      expect(cacheService.get('expire-key')).toBe('value');
      
      // Should expire after 1.5 seconds
      setTimeout(() => {
        expect(cacheService.get('expire-key')).toBeNull();
        done();
      }, 1500);
    });

    it('should update TTL on re-set', (done) => {
      cacheService.set('update-key', 'value1', 1);
      
      setTimeout(() => {
        cacheService.set('update-key', 'value2', 2); // Reset with new TTL
        
        setTimeout(() => {
          // Should still exist after 1.5s total (but would have expired with original TTL)
          expect(cacheService.get('update-key')).toBe('value2');
          done();
        }, 800);
      }, 700);
    });
  });

  describe('delete', () => {
    it('should delete entries', () => {
      cacheService.set('delete-key', 'value', 60);
      expect(cacheService.get('delete-key')).toBe('value');
      
      cacheService.delete('delete-key');
      
      expect(cacheService.get('delete-key')).toBeNull();
    });

    it('should return false for non-existent keys', () => {
      const result = cacheService.delete('non-existent');
      
      expect(result).toBe(false);
    });
  });

  describe('invalidateByPrefix', () => {
    it('should invalidate all entries with matching prefix', () => {
      cacheService.set('balances:token1', 'data1', 60);
      cacheService.set('balances:token2', 'data2', 60);
      cacheService.set('transfers:token1', 'data3', 60);
      
      const count = cacheService.invalidateByPrefix('balances:');
      
      expect(count).toBe(2);
      expect(cacheService.get('balances:token1')).toBeNull();
      expect(cacheService.get('balances:token2')).toBeNull();
      expect(cacheService.get('transfers:token1')).toBe('data3'); // Should remain
    });

    it('should return 0 if no matches found', () => {
      cacheService.set('test-key', 'value', 60);
      
      const count = cacheService.invalidateByPrefix('nomatch:');
      
      expect(count).toBe(0);
      expect(cacheService.get('test-key')).toBe('value');
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      cacheService.set('key1', 'value1', 60);
      cacheService.set('key2', 'value2', 60);
      cacheService.set('key3', 'value3', 60);
      
      cacheService.clear();
      
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
      expect(cacheService.get('key3')).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cacheService.set('key1', 'value1', 60);
      cacheService.set('key2', 'value2', 60);
      
      const stats = cacheService.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });

  describe('buildKey', () => {
    it('should build cache keys correctly', () => {
      const key = cacheService.constructor.buildKey('balances', '0.0.12345');
      
      expect(key).toBe('balances:0.0.12345');
    });

    it('should handle multiple parts', () => {
      const key = cacheService.constructor.buildKey('transfers', '0.0.12345', '25');
      
      expect(key).toBe('transfers:0.0.12345:25');
    });
  });
});