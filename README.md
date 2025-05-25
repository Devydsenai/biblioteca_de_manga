# Biblioteca de Manga

Este projeto é uma aplicação backend para uma biblioteca de mangá, desenvolvida com Node.js e Express.

## Estrutura do Projeto

- **backend/**: Contém o código do servidor.
  - **server.js**: Ponto de entrada do servidor. Configura o Express, middleware (cors, jsonwebtoken, bcryptjs, multer) e define as rotas da API.
  - **package.json**: Arquivo de configuração do projeto, listando as dependências e scripts.
  - **node_modules/**: Diretório gerado pelo npm, contendo as dependências instaladas.

## Frontend

O frontend do projeto foi criado utilizando HTML, CSS e JavaScript. Abaixo estão os detalhes de cada arquivo:

### HTML

- **index.html**: Página principal da aplicação. Contém a estrutura básica da página, incluindo a barra de navegação, formulários de login e registro, e a seção de listagem de mangás.

### CSS

- **styles.css**: Arquivo de estilos que define a aparência da aplicação. Inclui estilos para a barra de navegação, formulários, botões e a listagem de mangás.

### JavaScript

- **script.js**: Arquivo JavaScript que gerencia a interatividade da aplicação. Inclui funções para autenticação de usuários, manipulação de formulários e requisições à API do backend.

## Dependências

O projeto utiliza as seguintes dependências:

- **express**: Framework web para Node.js.
- **cors**: Middleware para habilitar CORS (Cross-Origin Resource Sharing).
- **bcryptjs**: Biblioteca para criptografia de senhas.
- **jsonwebtoken**: Utilizado para autenticação via JWT (JSON Web Tokens).
- **multer**: Middleware para manipulação de uploads de arquivos.

## Comandos para Executar o Servidor

1. Navegue até o diretório do backend:

   ```bash
   cd backend
   ```

2. Instale as dependências (caso ainda não tenha feito):

   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```

O servidor será iniciado e estará disponível em http://localhost:3001.

## Observações

- Certifique-se de que todas as dependências estejam instaladas antes de iniciar o servidor.
- Para mais detalhes sobre a implementação, consulte os comentários no código de `server.js`.
