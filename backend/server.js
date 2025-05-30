const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const app = express();

// Configurações do Express para melhor gerenciamento de conexões
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 horas
}));

// Configuração de compressão para melhorar performance
const compression = require('compression');
app.use(compression());

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'Front-end', 'src', 'img');
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
        fileSize: 5 * 1024 * 1024 // limite de 5MB
    },
    fileFilter: function (req, file, cb) {
        // Aceitar apenas imagens
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Apenas imagens são permitidas!'), false);
        }
        cb(null, true);
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configuração para servir arquivos estáticos
const staticOptions = {
    setHeaders: (res, path, stat) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cache-Control', 'public, max-age=31536000');
        res.set('Connection', 'keep-alive');
    }
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use('/img', express.static(path.join(__dirname, '..', 'Front-end', 'src', 'img'), staticOptions));

// Chave secreta para JWT
const JWT_SECRET = 'sua_chave_secreta_muito_segura';

// Função para ler o arquivo tasks.json
const readTasksFile = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'tasks.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler o arquivo tasks.json:', error);
        return { mangasEmLeitura: [], mangasLidos: [], historicoLeitura: [] };
    }
};

// Função para salvar no arquivo tasks.json
const saveTasksFile = (data) => {
    try {
        fs.writeFileSync(path.join(__dirname, 'tasks.json'), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar no arquivo tasks.json:', error);
        return false;
    }
};

// Função para ler o arquivo users.json
const readUsersFile = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler o arquivo users.json:', error);
        return { users: [] };
    }
};

// Função para salvar no arquivo users.json
const saveUsersFile = (data) => {
    try {
        fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar no arquivo users.json:', error);
        return false;
    }
};

// Função para ler o arquivo mangas.json
const readMangasFile = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'mangas.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler o arquivo mangas.json:', error);
        return { mangas: [] };
    }
};

// Função para salvar no arquivo mangas.json
const saveMangasFile = (data) => {
    try {
        fs.writeFileSync(path.join(__dirname, 'mangas.json'), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar no arquivo mangas.json:', error);
        return false;
    }
};

// Função para ler o arquivo manga-status.json
const readMangaStatusFile = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'manga-status.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler o arquivo manga-status.json:', error);
        return { mangas: [] };
    }
};

// Função para salvar no arquivo manga-status.json
const saveMangaStatusFile = (data) => {
    try {
        fs.writeFileSync(path.join(__dirname, 'manga-status.json'), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar no arquivo manga-status.json:', error);
        return false;
    }
};

// Middleware para verificar autenticação
const checkAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            error: true,
            message: 'Acesso negado. Por favor, faça login para continuar.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            message: 'Token inválido ou expirado. Por favor, faça login novamente.'
        });
    }
};

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API da Biblioteca de Mangás!' });
});

// Rota para adicionar um mangá à lista de leitura
app.post('/api/leitura/adicionar', (req, res) => {
    const data = readTasksFile();
    const novoManga = {
        ...req.body,
        dataInicio: new Date().toISOString(),
        ultimoCapitulo: 0
    };
    
    data.mangasEmLeitura.push(novoManga);
    
    if (saveTasksFile(data)) {
        res.status(201).json({ message: 'Mangá adicionado à lista de leitura', manga: novoManga });
    } else {
        res.status(500).json({ message: 'Erro ao adicionar mangá' });
    }
});

// Rota para remover um mangá da lista de leitura
app.delete('/api/leitura/remover/:id', (req, res) => {
    const data = readTasksFile();
    const mangaIndex = data.mangasEmLeitura.findIndex(m => m.id === parseInt(req.params.id));
    
    if (mangaIndex === -1) {
        return res.status(404).json({ message: 'Mangá não encontrado na lista de leitura' });
    }
    
    const mangaRemovido = data.mangasEmLeitura.splice(mangaIndex, 1)[0];
    
    if (saveTasksFile(data)) {
        res.json({ message: 'Mangá removido da lista de leitura', manga: mangaRemovido });
    } else {
        res.status(500).json({ message: 'Erro ao remover mangá' });
    }
});

