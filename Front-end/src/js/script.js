// Função para verificar se o usuário está logado
function checkUserLoggedIn() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const avatarBtn = document.getElementById('avatarBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        // Usuário está logado
        if (userName) {
            userName.textContent = user.name;
            userName.style.display = 'inline';
        }
        
        if (userAvatar) {
            userAvatar.src = user.avatar || '../img/default-avatar.png';
            userAvatar.style.display = 'inline';
        }
        
        if (avatarBtn) {
            avatarBtn.setAttribute('data-bs-toggle', '');
        }
        
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-flex';
            logoutBtn.style.visibility = 'visible';
            logoutBtn.style.opacity = '1';
        }
    } else {
        // Usuário não está logado
        if (userName) userName.style.display = 'none';
        if (userAvatar) userAvatar.style.display = 'none';
        if (avatarBtn) avatarBtn.setAttribute('data-bs-toggle', 'modal');
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
            logoutBtn.style.visibility = 'hidden';
            logoutBtn.style.opacity = '0';
        }
    }
}

// Função para fazer login
function login(email, password) {
    const user = {
        name: email.split('@')[0],
        email: email,
        avatar: '../img/default-avatar.png'
    };
    localStorage.setItem('user', JSON.stringify(user));
    checkUserLoggedIn();
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('user');
    alert('Logout realizado com sucesso!');
    window.location.reload();
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar estado do login
    checkUserLoggedIn();

    // Adicionar evento de submit ao formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            login(email, password);
            
            // Fechar o modal de login
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) {
                loginModal.hide();
            }
        });
    }

    // Adicionar evento de clique ao botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja sair?')) {
                logout();
            }
        });
    }
}); 