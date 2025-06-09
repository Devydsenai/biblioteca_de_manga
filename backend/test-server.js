const express = require('express');
const cors = require('cors');
const app = express();

// Configuração básica
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/test', (req, res) => {
    console.log('Rota de teste acessada');
    res.json({ message: 'Servidor de teste funcionando!' });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de teste rodando na porta ${PORT}`);
    console.log(`Teste em: http://localhost:${PORT}/test`);
}); 