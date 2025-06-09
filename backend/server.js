// Carrega as variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const compression = require('compression');
const config = require('./config');
const { rateLimiter, resetLoginAttempts } = require('./middlewares/rateLimiter');
const { cacheMiddleware, clearCache } = require('./middlewares/cache');
const validation = require('./middlewares/validation');
const { optimizeImage, validateFileType, generateSlug, formatDate, paginateResults, sanitizeData } = require('./utils/helpers');
const app = express();

// Configurações básicas
app.use(cors());
app.use(express.json());

// Configurações do Express para melhor gerenciamento de conexões
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors(config.CORS_OPTIONS));

// Configuração de compressão para melhorar performance
app.use(compression());
app.use(rateLimiter);

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, config.UPLOAD.UPLOAD_DIR);
        // Criar diretório se não existir
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.UPLOAD.MAX_FILE_SIZE
    },
    fileFilter: function (req, file, cb) {
        if (!validateFileType(file, config.UPLOAD.ALLOWED_TYPES)) {
            return cb(new Error('Tipo de arquivo não permitido!'), false);
        }
        cb(null, true);
    }
});

// Middleware para sanitizar dados
app.use((req, res, next) => {
    if (req.body) {
        req.body = sanitizeData(req.body);
    }
    next();
});

// Middleware
app.use(express.json());

// Configuração para servir arquivos estáticos
const staticOptions = {
    setHeaders: (res, path, stat) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cache-Control', 'public, max-age=31536000');
        res.set('Connection', 'keep-alive');
    }
};

// Servir arquivos estáticos
const imgPath = path.join(__dirname, '..', 'Front-end', 'src', 'img');
console.log('Diretório de imagens:', imgPath);

// Verificar se o diretório existe
if (!fs.existsSync(imgPath)) {
    console.error('Diretório de imagens não encontrado:', imgPath);
} else {
    console.log('Arquivos no diretório de imagens:', fs.readdirSync(imgPath));
}

app.use('/img', express.static(imgPath, staticOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));

// Adicionar rota de teste para imagens
app.get('/test-image', (req, res) => {
    const imagePath = path.join(imgPath, 'DeathNote.png');
    console.log('Testando acesso à imagem:', imagePath);
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ 
            error: 'Imagem não encontrada', 
            path: imagePath,
            exists: fs.existsSync(imgPath),
            files: fs.readdirSync(imgPath)
        });
    }
});

// Middleware para debug de requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Chave secreta para JWT
const JWT_SECRET = 'sua_chave_secreta_muito_segura';

// Funções auxiliares para manipulação de arquivos
const readJsonFile = async (filename) => {
    try {
        const filePath = path.join(__dirname, filename);
        console.log('Tentando ler arquivo:', filePath);
        const data = await fs.promises.readFile(filePath, 'utf8');
        console.log('Arquivo lido com sucesso');
        const parsedData = JSON.parse(data);
        console.log('Dados parseados:', JSON.stringify(parsedData, null, 2));
        return parsedData;
    } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        throw error;
    }
};

const writeJsonFile = async (filename, data) => {
    try {
        await fs.writeFile(
            path.join(__dirname, filename),
            JSON.stringify(data, null, 2)
        );
        return true;
    } catch (error) {
        console.error(`Erro ao salvar arquivo ${filename}:`, error);
        return false;
    }
};

// Middleware de autenticação
const checkAuth = (req, res, next) => {
    // Temporariamente permitindo todas as requisições
    next();
    
    /* Código original comentado
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            error: true,
            message: 'Acesso negado. Por favor, faça login para continuar.'
        });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            message: 'Token inválido ou expirado. Por favor, faça login novamente.'
        });
    }
    */
};

// Rota de teste
app.get('/', (req, res) => {
    console.log('Rota principal acessada');
    res.json({ message: 'Bem-vindo à API da Biblioteca de Mangás!' });
});

// Rotas públicas (não precisam de autenticação)
app.get('/api/mangas/search', async (req, res) => {
    try {
        console.log('Iniciando busca de mangás...');
        const data = await readJsonFile('mangas.json');
        console.log('Dados carregados:', data.mangas.length, 'mangás');
        res.json(data.mangas);
    } catch (error) {
        console.error('Erro ao buscar mangás:', error);
        res.status(500).json({ error: 'Erro ao buscar mangás' });
    }
});

