require('dotenv').config();
const config = require('./config');

console.log('=== Testando Configurações do Sistema ===\n');

// Teste das configurações do servidor
console.log('Configurações do Servidor:');
console.log('PORT:', config.PORT);
console.log('NODE_ENV:', config.NODE_ENV);
console.log('-------------------\n');

// Teste das configurações de segurança
console.log('Configurações de Segurança:');
console.log('JWT_SECRET está definido:', !!config.JWT_SECRET);
console.log('JWT_EXPIRATION:', config.JWT_EXPIRATION);
console.log('-------------------\n');

// Teste das configurações de CORS
console.log('Configurações de CORS:');
console.log('CORS_ORIGIN:', config.CORS_OPTIONS.origin);
console.log('-------------------\n');

// Teste das configurações de upload
console.log('Configurações de Upload:');
console.log('MAX_FILE_SIZE:', config.UPLOAD.MAX_FILE_SIZE, 'bytes');
console.log('UPLOAD_DIR:', config.UPLOAD.UPLOAD_DIR);
console.log('ALLOWED_TYPES:', config.UPLOAD.ALLOWED_TYPES);
console.log('-------------------\n');

// Teste das configurações de validação
console.log('Configurações de Validação:');
console.log('PASSWORD_MIN_LENGTH:', config.VALIDATION.PASSWORD_MIN_LENGTH);
console.log('MAX_LOGIN_ATTEMPTS:', config.VALIDATION.MAX_LOGIN_ATTEMPTS);
console.log('LOGIN_TIMEOUT:', config.VALIDATION.LOGIN_TIMEOUT, 'ms');
console.log('-------------------\n');

// Teste das configurações de cache
console.log('Configurações de Cache:');
console.log('CACHE_ENABLED:', config.CACHE.ENABLED);
console.log('CACHE_TTL:', config.CACHE.TTL, 'segundos');
console.log('CACHE_MAX_ITEMS:', config.CACHE.MAX_ITEMS);
console.log('-------------------\n');

// Teste de validação de senha
const testPassword = 'Teste@123';
console.log('Teste de Validação de Senha:');
console.log('Senha de teste:', testPassword);
console.log('Senha válida:', config.VALIDATION.PASSWORD_REGEX.test(testPassword));
console.log('-------------------\n');

// Teste de validação de email
const testEmail = 'teste@exemplo.com';
console.log('Teste de Validação de Email:');
console.log('Email de teste:', testEmail);
console.log('Email válido:', config.VALIDATION.EMAIL_REGEX.test(testEmail));
console.log('-------------------\n'); 