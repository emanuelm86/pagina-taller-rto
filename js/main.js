document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // NAVEGACIÓN MÓVIL (actualizar para nuevo ID)
    // ==========================================
    const mobileMenu = document.getElementById('mobile-menu') || document.getElementById('mobile-menu-nav');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Agregar delays escalonados a los elementos del menú
            if (navLinks.classList.contains('active')) {
                const menuItems = navLinks.querySelectorAll('a');
                menuItems.forEach((item, index) => {
                    item.style.setProperty('--item-index', index);
                });
            }
            
            // Maneja el atributo aria-expanded
            const isExpanded = mobileMenu.classList.contains('active');
            mobileMenu.setAttribute('aria-expanded', isExpanded);
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
                mobileMenu.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-expanded', 'false');
            }
        });
    }    // ==========================================
    // SCROLL TO TOP
    // ==========================================
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        let ticking = false;
        
        function updateScrollTop() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
            ticking = false;
        }
        
        // Throttle scroll events for better performance
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollTop);
                ticking = true;
            }
        }, { passive: true });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }    // ==========================================
    // TOGGLE DE TEMA CLARO/OSCURO (actualizar para nuevo ID)
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle') || document.getElementById('theme-toggle-nav');
    const themeToggleFloating = document.getElementById('theme-toggle-floating');
    const html = document.documentElement;
    
    // Detectar tema inicial
    function getInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        // Si no hay tema guardado, usar automático (sin atributo)
        return null;
    }
      // Aplicar tema
    function applyTheme(theme) {
        if (theme === null || theme === 'auto') {
            html.removeAttribute('data-theme');
            localStorage.removeItem('theme');
        } else {
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
        
        // Actualizar el estado del switch en mobile
        updateSwitchState();
    }
    
    // Actualizar el estado visual del switch iOS en mobile
    function updateSwitchState() {
        if (themeToggle) {
            const currentTheme = html.getAttribute('data-theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            // Determinar si debe estar activo (modo oscuro)
            const isDarkMode = currentTheme === 'dark' || (!currentTheme && prefersDark);
            
            if (isDarkMode) {
                themeToggle.classList.add('active');
            } else {
                themeToggle.classList.remove('active');
            }
        }
    }    // Cambiar tema
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        
        // Agregar animación de pulso a ambos botones
        if (themeToggle) themeToggle.classList.add('changing');
        if (themeToggleFloating) themeToggleFloating.classList.add('changing');
        
        setTimeout(() => {
            if (themeToggle) themeToggle.classList.remove('changing');
            if (themeToggleFloating) themeToggleFloating.classList.remove('changing');
        }, 600);
        
        if (!currentTheme) {
            // Si está en automático, cambiar al opuesto de la preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const newTheme = prefersDark ? 'light' : 'dark';
            applyTheme(newTheme);
        } else {
            // Si está en manual, alternar entre light y dark
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        }
    }
      // Escuchar cambios en las preferencias del sistema para suavizar transiciones
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (!html.hasAttribute('data-theme')) {
            // Solo aplicar transición suave si está en modo automático
            html.style.transition = 'color 0.3s ease, background-color 0.3s ease';
            setTimeout(() => {
                html.style.transition = '';
            }, 300);
            
            // Actualizar el estado del switch cuando cambia la preferencia del sistema
            updateSwitchState();
        }
    });
      // Inicializar tema
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);
    
    // Asegurar que el switch esté en el estado correcto al cargar la página
    updateSwitchState();    // Event listeners para ambos botones
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (themeToggleFloating) {
        themeToggleFloating.addEventListener('click', toggleTheme);
    }
});