app.get('/api/mangas/:id', async (req, res) => {
    try {
        const mangaId = parseInt(req.params.id);
        console.log('Buscando mangá com ID:', mangaId);
        
        const data = await readJsonFile('mangas.json');
        const manga = data.mangas.find(m => m.id === mangaId);
        
        if (!manga) {
            console.log('Mangá não encontrado');
            return res.status(404).json({ error: 'Mangá não encontrado' });
        }
        
        console.log('Mangá encontrado:', manga.titulo);
        res.json(manga);
    } catch (error) {
        console.error('Erro ao buscar detalhes do mangá:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes do mangá' });
    }
});

// Rotas de autenticação
app.post('/api/auth/register', validation.validateUser, async (req, res) => {
    const { nome, email, senha, avatar } = req.body;
    const data = await readJsonFile('users.json');

    if (data.users.some(user => user.email === email)) {
        return res.status(400).json({ message: 'Email já cadastrado' });
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const newUser = {
            id: Date.now(),
            nome,
            email,
            senha: hashedPassword,
            avatar: avatar || '/uploads/avatars/default-avatar.png',
            dataCadastro: new Date().toISOString()
        };

        data.users.push(newUser);
        await writeJsonFile('users.json', data);

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRATION }
        );

        res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            token,
            user: {
                id: newUser.id,
                nome: newUser.nome,
                email: newUser.email,
                avatar: newUser.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar registro' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;
    const data = await readJsonFile('users.json');
    const user = data.users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    try {
        const validPassword = await bcrypt.compare(senha, user.senha);
        if (!validPassword) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        resetLoginAttempts(req.ip);
        const token = jwt.sign(
            { id: user.id, email: user.email },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRATION }
        );

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar login' });
    }
});

// Rotas de mangá
app.get('/api/mangas', cacheMiddleware(), async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const data = await readJsonFile('mangas.json');
    
    let mangas = data.mangas;
    if (search) {
        const searchTerm = search.toLowerCase();
        mangas = mangas.filter(manga => 
            manga.titulo.toLowerCase().includes(searchTerm) ||
            manga.autor.toLowerCase().includes(searchTerm) ||
            manga.generos.some(genero => genero.toLowerCase().includes(searchTerm))
        );
    }

    const result = paginateResults(mangas, parseInt(page), parseInt(limit));
    res.json(result);
});

