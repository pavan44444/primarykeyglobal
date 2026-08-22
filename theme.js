/*
 * COMMON THEME CONTROLLER
 * Include this JS file in all your HTML pages for theme toggle functionality
 * Usage: <script src="path/to/theme.js"></script>
 */

// Theme Manager Class
class ThemeManager {
    constructor() {
        this.themeToggle = null;
        this.themeIcon = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Get theme toggle elements
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');

        // Load saved theme or default to dark
        this.loadTheme();

        // Add event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(savedTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (this.themeIcon) {
            this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Apply new theme
        this.applyTheme(newTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
        
        // Add a nice animation effect
        if (this.themeToggle) {
            this.themeToggle.style.transform = 'scale(0.9) rotate(180deg)';
            setTimeout(() => {
                this.themeToggle.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        }
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}