// Rota para marcar um mangá como lido
app.post('/api/leitura/concluir/:id', (req, res) => {
    const data = readTasksFile();
    const mangaIndex = data.mangasEmLeitura.findIndex(m => m.id === parseInt(req.params.id));
    
    if (mangaIndex === -1) {
        return res.status(404).json({ message: 'Mangá não encontrado na lista de leitura' });
    }
    
    const mangaConcluido = {
        ...data.mangasEmLeitura[mangaIndex],
        dataConclusao: new Date().toISOString()
    };
    
    // Remove da lista de leitura e adiciona à lista de lidos
    data.mangasEmLeitura.splice(mangaIndex, 1);
    data.mangasLidos.push(mangaConcluido);
    
    // Adiciona ao histórico
    data.historicoLeitura.push({
        ...mangaConcluido,
        dataRegistro: new Date().toISOString()
    });
    
    if (saveTasksFile(data)) {
        res.json({ message: 'Mangá marcado como lido', manga: mangaConcluido });
    } else {
        res.status(500).json({ message: 'Erro ao atualizar status do mangá' });
    }
});

// Rota para atualizar o progresso de leitura
app.put('/api/leitura/progresso/:id', (req, res) => {
    const data = readTasksFile();
    const manga = data.mangasEmLeitura.find(m => m.id === parseInt(req.params.id));
    
    if (!manga) {
        return res.status(404).json({ message: 'Mangá não encontrado na lista de leitura' });
    }
    
    manga.ultimoCapitulo = req.body.capitulo;
    manga.ultimaAtualizacao = new Date().toISOString();
    
    if (saveTasksFile(data)) {
        res.json({ message: 'Progresso atualizado', manga });
    } else {
        res.status(500).json({ message: 'Erro ao atualizar progresso' });
    }
});

// Rota para obter mangás em leitura
app.get('/api/leitura/em-leitura', (req, res) => {
    const data = readTasksFile();
    res.json(data.mangasEmLeitura);
});

// Rota para obter mangás lidos
app.get('/api/leitura/lidos', (req, res) => {
    const data = readTasksFile();
    res.json(data.mangasLidos);
});