app.post('/api/mangas', checkAuth, validation.validateManga, upload.single('capa'), async (req, res) => {
    try {
        const data = await readJsonFile('mangas.json');
        const manga = {
            id: Date.now(),
            ...req.body,
            slug: generateSlug(req.body.titulo),
            capa: req.file ? `/img/${req.file.filename}` : null,
            dataCadastro: new Date().toISOString()
        };

        if (req.file) {
            await optimizeImage(req.file.path);
        }

        data.mangas.push(manga);
        await writeJsonFile('mangas.json', data);
        clearCache('/api/mangas');

        res.status(201).json({
            message: 'Mangá cadastrado com sucesso',
            manga
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar mangá' });
    }
});

// Rotas de leitura
app.get('/api/leitura/em-leitura', checkAuth, cacheMiddleware(), async (req, res) => {
    const data = await readJsonFile('tasks.json');
    const userMangas = data.mangasEmLeitura.filter(m => m.userId === req.user.id);
    res.json(userMangas);
});

app.post('/api/leitura/adicionar', checkAuth, validation.validateReadingProgress, async (req, res) => {
    const data = await readJsonFile('tasks.json');
    const novoManga = {
        ...req.body,
        userId: req.user.id,
        dataInicio: new Date().toISOString(),
        ultimoCapitulo: 0
    };
    
    data.mangasEmLeitura.push(novoManga);
    await writeJsonFile('tasks.json', data);
    clearCache('/api/leitura');

    res.status(201).json({
        message: 'Mangá adicionado à lista de leitura',
        manga: novoManga
    });
});

// Rota para remover um mangá da lista de leitura
app.delete('/api/leitura/remover/:id', async (req, res) => {
    const data = await readJsonFile('tasks.json');
    const mangaIndex = data.mangasEmLeitura.findIndex(m => m.id === parseInt(req.params.id));
    
    if (mangaIndex === -1) {
        return res.status(404).json({ message: 'Mangá não encontrado na lista de leitura' });
    }
    
    const mangaRemovido = data.mangasEmLeitura.splice(mangaIndex, 1)[0];
    
    if (await writeJsonFile('tasks.json', data)) {
        res.json({ message: 'Mangá removido da lista de leitura', manga: mangaRemovido });
    } else {
        res.status(500).json({ message: 'Erro ao remover mangá' });
    }
});

// Rota para marcar um mangá como lido
app.post('/api/leitura/concluir/:id', async (req, res) => {
    const data = await readJsonFile('tasks.json');
    const mangaIndex = data.mangasEmLeitura.findIndex(m => m.id === parseInt(req.params.id));
    
    if (mangaIndex === -1) {
        return res.status(404).json({ message: 'Mangá não encontrado na lista de leitura' });
    }
    
    const mangaConcluido = {
        ...data.mangasEmLeitura[mangaIndex],
        dataConclusao: new Date().toISOString()
    };
    
    data.mangasEmLeitura.splice(mangaIndex, 1);
    data.mangasLidos.push(mangaConcluido);
    data.historicoLeitura.push({
        ...mangaConcluido,
        dataRegistro: new Date().toISOString()
    });
    
    if (await writeJsonFile('tasks.json', data)) {
        res.json({ message: 'Mangá marcado como lido', manga: mangaConcluido });
    } else {
        res.status(500).json({ message: 'Erro ao atualizar status do mangá' });
    }
});

// Rota para atualizar o progresso de leitura
app.put('/api/leitura/progresso/:id', async (req, res) => {
    const data = await readJsonFile('tasks.json');
    const manga = data.mangasEmLeitura.find(m => m.id === parseInt(req.params.id));
    
    if (!manga) {
        return res.status(404).json({ message: 'Mangá não encontrado na lista de leitura' });
    }
    
    manga.ultimoCapitulo = req.body.capitulo;
    manga.ultimaAtualizacao = new Date().toISOString();
    
    if (await writeJsonFile('tasks.json', data)) {
        res.json({ message: 'Progresso atualizado', manga });
    } else {
        res.status(500).json({ message: 'Erro ao atualizar progresso' });
    }
});

// Rota para obter mangás lidos
app.get('/api/leitura/lidos', async (req, res) => {
    const data = await readJsonFile('tasks.json');
    res.json(data.mangasLidos);
});

// Rota para obter histórico de leitura
app.get('/api/leitura/historico', async (req, res) => {
    const data = await readJsonFile('tasks.json');
    res.json(data.historicoLeitura);
});

// Rota para obter dados do usuário (protegida)
app.get('/api/auth/user', checkAuth, async (req, res) => {
    const data = await readJsonFile('users.json');
    const user = data.users.find(u => u.id === req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        dataCadastro: user.dataCadastro
    });
});

// Rota para atualizar dados do usuário (protegida)
app.put('/api/auth/user', checkAuth, async (req, res) => {
    const { nome, senha } = req.body;
    const data = await readJsonFile('users.json');
    const userIndex = data.users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    try {
        if (nome) {
            data.users[userIndex].nome = nome;
        }

        if (senha) {
            data.users[userIndex].senha = await bcrypt.hash(senha, 10);
        }

        if (await writeJsonFile('users.json', data)) {
            res.json({
                message: 'Dados atualizados com sucesso',
                user: {
                    id: data.users[userIndex].id,
                    nome: data.users[userIndex].nome,
                    email: data.users[userIndex].email
                }
            });
        } else {
            res.status(500).json({ message: 'Erro ao atualizar dados' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar atualização' });
    }
});

// Rota para obter status do mangá
app.get('/api/manga/:id/status', async (req, res) => {
    const data = await readJsonFile('manga-status.json');
    const manga = data.mangas.find(m => m.id === parseInt(req.params.id));
    
    if (!manga) {
        return res.status(404).json({ message: 'Mangá não encontrado' });
    }
    
    res.json(manga);
});

// Rota para marcar mangá como em uso
app.post('/api/manga/:id/use', checkAuth, async (req, res) => {
    const mangaId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const statusData = await readJsonFile('manga-status.json');
    const mangaStatus = statusData.mangas.find(m => m.id === mangaId);
    
    if (!mangaStatus) {
        return res.status(404).json({ message: 'Mangá não encontrado' });
    }
    
    if (mangaStatus.status === 'em_uso') {
        return res.status(400).json({ message: 'Este mangá já está em uso por outro usuário' });
    }
    
    mangaStatus.status = 'em_uso';
    mangaStatus.usuarioAtual = userId;
    mangaStatus.ultimaAtualizacao = new Date().toISOString();
    mangaStatus.historicoUso.push({
        usuarioId: userId,
        dataInicio: new Date().toISOString(),
        dataFim: null
    });
    
    await writeJsonFile('manga-status.json', statusData);
    res.json({ message: 'Mangá marcado como em uso com sucesso' });
});

// Rota para marcar mangá como disponível
app.post('/api/manga/:id/return', checkAuth, async (req, res) => {
    const mangaId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const statusData = await readJsonFile('manga-status.json');
    const mangaStatus = statusData.mangas.find(m => m.id === mangaId);
    
    if (!mangaStatus) {
        return res.status(404).json({ message: 'Mangá não encontrado' });
    }
    
    if (mangaStatus.status !== 'em_uso' || mangaStatus.usuarioAtual !== userId) {
        return res.status(400).json({ message: 'Este mangá não está em uso por você' });
    }
    
    mangaStatus.status = 'disponivel';
    mangaStatus.usuarioAtual = null;
    mangaStatus.ultimaAtualizacao = new Date().toISOString();
    
    // Atualiza histórico de uso
    const usoAtual = mangaStatus.historicoUso.find(h => !h.dataFim);
    if (usoAtual) {
        usoAtual.dataFim = new Date().toISOString();
    }
    
    await writeJsonFile('manga-status.json', statusData);
    res.json({ message: 'Mangá marcado como disponível com sucesso' });
});

// Rota para doar um mangá
app.post('/api/mangas/donate', upload.single('imagem'), async (req, res) => {
    try {
        console.log('Recebendo doação de mangá:', req.body);
        const data = await readJsonFile('mangas.json');
        const novoManga = {
            id: Date.now(),
            ...req.body,
            capa: req.file ? `/img/${req.file.filename}` : null,
            dataCadastro: new Date().toISOString()
        };

        if (req.file) {
            await optimizeImage(req.file.path);
        }

        data.mangas.push(novoManga);

        if (await writeJsonFile('mangas.json', data)) {
            res.status(201).json({
                message: 'Mangá doado com sucesso',
                manga: novoManga
            });
        } else {
            res.status(500).json({ message: 'Erro ao salvar mangá' });
        }
    } catch (error) {
        console.error('Erro ao processar doação:', error);
        res.status(500).json({ message: 'Erro ao processar doação' });
    }
});

// Rota para upload de avatar
app.post('/api/upload/avatar', upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        const avatarUrl = `/Front-end/src/img/avatars/${req.file.filename}`;
        res.json({ avatarUrl });
    } catch (error) {
        console.error('Erro ao fazer upload do avatar:', error);
        res.status(500).json({ message: 'Erro ao fazer upload do avatar' });
    }
});

// Rotas que precisam de autenticação
app.use('/api/auth', checkAuth);
app.use('/api/users', checkAuth);

// Iniciar o servidor
const PORT = config.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Teste a API em: http://localhost:${PORT}/api/mangas/search`);
});

// Configurações para melhorar o gerenciamento de conexões
server.timeout = 30000; // 30 segundos de timeout
server.keepAliveTimeout = 30000; // 30 segundos de keep-alive
server.headersTimeout = 30000; // 30 segundos de timeout para headers

// Tratamento de erros do servidor
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} já está em uso. Tentando usar outra porta...`);
        server.close();
        // Tenta usar outra porta
        const newPort = PORT + 1;
        server.listen(newPort, () => {
            console.log(`Servidor rodando em http://localhost:${newPort}`);
        });
    } else {
        console.error('Erro no servidor:', error);
    }
});

// Tratamento de encerramento gracioso
process.on('SIGTERM', () => {
    console.log('Recebido sinal SIGTERM. Encerrando servidor...');
    server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Recebido sinal SIGINT. Encerrando servidor...');
    server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
    });
});

