// Firebase Integration for User Site
import blogService from './blog-service.js';

// Initialize Firebase integration when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initFirebaseBlog();
});

// Initialize the blog site with Firebase data
async function initFirebaseBlog() {
    try {
        console.log('Initializing Firebase blog integration...');
        
        // Load featured posts
        await loadFeaturedPosts();
        
        // Load latest posts
        await loadLatestPosts();
        
        // Load categories
        await loadCategories();
        
        // Load recent posts for sidebar
        await loadRecentPosts();
        
        console.log('Firebase blog integration completed successfully');
    } catch (error) {
        console.error('Error initializing Firebase blog:', error);
        showErrorMessage('Failed to load blog content. Please try again later.');
    }
}

// Load featured posts
async function loadFeaturedPosts() {
    const featuredPosts = await blogService.getFeaturedPosts(3);
    const container = document.querySelector('.row.g-4.mb-5');
    
    if (container && featuredPosts.length > 0) {
        // Update the first featured post with real data
        const firstFeatured = container.querySelector('.col-lg-6:first-child .featured-content');
        if (firstFeatured && featuredPosts[0]) {
            const post = featuredPosts[0];
            firstFeatured.querySelector('h3').textContent = post.title;
            firstFeatured.querySelector('p').textContent = post.excerpt || post.content.substring(0, 100) + '...';
            
            // Update author info
            const authorInfo = firstFeatured.querySelector('.author-info small');
            if (authorInfo) {
                authorInfo.textContent = `By ${post.author?.name || 'Admin'}`;
            }
        }
    }
}

// Load latest posts grid
async function loadLatestPosts() {
    const posts = await blogService.getPublishedPosts(null, null, 1);
    const container = document.getElementById('postsGrid');
    
    if (container) {
        container.innerHTML = '';
        
        posts.forEach(post => {
            const postCard = createPostCard(post);
            container.appendChild(postCard);
        });
        
        // If no posts, show a message
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">No posts available yet. Please check back soon!</div>
                </div>
            `;
        }
    }
}

// Create a post card element
function createPostCard(post) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    const postCard = document.createElement('article');
    postCard.className = 'post-card h-100 overflow-hidden rounded-3 shadow-sm hover-shadow';
    
    postCard.innerHTML = `
        <div class="post-image-wrapper position-relative">
            <img src="${post.featuredImage || 'https://via.placeholder.com/500x300'}" class="img-fluid post-image" alt="${post.title}">
            <div class="overlay-gradient-post"></div>
            <span class="badge bg-info position-absolute top-3 end-3">${post.category?.name || 'Uncategorized'}</span>
        </div>
        <div class="post-body p-4">
            <div class="post-meta mb-2">
                <small class="text-muted"><i class="far fa-calendar me-1"></i>${formatDate(post.createdAt)}</small>
                <small class="text-muted ms-3"><i class="far fa-clock me-1"></i>${estimateReadingTime(post.content)} min read</small>
            </div>
            <h5 class="post-title fw-bold mb-2">${post.title}</h5>
            <p class="post-excerpt text-muted mb-3">${post.excerpt || post.content.substring(0, 150) + '...'}</p>
            <div class="d-flex justify-content-between align-items-center">
                <div class="author-avatar">
                    <img src="https://i.pravatar.cc/32?img=${Math.floor(Math.random() * 10) + 1}" class="rounded-circle" alt="Author">
                </div>
                <a href="pages/post-detail.html?slug=${post.slug}" class="btn-link-arrow">Continue Reading <i class="fas fa-arrow-right ms-1"></i></a>
            </div>
        </div>
    `;
    
    // Add click event to redirect to post detail
    postCard.addEventListener('click', function(e) {
        if (!e.target.closest('.btn-link-arrow')) {
            window.location.href = `pages/post-detail.html?slug=${post.slug}`;
        }
    });
    
    col.appendChild(postCard);
    return col;
}

// Load categories for the categories section
async function loadCategories() {
    const categories = await blogService.getCategories();
    const container = document.querySelector('.row.g-4');
    
    if (container) {
        // Find the categories section
        const categoriesSection = container.closest('.categories-section');
        if (categoriesSection) {
            const categoryCards = categoriesSection.querySelectorAll('.category-card');
            
            categories.slice(0, 4).forEach((category, index) => {
                if (categoryCards[index]) {
                    const card = categoryCards[index];
                    card.querySelector('h4').textContent = category.name;
                    card.querySelector('.text-muted').textContent = `${category.order || 0} Articles`;
                    
                    // Update link href
                    const link = card.querySelector('a');
                    if (link) {
                        link.href = `pages/search.html?category=${category.slug}`;
                    }
                }
            });
        }
    }
}

// Load recent posts for sidebar or other sections
async function loadRecentPosts() {
    const recentPosts = await blogService.getRecentPosts(5);
    
    // This would update sidebar widgets or other sections
    // Implementation depends on your specific layout needs
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function estimateReadingTime(content) {
    if (!content) return 1;
    const words = content.split(' ').length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
}

function showErrorMessage(message) {
    const container = document.querySelector('.container');
    if (container) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.textContent = message;
        container.insertBefore(alertDiv, container.firstChild);
    }
}

// Export for use in other modules
window.firebaseBlog = {
    loadFeaturedPosts,
    loadLatestPosts,
    loadCategories,
    loadRecentPosts,
    createPostCard
};