// Rota para obter histórico de leitura
app.get('/api/leitura/historico', (req, res) => {
    const data = readTasksFile();
    res.json(data.historicoLeitura);
});

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
    const { nome, email, senha, avatar } = req.body;
    const data = readUsersFile();

    // Verifica se o email já está cadastrado
    if (data.users.some(user => user.email === email)) {
        return res.status(400).json({ message: 'Email já cadastrado' });
    }

    try {
        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Cria novo usuário
        const newUser = {
            id: Date.now(),
            nome,
            email,
            senha: hashedPassword,
            avatar: avatar || '/uploads/avatars/default-avatar.png',
            dataCadastro: new Date().toISOString()
        };

        // Adiciona à lista de usuários
        data.users.push(newUser);

        if (saveUsersFile(data)) {
            // Gera token JWT
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email },
                JWT_SECRET,
                { expiresIn: '24h' }
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
        } else {
            res.status(500).json({ message: 'Erro ao salvar usuário' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar registro' });
    }
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;
    const data = readUsersFile();

    // Busca usuário pelo email
    const user = data.users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    try {
        // Verifica a senha
        const validPassword = await bcrypt.compare(senha, user.senha);

        if (!validPassword) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Gera token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
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

// Rota para obter dados do usuário (protegida)
app.get('/api/auth/user', checkAuth, (req, res) => {
    const data = readUsersFile();
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
    const data = readUsersFile();
    const userIndex = data.users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    try {
        // Atualiza nome se fornecido
        if (nome) {
            data.users[userIndex].nome = nome;
        }

        // Atualiza senha se fornecida
        if (senha) {
            data.users[userIndex].senha = await bcrypt.hash(senha, 10);
        }

        if (saveUsersFile(data)) {
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

// Rota de pesquisa de mangás
app.get('/api/mangas/search', (req, res) => {
    const { query } = req.query;
    const data = readMangasFile();
    
    if (!query) {
        return res.json(data.mangas);
    }

    const searchResults = data.mangas.filter(manga => {
        const searchTerm = query.toLowerCase();
        return (
            manga.titulo.toLowerCase().includes(searchTerm) ||
            manga.autor.toLowerCase().includes(searchTerm) ||
            manga.generos.some(genero => genero.toLowerCase().includes(searchTerm)) ||
            manga.sinopse.toLowerCase().includes(searchTerm)
            
        );
    });

    res.json(searchResults);
});

// Rota para obter status do mangá
app.get('/api/manga/:id/status', (req, res) => {
    const data = readMangaStatusFile();
    const manga = data.mangas.find(m => m.id === parseInt(req.params.id));
    
    if (!manga) {
        return res.status(404).json({ message: 'Mangá não encontrado' });
    }
    
    res.json(manga);
});

// Rota para marcar mangá como em uso
app.post('/api/manga/:id/use', checkAuth, (req, res) => {
    const mangaId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const statusData = readMangaStatusFile();
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
    
    saveMangaStatusFile(statusData);
    res.json({ message: 'Mangá marcado como em uso com sucesso' });
});

// Rota para marcar mangá como disponível
app.post('/api/manga/:id/available', checkAuth, (req, res) => {
    const mangaId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const statusData = readMangaStatusFile();
    const mangaStatus = statusData.mangas.find(m => m.id === mangaId);
    
    if (!mangaStatus) {
        return res.status(404).json({ message: 'Mangá não encontrado' });
    }
    
    if (mangaStatus.status === 'disponivel') {
        return res.status(400).json({ message: 'Este mangá já está disponível' });
    }
    
    if (mangaStatus.usuarioAtual !== userId) {
        return res.status(403).json({ message: 'Você não tem permissão para marcar este mangá como disponível' });
    }
    
    mangaStatus.status = 'disponivel';
    mangaStatus.usuarioAtual = null;
    mangaStatus.ultimaAtualizacao = new Date().toISOString();
    
    // Atualizar o histórico de uso
    const usoAtual = mangaStatus.historicoUso.find(h => h.dataFim === null);
    if (usoAtual) {
        usoAtual.dataFim = new Date().toISOString();
    }
    
    saveMangaStatusFile(statusData);
    res.json({ message: 'Mangá marcado como disponível com sucesso' });
});

// Rota para obter detalhes de um mangá específico
app.get('/api/mangas/:id', (req, res) => {
    const data = readMangasFile();
    const manga = data.mangas.find(m => m.id === parseInt(req.params.id));
    
    
    if (!manga) {
        return res.status(404).json({ message: 'Mangá não encontrado' });
    }
    
    res.json(manga);
});

// Rota para devolver mangá
app.post('/api/manga/:id/return', checkAuth, (req, res) => {
    const mangaId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const statusData = readMangaStatusFile();
    const mangaStatus = statusData.mangas.find(m => m.id === mangaId);
    
    if (!mangaStatus) {
        return res.status(404).json({ message: 'Mangá não encontrado' });
    }
    
    if (mangaStatus.status === 'disponivel') {
        return res.status(400).json({ message: 'Este mangá já está disponível' });
    }
    
    if (mangaStatus.usuarioAtual !== userId) {
        return res.status(403).json({ message: 'Você não tem permissão para devolver este mangá' });
    }
    
    mangaStatus.status = 'disponivel';
    mangaStatus.usuarioAtual = null;
    mangaStatus.ultimaAtualizacao = new Date().toISOString();
    
    // Atualizar o histórico de uso
    const usoAtual = mangaStatus.historicoUso.find(h => h.dataFim === null);
    if (usoAtual) {
        usoAtual.dataFim = new Date().toISOString();
    }
    
    saveMangaStatusFile(statusData);
    res.json({ message: 'Mangá devolvido com sucesso' });
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

// Rota para doar mangá
app.post('/api/mangas/donate', upload.single('imagem'), (req, res) => {
    try {
        const data = readMangasFile();
        const novoManga = {
            id: Date.now(),
            titulo: req.body.titulo,
            autor: req.body.autor,
            status: req.body.status,
            nota: parseFloat(req.body.nota),
            capitulos: parseInt(req.body.capitulos),
            generos: req.body.generos.split(',').map(g => g.trim()),
            sinopse: req.body.sinopse,
            imagem: req.file ? `/img/${req.file.filename}` : '/img/default-manga.png'
        };

        data.mangas.push(novoManga);

        if (saveMangasFile(data)) {
            res.status(201).json({
                message: 'Mangá doado com sucesso',
                manga: novoManga
            });
        } else {
            res.status(500).json({ message: 'Erro ao salvar mangá' });
        }
    } catch (error) {
        console.error('Erro ao processar doação:', error);
        res.status(500).json({ message: 'Erro ao processar doação do mangá' });
    }
});

// Todas as outras rotas requerem autenticação
app.use('/api', checkAuth);

// Configuração do servidor
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
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

