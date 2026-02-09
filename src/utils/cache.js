import NodeCache from 'node-cache';
import { logger } from './logger.js';

/**
 * Cache Manager for storing processed video results
 * Uses in-memory caching with TTL
 */
class CacheManagerClass {
    constructor() {
        // TTL = 1 hour (3600 seconds)
        this.cache = new NodeCache({
            stdTTL: parseInt(process.env.CACHE_TTL) || 3600,
            checkperiod: 600, // Check for expired keys every 10 minutes
            useClones: false
        });

        logger.info('Cache Manager initialized');
    }

    /**
     * Get cached result
     * @param {string} key - Cache key (video ID)
     * @returns {Object|null} - Cached data or null
     */
    get(key) {
        try {
            const data = this.cache.get(key);
            if (data) {
                logger.info(`Cache hit: ${key}`);
                return data;
            }
            logger.info(`Cache miss: ${key}`);
            return null;
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set cache entry
     * @param {string} key - Cache key (video ID)
     * @param {Object} value - Data to cache
     * @returns {boolean} - Success status
     */
    set(key, value) {
        try {
            const success = this.cache.set(key, value);
            if (success) {
                logger.info(`Cache set: ${key}`);
            }
            return success;
        } catch (error) {
            logger.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Delete cache entry
     * @param {string} key - Cache key
     * @returns {number} - Number of deleted entries
     */
    delete(key) {
        try {
            return this.cache.del(key);
        } catch (error) {
            logger.error('Cache delete error:', error);
            return 0;
        }
    }

    /**
     * Clear all cache
     */
    clear() {
        try {
            this.cache.flushAll();
            logger.info('Cache cleared');
        } catch (error) {
            logger.error('Cache clear error:', error);
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache stats
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * Get all cache keys
     * @returns {Array<string>} - Array of keys
     */
    getKeys() {
        return this.cache.keys();
    }
}

export const CacheManager = new CacheManagerClass();
