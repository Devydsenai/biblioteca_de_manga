const config = require('../config');

// Cache simples em memória
const cache = new Map();

// Função para gerar chave de cache
const generateCacheKey = (req) => {
    return `${req.originalUrl || req.url}-${JSON.stringify(req.query)}`;
};

// Middleware de cache
const cacheMiddleware = (duration = config.CACHE.TTL) => {
    return (req, res, next) => {
        if (!config.CACHE.ENABLED) {
            return next();
        }

        const key = generateCacheKey(req);

        // Verifica se existe no cache
        if (cache.has(key)) {
            const cachedData = cache.get(key);
            if (Date.now() - cachedData.timestamp < duration * 1000) {
                return res.json(cachedData.data);
            }
            cache.delete(key);
        }

        // Sobrescreve o método json para interceptar a resposta
        const originalJson = res.json;
        res.json = function(data) {
            // Armazena no cache
            cache.set(key, {
                data,
                timestamp: Date.now()
            });

            // Limpa cache antigo se exceder o limite
            if (cache.size > config.CACHE.MAX_ITEMS) {
                const oldestKey = cache.keys().next().value;
                cache.delete(oldestKey);
            }

            return originalJson.call(this, data);
        };

        next();
    };
};

// Função para limpar cache específico
const clearCache = (pattern) => {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};

module.exports = {
    cacheMiddleware,
    clearCache
}; 