/* ===================== */
/* APP.JS - MAIN APPLICATION */
/* ===================== */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });

    // Initialize components
    initThemeToggle();
    initBackToTop();
    initSearch();
    initNewsletter();
    initDynamicContent();
    initScrollAnimations();
}

/* ===================== */
/* THEME TOGGLE */
/* ===================== */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const body = document.body;

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light-mode';
    applyTheme(savedTheme);

    // Theme toggle click handler
    themeToggle?.addEventListener('click', function() {
        const currentTheme = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        const newTheme = currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
        applyTheme(newTheme);
    });

    function applyTheme(theme) {
        if (theme === 'dark-mode') {
            body.classList.add('dark-mode');
            themeToggle?.classList.add('active');
            themeToggle?.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('dark-mode');
            themeToggle?.classList.remove('active');
            themeToggle?.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('theme', theme);
    }
}

/* ===================== */
/* BACK TO TOP BUTTON */
/* ===================== */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    // Show button when scrolled down
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn?.classList.add('show');
        } else {
            backToTopBtn?.classList.remove('show');
        }
    });

    // Scroll to top
    backToTopBtn?.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ===================== */
/* SEARCH FUNCTIONALITY */
/* ===================== */
function initSearch() {
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    const heroSearch = document.getElementById('heroSearch');

    heroSearchBtn?.addEventListener('click', function() {
        const query = heroSearch?.value.trim();
        if (query) {
            redirectToSearch(query);
        }
    });

    heroSearch?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query) {
                redirectToSearch(query);
            }
        }
    });

    function redirectToSearch(query) {
        window.location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
    }
}

/* ===================== */
/* NEWSLETTER SUBSCRIPTION */
/* ===================== */
function initNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');

    newsletterForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = this.querySelector('input[type="email"]').value;
        const button = this.querySelector('button');
        const originalText = button.textContent;

        // Simulate submission
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';

        setTimeout(() => {
            // Success
            button.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
            button.classList.add('btn-success');
            button.classList.remove('btn-light');

            // Reset after 3 seconds
            setTimeout(() => {
                this.reset();
                button.disabled = false;
                button.textContent = originalText;
                button.classList.remove('btn-success');
                button.classList.add('btn-light');
            }, 3000);

            // Save email
            saveNewsletterEmail(email);
        }, 1500);
    });

    function saveNewsletterEmail(email) {
        const emails = JSON.parse(localStorage.getItem('newsletterEmails') || '[]');
        if (!emails.includes(email)) {
            emails.push(email);
            localStorage.setItem('newsletterEmails', JSON.stringify(emails));
        }
    }
}

/* ===================== */
/* DYNAMIC CONTENT LOADING */
/* ===================== */
function initDynamicContent() {
    // Simulate loading more posts (In production, this would be an API call)
    const loadMoreBtn = document.querySelector('.btn-load-more');

    loadMoreBtn?.addEventListener('click', function() {
        loadMorePosts();
    });

    function loadMorePosts() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

        // Simulate API call
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Loaded! Redirecting...';
            button.classList.add('btn-success');

            // Redirect to search/all posts
            setTimeout(() => {
                window.location.href = 'pages/search.html';
            }, 1000);
        }, 1500);
    }
}

/* ===================== */
/* SCROLL ANIMATIONS */
/* ===================== */
function initScrollAnimations() {
    // Add animation to navbar on scroll
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            navbar?.classList.add('shadow-lg');
        } else {
            navbar?.classList.remove('shadow-lg');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // Add stagger animation to post cards
    observePostCards();
}

function observePostCards() {
    const postCards = document.querySelectorAll('.post-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = `slideInUp 0.6s ease forwards`;
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1
    });

    postCards.forEach(card => observer.observe(card));
}

/* ===================== */
/* UTILITY FUNCTIONS */
/* ===================== */

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const obj = {};
    for (let [key, value] of params.entries()) {
        obj[key] = value;
    }
    return obj;
}

// Generate random ID
function generateId() {
    return 'id' + Math.random().toString(16).slice(2);
}

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed`;
    toast.style.cssText = 'bottom: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, duration);
}

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ===================== */
/* DATA MANAGEMENT */
/* ===================== */

// Mock data for posts (In production, this would come from API)
const mockPosts = [
    {
        id: 1,
        title: "The Future of Web Development in 2024",
        excerpt: "Explore the latest trends and technologies shaping the web development landscape...",
        content: "Full article content here...",
        image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop",
        author: { name: "John Developer", avatar: "https://i.pravatar.cc/40?img=1" },
        category: "Technology",
        tags: ["web", "development", "trends"],
        date: "2024-03-08",
        readTime: 5,
        views: 1250,
        likes: 342
    },
    {
        id: 2,
        title: "Mastering Bootstrap: From Basics to Advanced",
        excerpt: "A comprehensive guide to building responsive web applications with Bootstrap 5...",
        content: "Full article content here...",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
        author: { name: "Sarah Designer", avatar: "https://i.pravatar.cc/40?img=2" },
        category: "Design",
        tags: ["bootstrap", "css", "responsive"],
        date: "2024-03-07",
        readTime: 8,
        views: 980,
        likes: 256
    }
];

// Get all posts
function getAllPosts() {
    return mockPosts;
}

// Get post by ID
function getPostById(id) {
    return mockPosts.find(post => post.id === id);
}

// Search posts
function searchPosts(query) {
    return mockPosts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
}

// Filter posts by category
function filterPostsByCategory(category) {
    return mockPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
}

// Get related posts
function getRelatedPosts(postId, limit = 3) {
    const post = getPostById(postId);
    if (!post) return [];

    return mockPosts.filter(p =>
        p.id !== postId &&
        (p.category === post.category || p.tags.some(tag => post.tags.includes(tag)))
    ).slice(0, limit);
}

/* ===================== */
/* LOCAL STORAGE HELPERS */
/* ===================== */

// Save user preference
function savePreference(key, value) {
    localStorage.setItem(`pref_${key}`, JSON.stringify(value));
}

// Get user preference
function getPreference(key) {
    const item = localStorage.getItem(`pref_${key}`);
    return item ? JSON.parse(item) : null;
}

// Clear all preferences
function clearPreferences() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('pref_')) {
            localStorage.removeItem(key);
        }
    });
}

/* ===================== */
/* API SIMULATION */
/* ===================== */

// Simulate API calls
const API = {
    // Get posts with pagination
    getPosts: async (page = 1, limit = 12) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: mockPosts.slice((page - 1) * limit, page * limit),
                    total: mockPosts.length,
                    page,
                    limit
                });
            }, 500);
        });
    },

    // Like a post
    likePost: async (postId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Post liked!' });
            }, 300);
        });
    },

    // Add comment
    addComment: async (postId, comment) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Comment added!', data: comment });
            }, 500);
        });
    },

    // Subscribe to newsletter
    subscribeNewsletter: async (email) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Subscribed successfully!' });
            }, 1000);
        });
    }
};

/* ===================== */
/* EXPORT FUNCTIONS */
/* ===================== */

// Make functions available globally
window.appUtils = {
    formatDate,
    truncateText,
    getUrlParams,
    generateId,
    showToast,
    debounce,
    throttle,
    getAllPosts,
    getPostById,
    searchPosts,
    filterPostsByCategory,
    getRelatedPosts,
    savePreference,
    getPreference,
    clearPreferences,
    API
};

console.log('✨ Dearest Mide Blog App Initialized');
console.log('Available utilities:', window.appUtils);
