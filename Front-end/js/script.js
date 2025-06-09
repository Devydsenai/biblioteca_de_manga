/**
 * Manga Livre - Main JavaScript File
 * @author Your Name
 * @version 1.0.0
 * @description Main JavaScript functionality for the Manga Livre website
 */

// IIFE (Immediately Invoked Function Expression) to avoid global scope pollution
(function() {
    'use strict';

    // Configuration object
    const CONFIG = {
        searchDelay: 300, // Delay for search input in milliseconds
        animationDuration: 300, // Duration for animations in milliseconds
        apiEndpoints: {
            search: 'http://localhost:3000/api/mangas/search',
            manga: 'http://localhost:3000/api/mangas',
            user: 'http://localhost:3000/api/users'
        }
    };

    // DOM Elements
    const elements = {
        navbar: document.querySelector('.navbar'),
        searchInput: document.querySelector('.search-input'),
        searchButton: document.querySelector('.search-button'),
        searchForm: document.getElementById('search-form'),
        searchContainer: document.querySelector('.search-container'),
        searchResults: document.getElementById('search-results'),
        loginBtn: document.querySelector('.login-btn'),
        registerBtn: document.querySelector('.register-btn'),
        cards: document.querySelectorAll('.card'),
        viewAllLinks: document.querySelectorAll('.view-all')
    };

    // Adicionar cache de imagens
    const imageCache = new Map();

    // Função para carregar imagem com cache
    async function loadImageWithCache(url) {
        if (!url) return null;
        
        // Verificar se a URL é válida
        try {
            new URL(url);
        } catch {
            console.warn(`URL inválida: ${url}`);
            return null;
        }

        if (imageCache.has(url)) {
            return imageCache.get(url);
        }

        try {
            // Substituir porta 3001 por 3000 se necessário
            const correctedUrl = url.replace('localhost:3001', 'localhost:3000');
            console.log('Carregando imagem:', correctedUrl);
            
            const response = await fetch(correctedUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'image/*'
                }
            });
            
            if (!response.ok) {
                console.warn(`Imagem não encontrada: ${correctedUrl}`);
                return null;
            }
            
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            imageCache.set(url, objectUrl);
            return objectUrl;
        } catch (error) {
            console.warn(`Erro ao carregar imagem ${url}:`, error);
            return null;
        }
    }

    /**
     * Handles the search functionality
     * @param {Event} event - The input event
     */
    const handleSearch = (event) => {
        event.preventDefault(); // Prevenir o comportamento padrão do formulário
        const searchTerm = elements.searchInput.value.trim();
        if (searchTerm.length >= 3) {
            searchManga(searchTerm);
        }
    };

    /**
     * Handles card hover effects
     * @param {HTMLElement} card - The card element
     */
    const handleCardHover = (card) => {
        if (!card) return;
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            card.style.boxShadow = '0 8px 24px rgba(24, 249, 196, 0.2)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    };

    /**
     * Handles navbar scroll effect
     */
    const handleNavbarScroll = () => {
        if (!elements.navbar) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                elements.navbar.style.background = 'rgba(16, 16, 26, 0.95)';
                elements.navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            } else {
                elements.navbar.style.background = '#10101a';
                elements.navbar.style.boxShadow = 'none';
            }
        });
    };

    /**
     * Handles user authentication
     * @param {string} type - The type of authentication ('login' or 'register')
     */
    const handleAuth = (type) => {
        const authBtn = type === 'login' ? elements.loginBtn : elements.registerBtn;
        if (!authBtn) return;
        
        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`${type} clicked`);
        });
    };

    /**
     * Handles "View All" links
     * @param {HTMLElement} link - The link element
     */
    const handleViewAll = (link) => {
        if (!link) return;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.closest('.section')?.querySelector('h2')?.textContent;
            console.log(`View all clicked for: ${section}`);
        });
    };

    /**
     * Initializes all event listeners
     */
    const initializeEventListeners = () => {
        // Search functionality with debounce
        if (elements.searchForm) {
            elements.searchForm.addEventListener('submit', handleSearch);
        }

        if (elements.searchInput) {
            let searchTimeout;
            elements.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const searchTerm = e.target.value.trim();
                    if (searchTerm.length >= 3) {
                        searchManga(searchTerm);
                    }
                }, CONFIG.searchDelay);
            });

            // Manter a barra de pesquisa aberta ao clicar
            elements.searchInput.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Fechar resultados da pesquisa ao clicar fora
        document.addEventListener('click', (e) => {
            if (elements.searchResults && !elements.searchContainer.contains(e.target)) {
                elements.searchResults.classList.remove('active');
            }
        });

        // Card hover effects
        elements.cards.forEach(handleCardHover);

        // Navbar scroll effect
        handleNavbarScroll();

        // Authentication
        handleAuth('login');
        handleAuth('register');

        // View all links
        elements.viewAllLinks.forEach(handleViewAll);
    };

    /**
     * Utility function to check if an element is in viewport
     * @param {HTMLElement} element - The element to check
     * @returns {boolean} - Whether the element is in viewport
     */
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    /**
     * Handles lazy loading of images
     */
    const handleLazyLoading = () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    };

    /**
     * Main initialization function
     */
    const init = () => {
        try {
            initializeEventListeners();
            handleLazyLoading();
            console.log('Manga Livre initialized successfully');
        } catch (error) {
            console.error('Error initializing Manga Livre:', error);
        }
    };

    // Initialize when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Gerenciamento de Autenticação
    const auth = {
        init() {
            this.loginForm = document.getElementById('loginForm');
            this.registerForm = document.getElementById('registerForm');
            this.avatarInput = document.getElementById('registerAvatar');
            this.avatarPreview = document.getElementById('avatarPreview');
            this.userNameDisplay = document.getElementById('userNameDisplay');
            this.avatarBtn = document.getElementById('avatarBtn');
            this.setupEventListeners();
            this.checkAuthStatus();
        },

        setupEventListeners() {
            // Login Form
            if (this.loginForm) {
                this.loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }

            // Register Form
            if (this.registerForm) {
                this.registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }

            // Avatar Upload Preview
            if (this.avatarInput) {
                this.avatarInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            this.avatarPreview.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Avatar Button Click
            if (this.avatarBtn) {
                this.avatarBtn.addEventListener('click', () => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                        loginModal.show();
                    }
                });
            }

            // Configurar os modais
            this.setupModals();
        },

        setupModals() {
            const loginModal = document.getElementById('loginModal');
            const registerModal = document.getElementById('registerModal');

            if (loginModal) {
                loginModal.addEventListener('hidden.bs.modal', () => {
                    // Limpar o formulário de login
                    if (this.loginForm) {
                        this.loginForm.reset();
                    }
                    // Remover qualquer classe de erro ou mensagem
                    const errorElements = loginModal.querySelectorAll('.error-message');
                    errorElements.forEach(el => el.remove());
                    // Garantir que a página está funcionando
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                    // Remover o backdrop do modal
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                });
            }

            if (registerModal) {
                registerModal.addEventListener('hidden.bs.modal', () => {
                    // Limpar o formulário de registro
                    if (this.registerForm) {
                        this.registerForm.reset();
                    }
                    // Limpar a preview do avatar
                    if (this.avatarPreview) {
                        this.avatarPreview.src = '../img/default-avatar.png';
                    }
                    // Remover qualquer classe de erro ou mensagem
                    const errorElements = registerModal.querySelectorAll('.error-message');
                    errorElements.forEach(el => el.remove());
                    // Garantir que a página está funcionando
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                    // Remover o backdrop do modal
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                    // Remover a classe modal-open do body
                    document.body.classList.remove('modal-open');
                });
            }

            // Adicionar event listeners para os botões de fechar
            const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Garantir que a página está funcionando
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                    // Remover o backdrop do modal
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                    // Remover a classe modal-open do body
                    document.body.classList.remove('modal-open');
                });
            });
        },

        async handleLogin() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, senha: password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Salvar dados do usuário
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userName', data.user.nome);
                    localStorage.setItem('userAvatar', data.user.avatar || '../img/default-avatar.png');
                    
                    // Fechar o modal de login
                    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    loginModal.hide();

                    // Limpar o formulário de login
                    this.loginForm.reset();
                    
                    // Mostrar mensagem de sucesso
                    this.showNotification('Login realizado com sucesso!', 'success');
                    
                    // Atualizar o estado do avatar e nome do usuário
                    this.updateAvatarState(true);

                    // Atualizar a interface
                    const userAvatar = document.getElementById('userAvatar');
                    const userName = document.getElementById('userName');
                    
                    if (data.user.avatar) {
                        userAvatar.src = data.user.avatar;
                        userAvatar.style.display = 'block';
                    }
                    
                    userName.textContent = data.user.nome;
                    userName.style.display = 'block';
                } else {
                    this.showNotification(data.message || 'Erro ao fazer login', 'error');
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                this.showNotification('Erro ao fazer login. Tente novamente.', 'error');
            }
        },

        async handleRegister() {
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const avatarFile = this.avatarInput.files[0];

            try {
                // Primeiro, fazer upload do avatar se houver
                let avatarUrl = '../img/default-avatar.png';
                if (avatarFile) {
                    const formData = new FormData();
                    formData.append('avatar', avatarFile);
                    
                    const uploadResponse = await fetch('http://localhost:3000/api/upload/avatar', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        avatarUrl = uploadData.avatarUrl;
                    }
                }

                // Depois, registrar o usuário
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: name,
                        email,
                        senha: password,
                        avatar: avatarUrl
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Fechar o modal de registro
                    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                    registerModal.hide();

                    // Mostrar mensagem de sucesso
                    this.showNotification('Conta criada com sucesso! Agora você pode fazer login.', 'success');

                    // Limpar o formulário de registro
                    this.registerForm.reset();

                    // Abrir o modal de login
                    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                    loginModal.show();

                    // Preencher o email no formulário de login
                    document.getElementById('loginEmail').value = email;
                } else {
                    this.showNotification(data.message || 'Erro ao criar conta', 'error');
                }
            } catch (error) {
                console.error('Erro ao criar conta:', error);
                this.showNotification('Erro ao criar conta. Tente novamente.', 'error');
            }
        },

        checkAuthStatus() {
            const token = localStorage.getItem('token');
            const userName = localStorage.getItem('userName');
            const userAvatar = localStorage.getItem('userAvatar');

            if (token && userName) {
                this.updateAvatarState(true);
            }
        },

        updateAvatarState(isLoggedIn) {
            const avatarBtn = document.getElementById('avatarBtn');
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            const token = localStorage.getItem('token');
            const storedUserName = localStorage.getItem('userName');
            const storedAvatar = localStorage.getItem('userAvatar');

            if (isLoggedIn && token && storedUserName) {
                // Atualizar o avatar
                if (storedAvatar) {
                    userAvatar.src = storedAvatar;
                    userAvatar.style.display = 'block';
                    avatarBtn.innerHTML = '';
                    avatarBtn.appendChild(userAvatar);
                } else {
                    userAvatar.style.display = 'none';
                    avatarBtn.innerHTML = '<i class="fas fa-user-check"></i>';
                }
                
                // Mostrar o nome do usuário
                userName.textContent = storedUserName;
                userName.style.display = 'block';
                
                // Adicionar classe para estilo do usuário logado
                avatarBtn.classList.add('logged-in');
            } else {
                // Resetar para o estado padrão
                avatarBtn.classList.remove('logged-in');
                userAvatar.style.display = 'none';
                avatarBtn.innerHTML = '<i class="fas fa-user"></i>';
                userName.style.display = 'none';
            }
        },

        showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;

            document.body.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 100);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    };

    // Inicializar autenticação quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        auth.init();
    });

    // Gerenciamento do Carrossel de Atualizações
    const carousel = {
        init() {
            this.track = document.querySelector('.carousel-track');
            this.cards = document.querySelectorAll('.update-card');
            this.prevBtn = document.querySelector('.carousel-control.prev');
            this.nextBtn = document.querySelector('.carousel-control.next');
            this.currentIndex = 0;
            this.cardsPerView = this.getCardsPerView();
            this.setupEventListeners();
            this.setupInfiniteCarousel();
            this.startAutoSlide();
            this.updateCarousel();
        },

        getCardsPerView() {
            const width = window.innerWidth;
            if (width >= 1200) return 5;
            if (width >= 992) return 4;
            if (width >= 768) return 3;
            if (width >= 576) return 2;
            return 1;
        },

        setupInfiniteCarousel() {
            // Clonar os primeiros cards para criar o efeito infinito
            const firstCards = Array.from(this.cards).slice(0, this.cardsPerView);
            firstCards.forEach(card => {
                const clone = card.cloneNode(true);
                this.track.appendChild(clone);
            });
        },

        setupEventListeners() {
            this.prevBtn.addEventListener('click', () => this.slide('prev'));
            this.nextBtn.addEventListener('click', () => this.slide('next'));
            
            // Pausar o carrossel quando o mouse estiver sobre ele
            this.track.addEventListener('mouseenter', () => {
                this.stopAutoSlide();
            });
            
            // Retomar o carrossel quando o mouse sair
            this.track.addEventListener('mouseleave', () => {
                this.startAutoSlide();
            });
            
            window.addEventListener('resize', () => {
                this.cardsPerView = this.getCardsPerView();
                this.updateCarousel();
            });
        },

        slide(direction) {
            if (direction === 'next') {
                this.currentIndex++;
            } else if (direction === 'prev' && this.currentIndex > 0) {
                this.currentIndex--;
            }
            this.updateCarousel();
        },

        updateCarousel() {
            const cardWidth = this.cards[0].offsetWidth + 24; // 24px é o gap
            this.track.style.transform = `translateX(-${this.currentIndex * cardWidth}px)`;
            
            // Atualizar estado dos botões
            this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
            this.nextBtn.style.opacity = 
                this.currentIndex >= this.cards.length - this.cardsPerView ? '0.5' : '1';
                
            // Verifica se chegou ao final dos cards originais
            if (this.currentIndex >= this.cards.length) {
                // Reseta para o início sem animação
                this.track.style.transition = 'none';
                this.currentIndex = 0;
                this.track.style.transform = `translateX(0)`;
                // Força um reflow
                this.track.offsetHeight;
                // Restaura a transição
                this.track.style.transition = 'transform 0.5s ease';
            }
        },

        startAutoSlide() {
            this.autoSlideInterval = setInterval(() => {
                this.slide('next');
            }, 3000); // Muda a cada 3 segundos
        },

        stopAutoSlide() {
            clearInterval(this.autoSlideInterval);
        }
    };

    // Inicializar carrossel quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        carousel.init();
    });

    // Carrossel do Top 10
    document.addEventListener('DOMContentLoaded', function() {
        const track = document.querySelector('.top10-track');
        const cards = document.querySelectorAll('.top10-card');
        const prevButton = document.querySelector('.top10-control.prev');
        const nextButton = document.querySelector('.top10-control.next');
        
        let currentIndex = 0;
        const cardWidth = cards[0].offsetWidth + 24; // Largura do card + gap
        const cardsPerView = window.innerWidth > 1200 ? 5 : 
                            window.innerWidth > 992 ? 4 :
                            window.innerWidth > 768 ? 3 :
                            window.innerWidth > 576 ? 2 : 1;
        
        // Clonar os primeiros cards para criar o efeito infinito
        const firstCards = Array.from(cards).slice(0, cardsPerView);
        firstCards.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });
        
        function updateCarousel() {
            const offset = currentIndex * cardWidth;
            track.style.transform = `translateX(-${offset}px)`;
            
            // Atualiza estado dos botões
            prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
            nextButton.style.opacity = currentIndex >= cards.length - cardsPerView ? '0.5' : '1';
            
            // Verifica se chegou ao final dos cards originais
            if (currentIndex >= cards.length) {
                // Reseta para o início sem animação
                track.style.transition = 'none';
                currentIndex = 0;
                track.style.transform = `translateX(0)`;
                // Força um reflow
                track.offsetHeight;
                // Restaura a transição
                track.style.transition = 'transform 0.5s ease';
            }
        }
        
        function nextSlide() {
            currentIndex++;
            updateCarousel();
        }
        
        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }
        
        // Event listeners para os botões
        nextButton.addEventListener('click', nextSlide);
        prevButton.addEventListener('click', prevSlide);
        
        // Iniciar o carrossel automático
        let autoSlideInterval = setInterval(nextSlide, 3000); // Muda a cada 3 segundos
        
        // Pausar o carrossel quando o mouse estiver sobre ele
        track.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        
        // Retomar o carrossel quando o mouse sair
        track.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(nextSlide, 3000);
        });
        
        // Atualiza o carrossel quando a janela é redimensionada
        window.addEventListener('resize', function() {
            const newCardsPerView = window.innerWidth > 1200 ? 5 : 
                                  window.innerWidth > 992 ? 4 :
                                  window.innerWidth > 768 ? 3 :
                                  window.innerWidth > 576 ? 2 : 1;
            
            if (newCardsPerView !== cardsPerView) {
                currentIndex = 0;
                updateCarousel();
            }
        });
        
        // Inicializa o carrossel
        updateCarousel();
    });

    // Função para pesquisar mangás
    async function searchManga(query) {
        try {
            const response = await fetch(`http://localhost:3000/api/mangas/search?query=${encodeURIComponent(query)}`);
            const mangas = await response.json();
            
            // Remover duplicatas baseado no ID do mangá
            const uniqueMangas = mangas.reduce((acc, current) => {
                const x = acc.find(item => item.id === current.id);
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, []);
            
            displaySearchResults(uniqueMangas);
        } catch (error) {
            console.error('Erro ao pesquisar mangás:', error);
        }
    }

    // Função para normalizar a URL da imagem
    const normalizeImageUrl = (url) => {
        if (!url) return null;
        
        // Se já for uma URL completa, retorna ela mesma
        if (url.startsWith('http')) return url;
        
        // Se for um caminho relativo, converte para URL completa
        if (url.startsWith('/img/')) return `http://localhost:3000${url}`;
        if (url.startsWith('../img/')) return `http://localhost:3000/img/${url.split('/').pop()}`;
        
        // Se for apenas o nome do arquivo
        return `http://localhost:3000/img/${url}`;
    };

    // Função para verificar se a imagem existe
    async function checkImageExists(url) {
        try {
            // Corrigir a URL se necessário
            if (url.includes('localhost:3001')) {
                url = url.replace('localhost:3001', 'localhost:3000');
            }
            
            console.log('Verificando imagem:', url);
            
            const response = await fetch(url, {
                method: 'HEAD',
                headers: {
                    'Accept': 'image/*',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                console.warn('Imagem não encontrada:', url);
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn('Erro ao verificar imagem:', error);
            return false;
        }
    }

    // Função para carregar detalhes do mangá
    async function loadMangaDetails(mangaId) {
        try {
            const response = await fetch(`http://localhost:3000/api/mangas/${mangaId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar mangá: ${response.status} ${response.statusText}`);
            }
            
            const manga = await response.json();
            
            // Verificar se a imagem existe
            const imageUrl = manga.imagem ? 
                (manga.imagem.startsWith('http') ? manga.imagem : 
                 manga.imagem.startsWith('/img/') ? `http://localhost:3000${manga.imagem}` :
                 manga.imagem.startsWith('../img/') ? `http://localhost:3000/img/${manga.imagem.split('/').pop()}` :
                 `http://localhost:3000/img/${manga.imagem}`) : 
                'http://localhost:3000/img/default-manga.png';
            
            const imageExists = await checkImageExists(imageUrl);
            
            // Criar o modal
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'mangaModal';
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('aria-labelledby', 'mangaModalLabel');
            modal.setAttribute('aria-hidden', 'true');
            
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="mangaModalLabel">${manga.titulo}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="manga-details">
                                <div class="manga-image">
                                    <img src="${imageExists ? imageUrl : 'http://localhost:3000/img/default-manga.png'}" 
                                         alt="${manga.titulo}"
                                         onerror="this.src='http://localhost:3000/img/default-manga.png'">
                                </div>
                                <div class="manga-info">
                                    <h2>${manga.titulo}</h2>
                                    <p class="author"><strong>Autor:</strong> ${manga.autor}</p>
                                    <p class="status"><strong>Status:</strong> <span class="badge ${manga.status.toLowerCase().includes('lançamento') ? 'lancamento' : 'andamento'}">${manga.status}</span></p>
                                    <p class="rating"><strong>Nota:</strong> <span class="star">★</span> ${manga.nota}</p>
                                    <p class="chapters"><strong>Capítulos:</strong> ${manga.capitulos}</p>
                                    <p class="genres"><strong>Gêneros:</strong> ${manga.generos.join(', ')}</p>
                                    <div class="synopsis">
                                        <h3>Sinopse</h3>
                                        <p>${manga.sinopse}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Adicionar o modal ao body
            document.body.appendChild(modal);
            
            // Inicializar o modal
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            // Remover o modal do DOM quando for fechado
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });
            
        } catch (error) {
            console.error('Erro ao carregar detalhes do mangá:', error);
            // Mostrar notificação de erro
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = 'Erro ao carregar detalhes do mangá. Tente novamente.';
            document.body.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 100);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    // Função para exibir os resultados da pesquisa
    function displaySearchResults(mangas) {
        const searchResultsContainer = document.getElementById('search-results');
        if (!searchResultsContainer) return;

        // Carregar mangás deletados do localStorage
        const deletedMangas = JSON.parse(localStorage.getItem('deletedMangas') || '[]');

        if (mangas.length === 0) {
            searchResultsContainer.innerHTML = '<p class="no-results">Nenhum mangá encontrado.</p>';
            searchResultsContainer.classList.add('active');
            return;
        }

        // Limpar resultados anteriores
        searchResultsContainer.innerHTML = '';

        const resultsHTML = mangas.map(manga => {
            const isDeleted = deletedMangas.includes(manga.id);
            const imageUrl = manga.imagem ? 
                (manga.imagem.startsWith('http') ? manga.imagem : 
                 manga.imagem.startsWith('/img/') ? `http://localhost:3000${manga.imagem}` :
                 manga.imagem.startsWith('../img/') ? `http://localhost:3000/img/${manga.imagem.split('/').pop()}` :
                 `http://localhost:3000/img/${manga.imagem}`) : 
                'http://localhost:3000/img/default-manga.png';
            
            return `
            <div class="manga-card ${isDeleted ? 'deleted' : ''}" data-manga-id="${manga.id}">
                <img src="${imageUrl}" alt="${manga.titulo}" class="manga-image" onerror="this.src='http://localhost:3000/img/default-manga.png'">
                <div class="manga-info">
                    <h3>${manga.titulo}</h3>
                    <p class="author">Autor: ${manga.autor}</p>
                    <p class="status">Status: ${manga.status}</p>
                    <p class="rating"><span class="star">★</span> ${manga.nota}/10</p>
                    <p class="chapters">Capítulos: ${manga.capitulos}</p>
                    <div class="genres">
                        ${manga.generos.map(genero => `<span class="genre-tag">${genero}</span>`).join('')}
                    </div>
                    <p class="sinopse">${manga.sinopse}</p>
                    ${isDeleted ? `
                    <div class="history-actions">
                        <button class="btn-delete-history" onclick="handleHistoryAction(${manga.id}, 'delete')">
                            <i class="fas fa-trash"></i> Deletar Histórico
                        </button>
                        <button class="btn-restore" onclick="handleHistoryAction(${manga.id}, 'restore')">
                            <i class="fas fa-check"></i> Manter Mangá
                        </button>
                </div>
                    ` : ''}
            </div>
            </div>
            `;
        }).join('');

        searchResultsContainer.innerHTML = resultsHTML;
        searchResultsContainer.classList.add('active');

        // Adicionar evento de clique nos cards
        const mangaCards = searchResultsContainer.querySelectorAll('.manga-card');
        mangaCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Não abrir detalhes se clicou em um botão de ação
                if (e.target.closest('.history-actions')) {
                    return;
                }
                const mangaId = card.dataset.mangaId;
                if (mangaId) {
                    loadMangaDetails(mangaId);
                }
            });
        });
    }

    // Função para lidar com ações do histórico
    window.handleHistoryAction = async function(mangaId, action) {
        if (action === 'delete') {
            const confirmDelete = confirm('Tem certeza que deseja deletar permanentemente este mangá do histórico? Esta ação não pode ser desfeita.');
            if (confirmDelete) {
                try {
                    // Remover do localStorage de mangás deletados
                    const deletedMangas = JSON.parse(localStorage.getItem('deletedMangas') || '[]');
                    const updatedDeletedMangas = deletedMangas.filter(id => id !== mangaId);
                    localStorage.setItem('deletedMangas', JSON.stringify(updatedDeletedMangas));

                    // Remover do localStorage de mangás mantidos se estiver lá
                    const keptMangas = JSON.parse(localStorage.getItem('keptMangas') || '[]');
                    const updatedKeptMangas = keptMangas.filter(m => m.id !== mangaId);
                    localStorage.setItem('keptMangas', JSON.stringify(updatedKeptMangas));

                    // Remover o card da pesquisa
                    const mangaCard = document.querySelector(`.manga-card[data-manga-id="${mangaId}"]`);
                    if (mangaCard) {
                        mangaCard.remove();
                    }

                    // Mostrar notificação de sucesso
                    showNotification('Mangá removido permanentemente do histórico', 'success');
                } catch (error) {
                    console.error('Erro ao deletar mangá do histórico:', error);
                    showNotification('Erro ao deletar mangá do histórico', 'error');
                }
            }
        } else if (action === 'restore') {
            try {
                // Buscar os detalhes do mangá
                const response = await fetch(`http://localhost:3000/api/mangas/${mangaId}`);
                const manga = await response.json();

                // Remover do localStorage de mangás deletados
                const deletedMangas = JSON.parse(localStorage.getItem('deletedMangas') || '[]');
                const updatedDeletedMangas = deletedMangas.filter(id => id !== manga.id);
                localStorage.setItem('deletedMangas', JSON.stringify(updatedDeletedMangas));

                // Atualizar a seção de últimas atualizações
                const updatesContainer = document.querySelector('.carousel-track');
                if (updatesContainer) {
                    // Verificar se o mangá já existe no container
                    const existingCard = updatesContainer.querySelector(`.update-card[data-manga-id="${manga.id}"]`);
                    if (!existingCard) {
                        const card = document.createElement('div');
                        card.className = 'card update-card';
                        card.dataset.mangaId = manga.id;
                        card.innerHTML = `
                            <img src="${manga.imagem}" alt="${manga.titulo}" onerror="this.src='http://localhost:3000/img/default-manga.png'">
                            <div class="card-info">
                                <h3>${manga.titulo}</h3>
                                <p><span class="star">★</span> ${manga.nota}</p>
                                <div class="update-info">
                                    <span class="update-time">Agora mesmo</span>
                                    <span class="update-views"><i class="fas fa-eye"></i> 0</span>
                                </div>
                            </div>
                            <span class="badge ${manga.status.toLowerCase().includes('lançamento') ? 'lancamento' : 'andamento'}">${manga.status}</span>
                            <div class="card-actions">
                                <button class="btn-delete">
                                    <i class="fas fa-trash"></i> Deletar
                                </button>
                                <button class="btn-keep">
                                    <i class="fas fa-check"></i> Manter
                                </button>
                            </div>
                        `;

                        // Adicionar event listeners aos botões
                        const deleteButton = card.querySelector('.btn-delete');
                        const keepButton = card.querySelector('.btn-keep');

                        deleteButton.addEventListener('click', () => handleMangaAction(manga.id, 'delete'));
                        keepButton.addEventListener('click', () => handleMangaAction(manga.id, 'keep'));

                        // Adicionar o card no início do carrossel
                        updatesContainer.insertBefore(card, updatesContainer.firstChild);
                    }
                }

                // Remover o card da pesquisa
                const mangaCard = document.querySelector(`.manga-card[data-manga-id="${mangaId}"]`);
                if (mangaCard) {
                    mangaCard.remove();
                }

                // Mostrar notificação de sucesso
                showNotification('Mangá restaurado com sucesso!', 'success');
        } catch (error) {
                console.error('Erro ao restaurar mangá:', error);
                showNotification('Erro ao restaurar mangá', 'error');
            }
        }
    };

    // Função auxiliar para mostrar notificações
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Adicionar estilos CSS para os novos elementos
    const searchStyles = document.createElement('style');
    searchStyles.textContent += `
        /* Ajuste da cor de fundo principal */
        body {
            background-color: #232342 !important;
        }

        .navbar {
            background-color: #232342 !important;
        }

        .section {
            background-color: #232342 !important;
        }

        .card {
            background-color: #2a2a4a !important;
        }

        .modal-content {
            background-color: #2a2a4a !important;
            color: #ffffff;
        }

        .modal-header {
            border-bottom: 1px solid #35355a;
        }

        .modal-footer {
            border-top: 1px solid #35355a;
        }

        /* Ajuste das cores dos elementos */
        .search-container {
            background-color: #2a2a4a !important;
        }

        .search-results {
            background-color: #2a2a4a !important;
        }

        .manga-card {
            background-color: #2a2a4a !important;
        }

        /* Ajuste das cores dos botões */
        .btn-primary {
            background-color: #18f9c4 !important;
            color: #232342 !important;
        }

        .btn-primary:hover {
            background-color: #15e0b0 !important;
        }

        /* Ajuste das cores dos inputs */
        input, select, textarea {
            background-color: #35355a !important;
            color: #ffffff !important;
            border: 1px solid #40406a !important;
        }

        input:focus, select:focus, textarea:focus {
            background-color: #35355a !important;
            border-color: #18f9c4 !important;
        }

        /* Ajuste das cores dos cards */
        .card-info {
            background-color: rgba(42, 42, 74, 0.9) !important;
        }

        .card-actions {
            background-color: rgba(42, 42, 74, 0.95) !important;
        }

        /* Ajuste das cores dos badges */
        .badge {
            background-color: #35355a !important;
        }

        .badge.lancamento {
            background-color: #18f9c4 !important;
            color: #232342 !important;
        }

        .badge.andamento {
            background-color: #ff9f43 !important;
            color: #232342 !important;
        }

        .badge.concluido {
            background-color: #28a745 !important;
            color: #232342 !important;
        }

        /* Estilo para o ícone X */
        .btn-close {
            color: #ffffff !important;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
            opacity: 1 !important;
            transition: all 0.3s ease;
            filter: brightness(2) contrast(1.5);
            font-size: 2rem;
            font-weight: 400;
            position: relative;
            z-index: 1000;
        }

        .btn-close:hover {
            color: #ffffff !important;
            transform: scale(1.2);
            text-shadow: 0 0 15px rgba(255, 255, 255, 1);
            filter: brightness(2.5) contrast(1.8);
        }

        .btn-close:focus {
            box-shadow: none;
            outline: none;
        }

        /* Ajuste para o modal */
        .modal-header .btn-close {
            margin: -0.5rem -0.5rem -0.5rem auto;
            padding: 0.5rem;
            background: transparent;
            border: 0;
            border-radius: 0.375rem;
            line-height: 1;
        }

        /* Ajuste para o ícone X em diferentes contextos */
        .modal .btn-close,
        .alert .btn-close,
        .toast .btn-close {
            color: #ffffff !important;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
            filter: brightness(2) contrast(1.5);
        }

        /* Efeito de brilho ao redor do X */
        .btn-close::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%);
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
        }

        .btn-close:hover::before {
            opacity: 1;
        }

        /* Estilos para os botões de ação */
        .btn-delete {
            background-color: #dc3545 !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }

        .btn-delete:hover {
            background-color: #c82333 !important;
            transform: translateY(-2px) !important;
        }

        .btn-keep {
            background-color: #28a745 !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }

        .btn-keep:hover {
            background-color: #218838 !important;
            transform: translateY(-2px) !important;
        }

        .btn-keep:disabled {
            background-color: #6c757d !important;
            cursor: not-allowed !important;
            transform: none !important;
        }

        /* Estilos para o container de ações */
        .card-actions {
            display: flex !important;
            gap: 8px !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 10px !important;
            background-color: rgba(42, 42, 74, 0.95) !important;
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            opacity: 0 !important;
            transition: opacity 0.3s ease !important;
        }

        .card:hover .card-actions {
            opacity: 1 !important;
        }

        /* Estilos para os botões de ação */
        .btn-delete, .btn-keep {
            flex: 1 !important;
            max-width: 120px !important;
            text-align: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        .btn-delete {
            background-color: #dc3545 !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }

        .btn-delete:hover {
            background-color: #c82333 !important;
            transform: translateY(-2px) !important;
        }

        .btn-keep {
            background-color: #28a745 !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }

        .btn-keep:hover {
            background-color: #218838 !important;
            transform: translateY(-2px) !important;
        }

        .btn-keep:disabled {
            background-color: #6c757d !important;
            cursor: not-allowed !important;
            transform: none !important;
        }

        /* Ajuste para o card */
        .card {
            position: relative !important;
            overflow: hidden !important;
        }
        
        /* Tags de gênero */
        .genre-tag {
            background-color: rgba(24, 249, 196);
            color: #232342;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            border: 1px solid rgba(24, 249, 196, 0.3);
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(searchStyles);

    // Adicionar event listeners quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', function() {
        // Event listener para clicar no card do mangá
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function() {
                const mangaId = this.dataset.mangaId;
                if (mangaId) {
                    loadMangaDetails(mangaId);
                }
            });
        });

        // Event listeners para os botões de controle do modal
        const modal = document.getElementById('mangaDetailsModal');
        if (modal) {
            const readButton = modal.querySelector('.btn-primary');
            const addToListButton = modal.querySelector('.btn-success');
            const favoriteButton = modal.querySelector('.btn-warning');

            if (readButton) {
                readButton.addEventListener('click', function() {
                    const mangaId = modal.dataset.currentMangaId;
                    if (mangaId) {
                        // Implementar lógica para ler o mangá
                        console.log('Ler mangá:', mangaId);
                    }
                });
            }

            if (addToListButton) {
                addToListButton.addEventListener('click', function() {
                    const mangaId = modal.dataset.currentMangaId;
                    if (mangaId) {
                        // Implementar lógica para adicionar à lista
                        console.log('Adicionar à lista:', mangaId);
                    }
                });
            }

            if (favoriteButton) {
                favoriteButton.addEventListener('click', function() {
                    const mangaId = modal.dataset.currentMangaId;
                    if (mangaId) {
                        // Implementar lógica para favoritar
                        console.log('Favoritar:', mangaId);
                    }
                });
            }
        }
    });

    // Função para fazer logout
    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatar');
        updateAvatarState(false);
        showToast('Logout realizado com sucesso!', 'success');
    }

    // Gerenciamento de Doação de Mangá
    const donation = {
        isSubmitting: false,

        init() {
            this.form = document.getElementById('donationForm');
            this.coverInput = document.getElementById('mangaCover');
            this.coverPreview = document.getElementById('coverPreview');
            console.log('Inicializando doação:', {
                form: this.form,
                coverInput: this.coverInput,
                coverPreview: this.coverPreview
            });
            this.setupEventListeners();
        },

        setupEventListeners() {
            // Preview da imagem da capa
            if (this.coverInput) {
                this.coverInput.addEventListener('change', (e) => {
                    console.log('Arquivo selecionado:', e.target.files[0]);
                    const file = e.target.files[0];
                    if (file) {
                        // Verificar se o arquivo é uma imagem
                        if (!file.type.startsWith('image/')) {
                            console.error('Arquivo não é uma imagem:', file.type);
                            this.showNotification('Por favor, selecione um arquivo de imagem válido.', 'error');
                            this.coverInput.value = '';
                            return;
                        }

                        // Verificar o tamanho do arquivo (máximo 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                            console.error('Arquivo muito grande:', file.size);
                            this.showNotification('A imagem deve ter no máximo 5MB.', 'error');
                            this.coverInput.value = '';
                            return;
                        }

                        const reader = new FileReader();
                        reader.onload = (e) => {
                            console.log('FileReader carregou a imagem:', e.target.result.substring(0, 100) + '...');
                            if (this.coverPreview) {
                                console.log('Atualizando preview da imagem');
                                // Remover classe fade-in se existir
                                this.coverPreview.classList.remove('fade-in');
                                // Forçar um reflow
                                void this.coverPreview.offsetWidth;
                                // Atualizar a imagem
                                this.coverPreview.src = e.target.result;
                                this.coverPreview.style.display = 'block';
                                // Adicionar classe para animação
                                this.coverPreview.classList.add('fade-in');
                            } else {
                                console.error('Elemento coverPreview não encontrado');
                            }
                        };
                        reader.onerror = (error) => {
                            console.error('Erro ao ler o arquivo:', error);
                            this.showNotification('Erro ao carregar a imagem. Tente novamente.', 'error');
                        };
                        reader.readAsDataURL(file);
                    }
                });
            } else {
                console.error('Elemento coverInput não encontrado');
            }

            // Submissão do formulário
            if (this.form) {
                this.form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    console.log('Formulário submetido');
                    if (this.isSubmitting) {
                        console.log('Formulário já está sendo submetido');
                        return;
                    }
                    await this.handleDonation();
                });
            } else {
                console.error('Elemento form não encontrado');
            }
        },

        async handleDonation() {
            if (this.isSubmitting) return;
            this.isSubmitting = true;
            console.log('Iniciando processo de doação');

            const formData = new FormData();
            formData.append('titulo', document.getElementById('mangaTitle').value);
            formData.append('autor', document.getElementById('mangaAuthor').value);
            formData.append('status', document.getElementById('mangaStatus').value);
            formData.append('nota', document.getElementById('mangaRating').value);
            formData.append('capitulos', document.getElementById('mangaChapters').value);
            formData.append('generos', document.getElementById('mangaGenres').value);
            formData.append('sinopse', document.getElementById('mangaSynopsis').value);
            
            // Garantir que o arquivo da imagem seja anexado corretamente
            const coverFile = this.coverInput.files[0];
            console.log('Arquivo da capa:', coverFile);
            if (coverFile) {
                console.log('Anexando arquivo ao FormData');
                formData.append('imagem', coverFile);
            } else {
                console.warn('Nenhum arquivo de imagem selecionado');
            }

            try {
                console.log('Enviando requisição para o servidor');
                const response = await fetch('http://localhost:3000/api/mangas/donate', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                console.log('Resposta do servidor:', data);

                if (response.ok) {
                    console.log('Doação realizada com sucesso');
                    // Fechar o modal
                    const donationModal = bootstrap.Modal.getInstance(document.getElementById('donationModal'));
                    donationModal.hide();

                    // Limpar o formulário
                    this.form.reset();
                    if (this.coverPreview) {
                        this.coverPreview.src = '';
                        this.coverPreview.style.display = 'none';
                    }

                    // Mostrar mensagem de sucesso
                    this.showNotification('Mangá doado com sucesso!', 'success');

                    // Recarregar a lista de últimas atualizações
                    await loadLatestUpdates();
                } else {
                    console.error('Erro na resposta do servidor:', data);
                    this.showNotification(data.message || 'Erro ao doar mangá', 'error');
                }
            } catch (error) {
                console.error('Erro ao doar mangá:', error);
                this.showNotification('Erro ao doar mangá. Tente novamente.', 'error');
            } finally {
                this.isSubmitting = false;
            }
        },

        showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;

            document.body.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 100);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    };

    // Inicializar doação quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        donation.init();
    });

    // Função para carregar as últimas atualizações
    async function loadLatestUpdates() {
        try {
            const response = await fetch('http://localhost:3000/api/mangas/search', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar mangás: ${response.status} ${response.statusText}`);
            }
            
            const mangas = await response.json();
            
            // Ordenar por ID (mais recente primeiro)
            mangas.sort((a, b) => b.id - a.id);
            
            // Carregar mangás deletados do localStorage
            const deletedMangas = JSON.parse(localStorage.getItem('deletedMangas') || '[]');
            
            // Filtrar os mangás deletados
            const filteredMangas = mangas.filter(manga => !deletedMangas.includes(manga.id));
            
            // Pegar os 6 mais recentes dos mangás não deletados
            const latestMangas = filteredMangas.slice(0, 6);
            
            const updatesContainer = document.querySelector('.carousel-track');
            if (!updatesContainer) return;
            
            // Limpar o container
            updatesContainer.innerHTML = '';
            
            // Carregar mangás mantidos do localStorage
            const keptMangas = JSON.parse(localStorage.getItem('keptMangas') || '[]');
            
            // Adicionar cada mangá
            latestMangas.forEach(manga => {
                const isKept = keptMangas.some(keptManga => keptManga.id === manga.id);
                const imageUrl = manga.imagem ? 
                    (manga.imagem.startsWith('http') ? manga.imagem : 
                     manga.imagem.startsWith('/img/') ? `http://localhost:3000${manga.imagem}` :
                     manga.imagem.startsWith('../img/') ? `http://localhost:3000/img/${manga.imagem.split('/').pop()}` :
                     `http://localhost:3000/img/${manga.imagem}`) : 
                    'http://localhost:3000/img/default-manga.png';
                
                const card = document.createElement('div');
                card.className = `card update-card ${isKept ? 'kept' : ''}`;
                card.dataset.mangaId = manga.id;
                card.innerHTML = `
                    <div class="card-image">
                        <img src="${imageUrl}" alt="${manga.titulo}" onerror="this.src='http://localhost:3000/img/default-manga.png'">
                    </div>
                    <div class="card-info">
                        <h3>${manga.titulo}</h3>
                        <p><span class="star">★</span> ${manga.nota}</p>
                        <div class="update-info">
                            <span class="update-time">Agora mesmo</span>
                            <span class="update-views"><i class="fas fa-eye"></i> 0</span>
                        </div>
                    </div>
                    <span class="badge ${manga.status.toLowerCase().includes('lançamento') ? 'lancamento' : 'andamento'}">${manga.status}</span>
                    <div class="card-actions">
                        <button class="btn-delete">
                            <i class="fas fa-trash"></i> Deletar
                        </button>
                        <button class="btn-keep" ${isKept ? 'disabled' : ''}>
                            <i class="fas fa-check"></i> ${isKept ? 'Mantido' : 'Manter'}
                        </button>
                    </div>
                `;

                // Adicionar event listeners aos botões
                const deleteButton = card.querySelector('.btn-delete');
                const keepButton = card.querySelector('.btn-keep');

                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleMangaAction(manga.id, 'delete');
                });
                
                keepButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleMangaAction(manga.id, 'keep');
                });

                // Adicionar evento de clique no card para abrir detalhes
                card.addEventListener('click', () => {
                    loadMangaDetails(manga.id);
                });

                updatesContainer.appendChild(card);
            });

            // Adicionar botão "Mais Mangá"
            const moreMangaButton = document.createElement('div');
            moreMangaButton.className = 'more-manga-button';
            moreMangaButton.innerHTML = `
                <button class="btn-more-manga">
                    <i class="fas fa-plus"></i>
                    Mais Mangá
                </button>
            `;
            updatesContainer.appendChild(moreMangaButton);

        } catch (error) {
            console.error('Erro ao carregar últimas atualizações:', error);
            // Mostrar notificação de erro
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = 'Erro ao carregar últimas atualizações. Tente novamente.';
            document.body.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 100);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    // Função auxiliar para criar cards de mangá
    function createMangaCard(manga) {
        const isKept = JSON.parse(localStorage.getItem('keptMangas') || '[]')
            .some(keptManga => keptManga.id === manga.id);
        
        const imageUrl = manga.imagem ? 
            (manga.imagem.startsWith('http') ? manga.imagem : 
             manga.imagem.startsWith('/img/') ? `http://localhost:3000${manga.imagem}` :
             manga.imagem.startsWith('../img/') ? `http://localhost:3000/img/${manga.imagem.split('/').pop()}` :
             `http://localhost:3000/img/${manga.imagem}`) : 
            'http://localhost:3000/img/default-manga.png';
        
        const card = document.createElement('div');
        card.className = `card update-card ${isKept ? 'kept' : ''}`;
        card.dataset.mangaId = manga.id;
        card.innerHTML = `
            <div class="card-image">
                <img src="${imageUrl}" alt="${manga.titulo}" onerror="this.src='http://localhost:3000/img/default-manga.png'">
            </div>
            <div class="card-info">
                <h3>${manga.titulo}</h3>
                <p><span class="star">★</span> ${manga.nota}</p>
                <div class="update-info">
                    <span class="update-time">Agora mesmo</span>
                    <span class="update-views"><i class="fas fa-eye"></i> 0</span>
                </div>
            </div>
            <span class="badge ${manga.status.toLowerCase().includes('lançamento') ? 'lancamento' : 'andamento'}">${manga.status}</span>
            <div class="card-actions">
                <button class="btn-delete">
                    <i class="fas fa-trash"></i> Deletar
                </button>
                <button class="btn-keep" ${isKept ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> ${isKept ? 'Mantido' : 'Manter'}
                </button>
            </div>
        `;

        // Adicionar event listeners aos botões
        const deleteButton = card.querySelector('.btn-delete');
        const keepButton = card.querySelector('.btn-keep');

        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleMangaAction(manga.id, 'delete');
        });
        
        keepButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleMangaAction(manga.id, 'keep');
        });

        // Adicionar evento de clique no card para abrir detalhes
        card.addEventListener('click', () => {
            loadMangaDetails(manga.id);
        });

        return card;
    }

    // Função para lidar com as ações de deletar ou manter
    window.handleMangaAction = async function(mangaId, action) {
        const card = document.querySelector(`.update-card[data-manga-id="${mangaId}"]`);
        if (!card) return;

        if (action === 'delete') {
            const confirmDelete = confirm('Tem certeza que deseja deletar este mangá das últimas atualizações?');
            if (confirmDelete) {
                // Remover o card do DOM
                card.remove();
                
                // Adicionar ao localStorage de mangás deletados
                const deletedMangas = JSON.parse(localStorage.getItem('deletedMangas') || '[]');
                if (!deletedMangas.includes(mangaId)) {
                    deletedMangas.push(mangaId);
                    localStorage.setItem('deletedMangas', JSON.stringify(deletedMangas));
                }
                
                // Remover do localStorage de mangás mantidos se estiver lá
                const keptMangas = JSON.parse(localStorage.getItem('keptMangas') || '[]');
                const updatedKeptMangas = keptMangas.filter(m => m.id !== mangaId);
                localStorage.setItem('keptMangas', JSON.stringify(updatedKeptMangas));

                // Remover o card da seção de destaque se existir
                const featuredCard = document.querySelector(`.section:nth-child(3) .card[data-manga-id="${mangaId}"]`);
                if (featuredCard) {
                    featuredCard.remove();
                }

                // Mostrar notificação de sucesso
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.textContent = 'Mangá removido das últimas atualizações!';
                document.body.appendChild(notification);
                setTimeout(() => notification.classList.add('show'), 100);
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            }
        } else if (action === 'keep') {
            try {
                // Buscar os detalhes do mangá
                const response = await fetch(`http://localhost:3000/api/mangas/${mangaId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Erro ao buscar mangá: ${response.status} ${response.statusText}`);
                }
                
                const manga = await response.json();

                // Salvar no localStorage
                const keptMangas = JSON.parse(localStorage.getItem('keptMangas') || '[]');
                if (!keptMangas.some(m => m.id === manga.id)) {
                    keptMangas.push(manga);
                    localStorage.setItem('keptMangas', JSON.stringify(keptMangas));
                }

                // Remover do localStorage de mangás deletados se estiver lá
                const deletedMangas = JSON.parse(localStorage.getItem('deletedMangas') || '[]');
                const updatedDeletedMangas = deletedMangas.filter(id => id !== manga.id);
                localStorage.setItem('deletedMangas', JSON.stringify(updatedDeletedMangas));

                // Encontrar a seção de Mangás em Destaque
                const featuredSection = document.querySelector('.section:nth-child(3)');
                if (!featuredSection) {
                    console.error('Seção de Mangás em Destaque não encontrada');
                    return;
                }

                const featuredContainer = featuredSection.querySelector('.cards');
                if (!featuredContainer) {
                    console.error('Container de cards não encontrado');
                    return;
                }

                // Verificar se o mangá já está na seção de destaque
                const existingCard = featuredContainer.querySelector(`.card[data-manga-id="${manga.id}"]`);
                if (!existingCard) {
                    // Criar o card para a seção de destaque
                    const featuredCard = document.createElement('div');
                    featuredCard.className = 'card';
                    featuredCard.dataset.mangaId = manga.id;
                    featuredCard.innerHTML = `
                        <img src="${manga.imagem}" alt="${manga.titulo}">
                        <div class="card-info">
                            <h3>${manga.titulo}</h3>
                            <p><span class="star">★</span> ${manga.nota}</p>
                        </div>
                        <span class="badge ${manga.status.toLowerCase().includes('lançamento') ? 'lancamento' : 'andamento'}">${manga.status}</span>
                    `;

                    // Adicionar evento de clique no card
                    featuredCard.addEventListener('click', () => {
                        loadMangaDetails(manga.id);
                    });

                    // Adicionar o card na seção de destaque
                    featuredContainer.insertBefore(featuredCard, featuredContainer.firstChild);
                }

                // Marcar o mangá como mantido na seção de últimas atualizações
                card.classList.add('kept');
                const keepButton = card.querySelector('.btn-keep');
                if (keepButton) {
                    keepButton.innerHTML = '<i class="fas fa-check"></i> Mantido';
                    keepButton.disabled = true;
                }

                // Mostrar notificação de sucesso
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.textContent = 'Mangá movido para a seção de destaque!';
                document.body.appendChild(notification);
                setTimeout(() => notification.classList.add('show'), 100);
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 300);
                }, 3000);

            } catch (error) {
                console.error('Erro ao mover mangá para destaque:', error);
                // Mostrar notificação de erro
                const notification = document.createElement('div');
                notification.className = 'notification error';
                notification.textContent = 'Erro ao mover mangá para destaque. Tente novamente.';
                document.body.appendChild(notification);
                setTimeout(() => notification.classList.add('show'), 100);
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            }
        }
    };

    // Função para carregar mangás em destaque
    async function loadFeaturedMangas() {
        try {
            // Carregar mangás mantidos do localStorage
            const keptMangas = JSON.parse(localStorage.getItem('keptMangas') || '[]');
            
            // Encontrar a seção de Mangás em Destaque
            const featuredSection = document.querySelector('.section:nth-child(3)');
            if (!featuredSection) {
                console.error('Seção de Mangás em Destaque não encontrada');
                return;
            }

            const featuredContainer = featuredSection.querySelector('.cards');
            if (!featuredContainer) {
                console.error('Container de cards não encontrado');
                return;
            }

            // Limpar o container de destaque
            featuredContainer.innerHTML = '';

            // Buscar todos os mangás da API
            const response = await fetch('http://localhost:3000/api/mangas/search');
            const allMangas = await response.json();

            // Adicionar os mangás mantidos
            keptMangas.forEach(keptManga => {
                // Encontrar o mangá atualizado na lista completa
                const updatedManga = allMangas.find(m => m.id === keptManga.id) || keptManga;
                const imageUrl = updatedManga.imagem ? 
                    (updatedManga.imagem.startsWith('http') ? updatedManga.imagem : 
                     updatedManga.imagem.startsWith('/img/') ? `http://localhost:3000${updatedManga.imagem}` :
                     updatedManga.imagem.startsWith('../img/') ? `http://localhost:3000/img/${updatedManga.imagem.split('/').pop()}` :
                     `http://localhost:3000/img/${updatedManga.imagem}`) : 
                    'http://localhost:3000/img/default-manga.png';
                
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.mangaId = updatedManga.id;
                card.innerHTML = `
                    <img src="${imageUrl}" alt="${updatedManga.titulo}" onerror="this.src='http://localhost:3000/img/default-manga.png'">
                    <div class="card-info">
                        <h3>${updatedManga.titulo}</h3>
                        <p><span class="star">★</span> ${updatedManga.nota}</p>
                    </div>
                    <span class="badge ${updatedManga.status.toLowerCase().includes('lançamento') ? 'lancamento' : 'andamento'}">${updatedManga.status}</span>
                `;

                // Adicionar evento de clique no card
                card.addEventListener('click', () => {
                    loadMangaDetails(updatedManga.id);
                });

                featuredContainer.appendChild(card);
            });

            // Se não houver mangás mantidos, adicionar o Pokémon como padrão
            if (featuredContainer.children.length === 0) {
                const pokemon = allMangas.find(manga => manga.titulo.trim() === 'Pokémon');
                if (pokemon) {
                    const imageUrl = pokemon.imagem ? 
                        (pokemon.imagem.startsWith('http') ? pokemon.imagem : 
                         pokemon.imagem.startsWith('/img/') ? `http://localhost:3000${pokemon.imagem}` :
                         pokemon.imagem.startsWith('../img/') ? `http://localhost:3000/img/${pokemon.imagem.split('/').pop()}` :
                         `http://localhost:3000/img/${pokemon.imagem}`) : 
                        'http://localhost:3000/img/default-manga.png';
                    
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.dataset.mangaId = pokemon.id;
                    card.innerHTML = `
                        <img src="${imageUrl}" alt="${pokemon.titulo}" onerror="this.src='http://localhost:3000/img/default-manga.png'">
                        <div class="card-info">
                            <h3>${pokemon.titulo}</h3>
                            <p><span class="star">★</span> ${pokemon.nota}</p>
                        </div>
                        <span class="badge ${pokemon.status.toLowerCase().includes('lançamento') ? 'lancamento' : 'andamento'}">${pokemon.status}</span>
                    `;

                    // Adicionar evento de clique no card
                    card.addEventListener('click', () => {
                        loadMangaDetails(pokemon.id);
                    });

                    featuredContainer.appendChild(card);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar mangás em destaque:', error);
        }
    }

    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        auth.init();
        carousel.init();
        donation.init(); // Inicializar doação
        loadLatestUpdates(); // Carregar últimas atualizações
        loadFeaturedMangas(); // Carregar mangás em destaque
    });

    // Função para verificar autenticação e bloquear interações
    function checkAuthAndBlock() {
        // Removendo temporariamente o bloqueio de interações
        return;
        
        /* Código original comentado
        const token = localStorage.getItem('token');
        if (!token) {
            // Bloquear apenas as interações
            const elementsToBlock = [
                '.update-card', // Cards de atualização
                '.update-card .card-actions', // Botões de ação dos cards de atualização
                '.update-card .btn-keep', // Botão manter
                '.update-card .btn-delete' // Botão deletar
            ];

            elementsToBlock.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Adicionar classe para estilo visual
                    element.classList.add('requires-auth');
                    
                    // Adicionar evento de clique para mostrar modal de login
                    element.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                        loginModal.show();
                    });
                });
            });

            // Adicionar estilos para elementos bloqueados
            const style = document.createElement('style');
            style.textContent = `
                .update-card.requires-auth {
                    position: relative;
                    cursor: pointer;
                }

                .update-card.requires-auth::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    border-radius: 16px;
                    z-index: 1;
                }

                .update-card.requires-auth:hover::after {
                    opacity: 1;
                }

                .update-card.requires-auth:hover::before {
                    content: 'Faça login para interagir';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(24, 249, 196, 0.9);
                    color: #10101a;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 2;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .update-card.requires-auth .card-info {
                    filter: blur(2px);
                    transition: filter 0.3s ease;
                }

                .update-card.requires-auth:hover .card-info {
                    filter: blur(3px);
                }

                .update-card .card-actions.requires-auth {
                    opacity: 0.5;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);
        }
        */
    }

    // Adicionar verificação de autenticação quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', () => {
        checkAuthAndBlock();
    });

})(); 