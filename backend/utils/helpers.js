const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

// Função para otimizar imagem
const optimizeImage = async (filePath, options = {}) => {
    const {
        width = 800,
        quality = 80,
        format = 'jpeg'
    } = options;

    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        // Redimensiona se necessário
        if (metadata.width > width) {
            image.resize(width, null, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // Otimiza qualidade
        image[format]({ quality });

        // Gera novo nome de arquivo
        const ext = path.extname(filePath);
        const newPath = filePath.replace(ext, `-optimized.${format}`);

        // Salva imagem otimizada
        await image.toFile(newPath);

        // Remove arquivo original
        await fs.unlink(filePath);

        return newPath;
    } catch (error) {
        console.error('Erro ao otimizar imagem:', error);
        return filePath;
    }
};

// Função para validar tipo de arquivo
const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.mimetype);
};

// Função para gerar slug
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

// Função para formatar data
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Função para paginar resultados
const paginateResults = (items, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        items: items.slice(startIndex, endIndex),
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit
        }
    };
};

// Função para sanitizar dados
const sanitizeData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            // Remove caracteres especiais e HTML
            sanitized[key] = value
                .replace(/[<>]/g, '')
                .trim();
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => sanitizeData(item));
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeData(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

module.exports = {
    optimizeImage,
    validateFileType,
    generateSlug,
    formatDate,
    paginateResults,
    sanitizeData
}; 