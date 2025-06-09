const config = require('../config');

// Armazena tentativas de login
const loginAttempts = new Map();

// Middleware de rate limiting
const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    // Limpa tentativas antigas
    for (const [key, value] of loginAttempts.entries()) {
        if (now - value.timestamp > config.VALIDATION.LOGIN_TIMEOUT) {
            loginAttempts.delete(key);
        }
    }

    // Verifica tentativas de login
    if (req.path === '/api/auth/login') {
        const attempts = loginAttempts.get(ip) || { count: 0, timestamp: now };

        if (attempts.count >= config.VALIDATION.MAX_LOGIN_ATTEMPTS) {
            const timeLeft = Math.ceil((config.VALIDATION.LOGIN_TIMEOUT - (now - attempts.timestamp)) / 1000);
            return res.status(429).json({
                error: true,
                message: `Muitas tentativas de login. Tente novamente em ${timeLeft} segundos.`
            });
        }

        // Incrementa contador de tentativas
        attempts.count++;
        attempts.timestamp = now;
        loginAttempts.set(ip, attempts);
    }

    next();
};

// Função para resetar tentativas de login
const resetLoginAttempts = (ip) => {
    loginAttempts.delete(ip);
};

module.exports = {
    rateLimiter,
    resetLoginAttempts
}; 