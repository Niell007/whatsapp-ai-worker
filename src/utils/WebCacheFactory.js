export class WebCacheFactory {
	constructor(env) {
	  this.env = env;
	  this.caches = new Map();
	  this.defaultTTL = 3600; // 1 hour
	}

	async createCache(name, options = {}) {
	  const cache = {
	    ttl: options.ttl || this.defaultTTL,
	    storage: new Map(),
	    created: Date.now()
	  };

	  this.caches.set(name, cache);
	  await this.#persistCache(name, cache);
	  return this.#createCacheInterface(name);
	}

	async getCache(name) {
	  if (!this.caches.has(name)) {
	    const persisted = await this.#loadPersistedCache(name);
	    if (persisted) {
	      this.caches.set(name, persisted);
	    } else {
	      return null;
	    }
	  }
	  return this.#createCacheInterface(name);
	}

	async #persistCache(name, cache) {
	  try {
	    await this.env.WHATSAPP_MEDIA.put(
	      `cache:${name}`,
	      JSON.stringify({
	        ttl: cache.ttl,
	        created: cache.created,
	        data: Array.from(cache.storage.entries())
	      })
	    );
	  } catch (error) {
	    console.error('Cache persistence failed:', error);
	  }
	}

	async #loadPersistedCache(name) {
	  try {
	    const data = await this.env.WHATSAPP_MEDIA.get(`cache:${name}`);
	    if (!data) return null;

	    const parsed = JSON.parse(data);
	    return {
	      ttl: parsed.ttl,
	      created: parsed.created,
	      storage: new Map(parsed.data)
	    };
	  } catch (error) {
	    console.error('Cache loading failed:', error);
	    return null;
	  }
	}

	#createCacheInterface(name) {
	  const cache = this.caches.get(name);
	  const factory = this; // Store reference to access persistCache

	  return {
	    async get(key) {
	      return cache.storage.get(key);
	    },
	    async set(key, value) {
	      cache.storage.set(key, value);
	      await factory.#persistCache(name, cache);
	    },
	    async delete(key) {
	      cache.storage.delete(key);
	      await factory.#persistCache(name, cache);
	    },
	    async clear() {
	      cache.storage.clear();
	      await factory.#persistCache(name, cache);
	    }
	  };
	}
}

module.exports = { WebCacheFactory };
