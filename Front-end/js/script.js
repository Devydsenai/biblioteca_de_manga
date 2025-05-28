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
            search: '/api/search',
            manga: '/api/manga',
            user: '/api/user'
        }
    };

    // DOM Elements
    const elements = {
        navbar: document.querySelector('.navbar'),
        searchInput: document.querySelector('.search-input'),
        searchButton: document.querySelector('.search-button'),
        loginBtn: document.querySelector('.login-btn'),
        registerBtn: document.querySelector('.register-btn'),
        cards: document.querySelectorAll('.card'),
        viewAllLinks: document.querySelectorAll('.view-all')
    };

    /**
     * Handles the search functionality
     * @param {Event} event - The input event
     */
    const handleSearch = (event) => {
        const searchTerm = event.target.value.trim();
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
        if (elements.searchInput) {
            let searchTimeout;
            elements.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => handleSearch(e), CONFIG.searchDelay);
            });
        }

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
        },

        async handleLogin() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('http://localhost:3001/api/auth/login', {
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
                    
                    const uploadResponse = await fetch('http://localhost:3001/api/upload/avatar', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        avatarUrl = uploadData.avatarUrl;
                    }
                }

                // Depois, registrar o usuário
                const response = await fetch('http://localhost:3001/api/auth/register', {
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
            const response = await fetch(`http://localhost:3001/api/mangas/search?query=${encodeURIComponent(query)}`);
            const mangas = await response.json();
            displaySearchResults(mangas);
        } catch (error) {
            console.error('Erro ao pesquisar mangás:', error);
        }
    }

    // Função para exibir os resultados da pesquisa
    function displaySearchResults(mangas) {
        const searchResultsContainer = document.getElementById('search-results');
        if (!searchResultsContainer) return;

        if (mangas.length === 0) {
            searchResultsContainer.innerHTML = '<p class="no-results">Nenhum mangá encontrado.</p>';
            searchResultsContainer.classList.add('active');
            return;
        }

        const resultsHTML = mangas.map(manga => `
            <div class="manga-card" data-manga-id="${manga.id}">
                <img src="${manga.imagem}" alt="${manga.titulo}" class="manga-image">
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
                </div>
            </div>
        `).join('');

        searchResultsContainer.innerHTML = resultsHTML;
        searchResultsContainer.classList.add('active');

        // Adicionar evento de clique nos cards
        const mangaCards = searchResultsContainer.querySelectorAll('.manga-card');
        mangaCards.forEach(card => {
            card.addEventListener('click', () => {
                const mangaId = card.dataset.mangaId;
                if (mangaId) {
                    loadMangaDetails(mangaId);
                }
            });
        });
    }

    // Adicionar evento de pesquisa
    document.addEventListener('DOMContentLoaded', () => {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');

        if (searchForm && searchInput) {
            let searchTimeout;

            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    searchManga(query);
                }
            });

            // Pesquisa em tempo real enquanto o usuário digita
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                clearTimeout(searchTimeout);
                
                if (query.length >= 2) {
                    searchTimeout = setTimeout(() => {
                        searchManga(query);
                    }, 300);
                } else {
                    searchResults.classList.remove('active');
                }
            });

            // Fechar resultados ao clicar fora
            document.addEventListener('click', (e) => {
                if (!searchForm.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.classList.remove('active');
                }
            });

            // Manter resultados visíveis ao passar o mouse
            searchResults.addEventListener('mouseenter', () => {
                searchResults.classList.add('active');
            });

            searchResults.addEventListener('mouseleave', () => {
                if (!searchInput.value.trim()) {
                    searchResults.classList.remove('active');
                }
            });
        }
    });

    // Função para carregar os detalhes do mangá no modal
    async function loadMangaDetails(mangaId) {
        try {
            // Buscar informações do mangá
            const mangaResponse = await fetch(`http://localhost:3001/api/mangas/${mangaId}`);
            if (!mangaResponse.ok) {
                throw new Error('Erro ao buscar detalhes do mangá');
            }
            const manga = await mangaResponse.json();

            // Atualizar o conteúdo do modal
            const modal = document.getElementById('mangaDetailsModal');
            const modalImage = modal.querySelector('.manga-detail-image');
            const modalTitle = modal.querySelector('.manga-info-container h3');
            const modalAuthor = modal.querySelector('.manga-info-container .author');
            const modalStatus = modal.querySelector('.manga-info-container .status');
            const modalRating = modal.querySelector('.manga-info-container .rating');
            const modalChapters = modal.querySelector('.manga-info-container .chapters');
            const modalGenres = modal.querySelector('.manga-info-container .genres');
            const modalSinopse = modal.querySelector('.manga-info-container .sinopse');
            const modalStatusBadge = modal.querySelector('.manga-status-badge');

            // Encontrar o card do mangá clicado
            const mangaCard = document.querySelector(`.card[data-manga-id="${mangaId}"]`);
            const cardImage = mangaCard ? mangaCard.querySelector('img') : null;

            // Atualizar os elementos do modal
            if (cardImage) {
                modalImage.src = cardImage.src;
            } else {
                modalImage.src = manga.imagem;
            }
            modalImage.alt = manga.titulo;
            modalTitle.textContent = manga.titulo;
            modalAuthor.textContent = `Autor: ${manga.autor}`;
            modalStatus.textContent = `Status: ${manga.status}`;
            modalRating.innerHTML = `<span class="star">★</span> ${manga.nota}/10`;
            modalChapters.textContent = `Capítulos: ${manga.capitulos}`;
            modalSinopse.textContent = manga.sinopse;
            modalStatusBadge.textContent = manga.status.toUpperCase();

            // Atualizar os gêneros
            modalGenres.innerHTML = manga.generos.map(genero => 
                `<span class="genre-tag">${genero}</span>`
            ).join('');

            // Armazenar o ID do mangá atual no modal
            modal.dataset.currentMangaId = mangaId;

            // Mostrar o modal usando Bootstrap
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        } catch (error) {
            console.error('Erro ao carregar detalhes do mangá:', error);
            alert('Erro ao carregar detalhes do mangá. Tente novamente.');
        }
    }

    // Função para marcar mangá como em uso
    async function useManga(mangaId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para usar um mangá.');
            return;
        }

        const confirmacao = confirm('Você está prestes a marcar este mangá como em uso. Outros usuários não poderão usá-lo enquanto você estiver lendo. Deseja continuar?');
        if (!confirmacao) return;

        try {
            const response = await fetch(`http://localhost:3001/api/manga/${mangaId}/use`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Mangá marcado como em uso com sucesso! Você pode começar a leitura.');
                loadMangaDetails(mangaId); // Recarregar detalhes para atualizar o status
            } else {
                const error = await response.json();
                alert(error.message || 'Erro ao marcar mangá como em uso.');
            }
        } catch (error) {
            console.error('Erro ao marcar mangá como em uso:', error);
            alert('Erro ao marcar mangá como em uso. Tente novamente.');
        }
    }

    // Função para marcar mangá como disponível
    async function releaseManga(mangaId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para marcar um mangá como disponível.');
            return;
        }

        const confirmacao = confirm('Você está prestes a marcar este mangá como disponível. Outros usuários poderão usá-lo. Deseja continuar?');
        if (!confirmacao) return;

        try {
            const response = await fetch(`http://localhost:3001/api/manga/${mangaId}/available`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Mangá marcado como disponível com sucesso! Outros usuários agora podem usá-lo.');
                loadMangaDetails(mangaId); // Recarregar detalhes para atualizar o status
            } else {
                const error = await response.json();
                alert(error.message || 'Erro ao marcar mangá como disponível.');
            }
        } catch (error) {
            console.error('Erro ao marcar mangá como disponível:', error);
            alert('Erro ao marcar mangá como disponível. Tente novamente.');
        }
    }

    // Função para devolver mangá
    async function returnManga(mangaId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para devolver um mangá.');
            return;
        }

        const confirmacao = confirm('Você está prestes a devolver este mangá. Deseja confirmar a devolução?');
        if (!confirmacao) return;

        try {
            const response = await fetch(`http://localhost:3001/api/manga/${mangaId}/return`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Mangá devolvido com sucesso! Obrigado por utilizar nossa biblioteca.');
                loadMangaDetails(mangaId); // Recarregar detalhes para atualizar o status
            } else {
                const error = await response.json();
                alert(error.message || 'Erro ao devolver mangá.');
            }
        } catch (error) {
            console.error('Erro ao devolver mangá:', error);
            alert('Erro ao devolver mangá. Tente novamente.');
        }
    }

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
        init() {
            this.form = document.getElementById('donationForm');
            this.coverInput = document.getElementById('mangaCover');
            this.coverPreview = document.getElementById('coverPreview');
            this.setupEventListeners();
        },

        setupEventListeners() {
            // Preview da imagem da capa
            if (this.coverInput) {
                this.coverInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            this.coverPreview.src = e.target.result;
                            this.coverPreview.style.display = 'block';
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Submissão do formulário
            if (this.form) {
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleDonation();
                });
            }
        },

        async handleDonation() {
            const formData = new FormData();
            formData.append('titulo', document.getElementById('mangaTitle').value);
            formData.append('autor', document.getElementById('mangaAuthor').value);
            formData.append('status', document.getElementById('mangaStatus').value);
            formData.append('nota', document.getElementById('mangaRating').value);
            formData.append('capitulos', document.getElementById('mangaChapters').value);
            formData.append('generos', document.getElementById('mangaGenres').value);
            formData.append('sinopse', document.getElementById('mangaSynopsis').value);
            formData.append('imagem', this.coverInput.files[0]);

            try {
                const response = await fetch('http://localhost:3001/api/mangas/donate', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    // Fechar o modal
                    const donationModal = bootstrap.Modal.getInstance(document.getElementById('donationModal'));
                    donationModal.hide();

                    // Limpar o formulário
                    this.form.reset();
                    this.coverPreview.style.display = 'none';

                    // Mostrar mensagem de sucesso
                    this.showNotification('Mangá doado com sucesso!', 'success');

                    // Atualizar a seção de últimas atualizações
                    this.updateLatestUpdates(data.manga);
                } else {
                    this.showNotification(data.message || 'Erro ao doar mangá', 'error');
                }
            } catch (error) {
                console.error('Erro ao doar mangá:', error);
                this.showNotification('Erro ao doar mangá. Tente novamente.', 'error');
            }
        },

        updateLatestUpdates(manga) {
            const updatesContainer = document.querySelector('.carousel-track');
            if (!updatesContainer) return;

            // Criar novo card
            const newCard = document.createElement('div');
            newCard.className = 'update-card';
            newCard.innerHTML = `
                <img src="${manga.imagem}" alt="${manga.titulo}">
                <div class="chapter-badge">Cap. ${manga.capitulos}</div>
                <div class="update-info">
                    <span class="update-time">Agora mesmo</span>
                    <span class="update-views"><i class="fas fa-eye"></i> 0</span>
                </div>
            `;

            // Adicionar o novo card no início do carrossel
            updatesContainer.insertBefore(newCard, updatesContainer.firstChild);

            // Remover o último card se houver mais de 10 cards
            const cards = updatesContainer.querySelectorAll('.update-card');
            if (cards.length > 10) {
                updatesContainer.removeChild(cards[cards.length - 1]);
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

})(); 