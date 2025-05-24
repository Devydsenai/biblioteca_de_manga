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
            // Implement search logic here
            console.log(`Searching for: ${searchTerm}`);
        }
    };

    /**
     * Handles card hover effects
     * @param {HTMLElement} card - The card element
     */
    const handleCardHover = (card) => {
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
        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Implement authentication logic here
            console.log(`${type} clicked`);
        });
    };

    /**
     * Handles "View All" links
     * @param {HTMLElement} link - The link element
     */
    const handleViewAll = (link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.closest('.section').querySelector('h2').textContent;
            // Implement view all logic here
            console.log(`View all clicked for: ${section}`);
        });
    };

    /**
     * Initializes all event listeners
     */
    const initializeEventListeners = () => {
        // Search functionality with debounce
        let searchTimeout;
        elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => handleSearch(e), CONFIG.searchDelay);
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
            this.setupEventListeners();
        },

        setupEventListeners() {
            // Login Form
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });

            // Register Form
            this.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });

            // Password Confirmation
            const registerPassword = document.getElementById('registerPassword');
            const confirmPassword = document.getElementById('registerConfirmPassword');
            
            confirmPassword.addEventListener('input', () => {
                if (registerPassword.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('As senhas não coincidem');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
        },

        async handleLogin() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            try {
                // Aqui você implementaria a chamada real para sua API
                console.log('Login attempt:', { email, password, rememberMe });
                
                // Simulação de login bem-sucedido
                this.showNotification('Login realizado com sucesso!', 'success');
                this.updateAvatarState(true);
                bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            } catch (error) {
                this.showNotification('Erro ao fazer login. Tente novamente.', 'error');
            }
        },

        async handleRegister() {
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;

            if (!agreeTerms) {
                this.showNotification('Você precisa concordar com os termos de uso.', 'error');
                return;
            }

            try {
                // Aqui você implementaria a chamada real para sua API
                console.log('Register attempt:', { name, email, password });
                
                // Simulação de registro bem-sucedido
                this.showNotification('Conta criada com sucesso!', 'success');
                this.updateAvatarState(true);
                bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            } catch (error) {
                this.showNotification('Erro ao criar conta. Tente novamente.', 'error');
            }
        },

        showNotification(message, type) {
            // Criar elemento de notificação
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;

            // Adicionar ao DOM
            document.body.appendChild(notification);

            // Animar entrada
            setTimeout(() => notification.classList.add('show'), 100);

            // Remover após 3 segundos
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },

        updateAvatarState(isLoggedIn) {
            const avatarBtn = document.querySelector('.avatar-btn');
            if (isLoggedIn) {
                avatarBtn.innerHTML = '<i class="fas fa-user-check"></i>';
                avatarBtn.classList.add('logged-in');
            } else {
                avatarBtn.innerHTML = '<i class="fas fa-user-circle"></i>';
                avatarBtn.classList.remove('logged-in');
            }
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

        setupEventListeners() {
            this.prevBtn.addEventListener('click', () => this.slide('prev'));
            this.nextBtn.addEventListener('click', () => this.slide('next'));
            window.addEventListener('resize', () => {
                this.cardsPerView = this.getCardsPerView();
                this.updateCarousel();
            });
        },

        slide(direction) {
            if (direction === 'next' && this.currentIndex < this.cards.length - this.cardsPerView) {
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
        
        function updateCarousel() {
            const offset = currentIndex * cardWidth;
            track.style.transform = `translateX(-${offset}px)`;
            
            // Atualiza estado dos botões
            prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
            nextButton.style.opacity = currentIndex >= cards.length - cardsPerView ? '0.5' : '1';
        }
        
        function nextSlide() {
            if (currentIndex < cards.length - cardsPerView) {
                currentIndex++;
                updateCarousel();
            }
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

})(); 