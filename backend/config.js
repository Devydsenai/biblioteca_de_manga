require('dotenv').config();

module.exports = {
    // Configurações do servidor
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Configurações de segurança
    JWT_SECRET: process.env.JWT_SECRET || 'biblioteca_manga_secret_key_2024',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
    
    // Configurações de CORS
    CORS_OPTIONS: {
        origin: '*', // Permitir acesso de qualquer origem em desenvolvimento
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400
    },
    
    // Configurações de upload
    UPLOAD: {
        MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
        UPLOAD_DIR: process.env.UPLOAD_DIR || '../Front-end/src/img'
    },
    
    // Configurações de validação
    VALIDATION: {
        PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
        PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
        LOGIN_TIMEOUT: parseInt(process.env.LOGIN_TIMEOUT) || 15 * 60 * 1000 // 15 minutos
    },
    
    // Configurações de cache
    CACHE: {
        ENABLED: process.env.CACHE_ENABLED === 'true',
        TTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hora
        MAX_ITEMS: parseInt(process.env.CACHE_MAX_ITEMS) || 1000
    }
}; 