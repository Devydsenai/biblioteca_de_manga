const config = require('../config');

const validation = {
    // Validação de usuário
    validateUser: (req, res, next) => {
        const { nome, email, senha } = req.body;
        const errors = [];

        // Validação de nome
        if (!nome || nome.length < 3) {
            errors.push('Nome deve ter pelo menos 3 caracteres');
        }

        // Validação de email
        if (!email || !config.VALIDATION.EMAIL_REGEX.test(email)) {
            errors.push('Email inválido');
        }

        // Validação de senha
        if (!senha || !config.VALIDATION.PASSWORD_REGEX.test(senha)) {
            errors.push('Senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais');
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        next();
    },

    // Validação de mangá
    validateManga: (req, res, next) => {
        const { titulo, autor, generos, sinopse } = req.body;
        const errors = [];

        if (!titulo || titulo.length < 3) {
            errors.push('Título deve ter pelo menos 3 caracteres');
        }

        if (!autor || autor.length < 3) {
            errors.push('Autor deve ter pelo menos 3 caracteres');
        }

        if (!generos || !Array.isArray(generos) || generos.length === 0) {
            errors.push('Gêneros são obrigatórios');
        }

        if (!sinopse || sinopse.length < 10) {
            errors.push('Sinopse deve ter pelo menos 10 caracteres');
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        next();
    },

    // Validação de progresso de leitura
    validateReadingProgress: (req, res, next) => {
        const { capitulo } = req.body;
        const errors = [];

        if (!capitulo || isNaN(capitulo) || capitulo < 0) {
            errors.push('Capítulo inválido');
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        next();
    }
};

module.exports = validation; 