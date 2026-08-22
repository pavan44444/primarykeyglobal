// loadHeader.js - Dynamically load header into any page

(async function loadHeader() {
    try {
        // Fetch the header HTML
        const response = await fetch('../components/header.html');
        
        if (!response.ok) {
            throw new Error('Failed to load header');
        }
        
        const headerHTML = await response.text();
        
        // Insert header at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        
        // Initialize header functionality after DOM is ready
        initializeHeader();
        
    } catch (error) {
        console.error('Error loading header:', error);
        // Fallback: Show a simple error or continue without header
    }
})();

function initializeHeader() {
    // Add padding to body to account for fixed header
    document.body.classList.add('has-header');
    
    // Load user info
    loadUserInfo();
    
    // Setup theme toggle
    setupThemeToggle();
    
    // Setup logout
    setupLogout();
    
    // Setup profile dropdown
    setupProfileDropdown();
}

function loadUserInfo() {
    // Get user info from localStorage
    const userName = localStorage.getItem('userName') || 'User';
    const userRole = localStorage.getItem('userRole') || 'user';
    
    // Update profile display
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileName) profileName.textContent = userName;
    if (profileRole) profileRole.textContent = userRole;
    
    // Set avatar initials
    if (profileAvatar) {
        const initials = userName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        profileAvatar.textContent = initials;
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    if (!themeToggle || !themeIcon) return;
    
    // Set initial theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeIcon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
    
    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const dropdownLogout = document.getElementById('dropdownLogout');
    
    const handleLogout = () => {
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('college_id');
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = '../auth/registration.html';
    };
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

function setupProfileDropdown() {
    const profileBtn = document.getElementById('headerProfile');
    const dropdown = document.getElementById('profileDropdown');
    
    if (!profileBtn || !dropdown) return;
    
    // Toggle dropdown
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Handle dropdown items
    const viewProfile = document.getElementById('viewProfile');
    const settings = document.getElementById('settings');
    
    if (viewProfile) {
        viewProfile.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate to profile page
            window.location.href = '../dashboard/profile.html';
            dropdown.classList.remove('active');
        });
    }
    
    if (settings) {
        settings.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate to settings page
            console.log('Settings clicked');
            dropdown.classList.remove('active');
        });
    }
}

// Check authentication on page load
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../auth/registration.html';
        return false;
    }
    return true;
}

// Run auth check
checkAuth();