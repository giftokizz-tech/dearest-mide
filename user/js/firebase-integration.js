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
        
        // Detect current page
        const path = window.location.pathname;
        const isPostPage = path.includes('post-detail.html');
        const isSearchPage = path.includes('search.html');
        const isHomePage = path.endsWith('index.html') || path.endsWith('/') || (!isPostPage && !isSearchPage);
        
        if (isHomePage) {
            await loadFeaturedPosts();
            await loadLatestPosts();
            await loadCategories();
        } else if (isPostPage) {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');
            if (slug) {
                await loadPostDetail(slug);
            }
            await loadSidebarData();
        } else if (isSearchPage) {
            await initSearchPage();
        }
        
        // Common elements (recent posts for sidebar if exists on other pages)
        if (!isPostPage) {
            await loadRecentPosts();
        }
        
        console.log('Firebase blog integration completed successfully');
    } catch (error) {
        console.error('Error initializing Firebase blog:', error);
    }
}

// Load featured posts
async function loadFeaturedPosts() {
    const featuredPosts = await blogService.getFeaturedPosts(2);
    const container = document.getElementById('featuredPostsGrid') || document.querySelector('.featured-section .row.g-4');
    
    if (container) {
        if (featuredPosts.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5 text-muted">No featured posts yet.</div>';
            return;
        }

        container.innerHTML = '';
        featuredPosts.forEach((post, index) => {
            const col = document.createElement('div');
            col.className = 'col-lg-6';
            col.setAttribute('data-aos', index % 2 === 0 ? 'fade-right' : 'fade-left');
            
            const excerpt = post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'No excerpt available.');

            col.innerHTML = `
                <div class="featured-card overflow-hidden h-100">
                    <div class="featured-image-wrapper">
                        <img src="${post.featuredImage || 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop'}" class="img-fluid featured-image" alt="${post.title}">
                        <div class="overlay-gradient"></div>
                        <span class="badge bg-primary position-absolute top-3 start-3">Featured</span>
                    </div>
                    <div class="featured-content p-4">
                        <h3 class="fw-bold mb-2">${post.title}</h3>
                        <p class="text-muted mb-3">${excerpt}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="author-info">
                                <img src="https://i.pravatar.cc/40?img=${index + 1}" class="rounded-circle me-2" alt="Author">
                                <small class="text-muted">${post.author?.name || 'Admin'}</small>
                            </div>
                            <a href="pages/post-detail.html?slug=${post.slug}" class="btn btn-primary btn-sm read-more-btn">Read More <i class="fas fa-arrow-right ms-2"></i></a>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    }
}

// Load latest posts grid
async function loadLatestPosts() {
    const posts = await blogService.getPublishedPosts(null, null, 1);
    const container = document.getElementById('postsGrid');
    
    if (container) {
        container.innerHTML = '';
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
                        <h4 class="text-muted mb-2">No Articles Yet</h4>
                        <p class="text-muted mb-4">Check back later for new content!</p>
                    </div>
                </div>
            `;
            return;
        }

        posts.forEach(post => {
            const postCard = createPostCard(post);
            container.appendChild(postCard);
        });
    }
}

// Create a post card element
function createPostCard(post) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    const postCard = document.createElement('article');
    postCard.className = 'post-card h-100 overflow-hidden rounded-3 shadow-sm hover-shadow';
    
    const dateStr = post.createdAt?.toDate ? formatDate(post.createdAt.toDate()) : (post.createdAt ? formatDate(post.createdAt) : 'Recently');
    const readingTime = estimateReadingTime(post.content);
    const excerpt = post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : '');

    const slugPrefix = window.location.pathname.includes('pages/') ? '' : 'pages/';

    postCard.innerHTML = `
        <div class="post-image-wrapper position-relative">
            <img src="${post.featuredImage || 'https://via.placeholder.com/500x300'}" class="img-fluid post-image" alt="${post.title}" style="height: 200px; width: 100%; object-fit: cover;">
            <div class="overlay-gradient-post"></div>
            <span class="badge bg-info position-absolute top-3 end-3">${post.category?.name || 'Uncategorized'}</span>
        </div>
        <div class="post-body p-4">
            <div class="post-meta mb-2">
                <small class="text-muted"><i class="far fa-calendar me-1"></i>${dateStr}</small>
                <small class="text-muted ms-3"><i class="far fa-clock me-1"></i>${readingTime} min read</small>
            </div>
            <h5 class="post-title fw-bold mb-2">${post.title}</h5>
            <p class="post-excerpt text-muted mb-3">${excerpt}</p>
            <div class="d-flex justify-content-between align-items-center">
                <div class="author-avatar">
                    <img src="https://i.pravatar.cc/32?img=${Math.floor(Math.random() * 10) + 1}" class="rounded-circle" alt="Author">
                </div>
                <a href="${slugPrefix}post-detail.html?slug=${post.slug}" class="btn-link-arrow">Read More <i class="fas fa-arrow-right ms-1"></i></a>
            </div>
        </div>
    `;
    
    col.appendChild(postCard);
    return col;
}

// Load post detail
async function loadPostDetail(slug) {
    const post = await blogService.getPostBySlug(slug);
    if (!post) {
        showErrorMessage('Post not found');
        return;
    }

    // Increment views
    blogService.incrementPostViews(post.id);

    // Update Page Title
    document.title = `${post.title} - Dearest Mide`;

    // Update Header
    const headerContent = document.getElementById('postHeaderContent');
    if (headerContent) {
        const dateStr = post.createdAt?.toDate ? formatDate(post.createdAt.toDate()) : (post.createdAt ? formatDate(post.createdAt) : 'Recently');
        headerContent.innerHTML = `
            <span class="badge bg-light text-dark mb-3">${post.category?.name || 'Uncategorized'}</span>
            <h1>${post.title}</h1>
            <div class="post-meta-header">
                <div class="post-meta-item">
                    <i class="far fa-calendar"></i>
                    <span>${dateStr}</span>
                </div>
                <div class="post-meta-item">
                    <i class="far fa-clock"></i>
                    <span>${estimateReadingTime(post.content)} min read</span>
                </div>
                <div class="post-meta-item">
                    <i class="far fa-eye"></i>
                    <span>${(post.views || 0) + 1} views</span>
                </div>
            </div>
        `;
    }

    // Update Featured Image
    const featuredImg = document.querySelector('main img.img-fluid');
    if (featuredImg && post.featuredImage) {
        featuredImg.src = post.featuredImage;
        featuredImg.alt = post.title;
    }

    // Update Author Info
    const authorCard = document.getElementById('authorCard');
    if (authorCard) {
        authorCard.innerHTML = `
            <img src="https://i.pravatar.cc/80?img=1" alt="${post.author?.name || 'Admin'}" class="author-avatar">
            <div class="flex-grow-1">
                <h5 class="mb-1">${post.author?.name || 'Admin'}</h5>
                <p class="author-bio">
                    Dedicated writer exploring the intersections of life, technology, and growth.
                </p>
                <div class="author-social">
                    <a href="#" class="text-primary" title="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="text-primary" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
                </div>
            </div>
        `;
    }

    // Update Content
    const contentArea = document.getElementById('postArticleContent');
    if (contentArea) {
        let contentHtml = post.content || '<p>No content available.</p>';
        
        // Add tags
        if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
            contentHtml += '<div class="post-tags mt-4">';
            post.tags.forEach(tag => {
                contentHtml += `<span class="tag-badge"><i class="fas fa-tag me-1"></i> ${tag}</span>`;
            });
            contentHtml += '</div>';
        }
        
        // Add share section
        contentHtml += `
            <div class="d-flex justify-content-between align-items-center mt-5 p-4 bg-light rounded-3">
                <div>
                    <p class="mb-0 fw-bold">Share this article:</p>
                </div>
                <div class="share-buttons">
                    <button class="share-btn twitter" title="Share on Twitter"><i class="fab fa-twitter"></i></button>
                    <button class="share-btn facebook" title="Share on Facebook"><i class="fab fa-facebook"></i></button>
                    <button class="share-btn linkedin" title="Share on LinkedIn"><i class="fab fa-linkedin"></i></button>
                    <button class="share-btn email" title="Share via Email"><i class="fas fa-envelope"></i></button>
                </div>
            </div>
        `;
        
        contentArea.innerHTML = contentHtml;
    }

    // Load related posts
    const relatedContainer = document.getElementById('relatedPostsGrid');
    if (relatedContainer && post.category?.id) {
        const relatedPosts = await blogService.getPostsByCategory(post.category.id, 3);
        const filteredRelated = relatedPosts.filter(p => p.id !== post.id).slice(0, 2);
        
        if (filteredRelated.length > 0) {
            relatedContainer.innerHTML = '';
            filteredRelated.forEach(rp => {
                relatedContainer.appendChild(createPostCard(rp));
            });
        } else {
            relatedContainer.innerHTML = '<div class="col-12 text-center text-muted">No related articles found.</div>';
        }
    }
}

// Sidebar Data Logic
async function loadSidebarData() {
    // Categories
    const categories = await blogService.getCategories();
    const categoriesList = document.getElementById('sidebarCategories');
    if (categoriesList) {
        categoriesList.innerHTML = '';
        categories.slice(0, 5).forEach(cat => {
            const li = document.createElement('li');
            li.className = 'mb-2';
            li.innerHTML = `<a href="search.html?category=${cat.slug}" class="text-decoration-none">${cat.name}</a>`;
            categoriesList.appendChild(li);
        });
    }

    // Popular Posts
    const popularPosts = await blogService.getRecentPosts(3); // Using recent for now
    const popularContainer = document.getElementById('sidebarPopularPosts');
    if (popularContainer) {
        popularContainer.innerHTML = '';
        popularPosts.forEach(post => {
            const div = document.createElement('div');
            div.className = 'mb-3 pb-3 border-bottom';
            div.innerHTML = `
                <h6 class="mb-1"><a href="post-detail.html?slug=${post.slug}" class="text-decoration-none">${post.title}</a></h6>
                <small class="text-muted"><i class="far fa-eye me-1"></i>${post.views || 0} views</small>
            `;
            popularContainer.appendChild(div);
        });
    }
}

// Search Page Logic
async function initSearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentQuery = urlParams.get('q') || '';
    const currentCategory = urlParams.get('category') || '';
    const currentTag = urlParams.get('tag') || '';
    
    // Set initial values
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = currentQuery;
    
    const filterSearch = document.getElementById('filterSearch');
    if (filterSearch) filterSearch.value = currentQuery;

    // Load and render posts
    await performSearch(currentQuery, currentCategory, currentTag);
    
    // Setup listeners
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value;
            performSearch(query);
        });
    }
    
    if (filterSearch) {
        filterSearch.addEventListener('input', debounce((e) => {
            performSearch(e.target.value);
        }, 500));
    }
    
    // Category filters
    await loadCategoryFilters(currentCategory);
}

async function performSearch(queryText = '', categorySlug = '', tagSlug = '') {
    const resultsContainer = document.getElementById('resultsContainer');
    const noResults = document.getElementById('noResults');
    const resultCount = document.getElementById('resultCount');
    
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>';
    
    const posts = await blogService.searchPosts(queryText, categorySlug, tagSlug);
    
    resultsContainer.innerHTML = '';
    if (posts.length === 0) {
        noResults.style.display = 'block';
        if (resultCount) resultCount.textContent = '0';
    } else {
        noResults.style.display = 'none';
        if (resultCount) resultCount.textContent = posts.length;
        posts.forEach(post => {
            resultsContainer.appendChild(createPostCard(post));
        });
    }
}

async function loadCategoryFilters(selectedSlug = '') {
    const categories = await blogService.getCategories();
    const container = document.getElementById('categoriesFilterGroup') || document.querySelector('.filter-group:nth-child(2)');
    if (!container) return;
    
    const h6 = container.querySelector('h6');
    container.innerHTML = '';
    if (h6) container.appendChild(h6);
    
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        const isChecked = cat.slug === selectedSlug ? 'checked' : '';
        div.innerHTML = `
            <input type="checkbox" id="cat-${cat.id}" class="form-check-input category-filter" ${isChecked} data-slug="${cat.slug}">
            <label for="cat-${cat.id}" class="form-check-label">${cat.name}</label>
        `;
        
        div.querySelector('input').addEventListener('change', () => {
            const checkedSlugs = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.dataset.slug);
            performSearch(document.getElementById('searchInput').value, checkedSlugs[0] || '');
        });
        
        container.appendChild(div);
    });
}

// Load categories for the categories section
async function loadCategories() {
    const categories = await blogService.getCategories();
    const container = document.getElementById('categoriesGrid') || document.querySelector('#categories .row.g-4');
    
    if (container) {
        if (categories.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted">No categories available.</div>';
            return;
        }

        container.innerHTML = '';
        categories.slice(0, 4).forEach((category, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-3';
            col.setAttribute('data-aos', 'flip-left');
            col.setAttribute('data-aos-delay', (index * 100).toString());
            
            const icons = ['fa-laptop-code', 'fa-heart', 'fa-globe', 'fa-book-open'];
            const colors = ['text-primary', 'text-danger', 'text-success', 'text-warning'];
            
            col.innerHTML = `
                <div class="category-card text-center p-4 rounded-3 h-100">
                    <div class="category-icon mb-3">
                        <i class="fas ${icons[index] || 'fa-folder'} fa-3x ${colors[index] || 'text-primary'}"></i>
                    </div>
                    <h4 class="fw-bold mb-2">${category.name}</h4>
                    <p class="text-muted mb-3">Explore Articles</p>
                    <a href="pages/search.html?category=${category.slug}" class="stretched-link"></a>
                </div>
            `;
            container.appendChild(col);
        });
    }
}

// Load recent posts for sidebar (other pages)
async function loadRecentPosts() {
    const recentPosts = await blogService.getRecentPosts(3);
    const popularContainer = document.getElementById('sidebarPopularPosts');
    
    if (popularContainer && recentPosts.length > 0) {
        popularContainer.innerHTML = '';
        const pathPrefix = window.location.pathname.includes('pages/') ? '' : 'pages/';

        recentPosts.forEach(post => {
            const div = document.createElement('div');
            div.className = 'mb-3 pb-3 border-bottom';
            div.innerHTML = `
                <h6 class="mb-1"><a href="${pathPrefix}post-detail.html?slug=${post.slug}" class="text-decoration-none">${post.title}</a></h6>
                <small class="text-muted"><i class="far fa-eye me-1"></i>${post.views || 0} views</small>
            `;
            popularContainer.appendChild(div);
        });
    }
}

// Utility functions
function formatDate(date) {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function estimateReadingTime(content) {
    if (!content) return 1;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

function showErrorMessage(message) {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div class="container py-5 text-center">
                <i class="fas fa-exclamation-triangle fa-4x text-warning mb-4"></i>
                <h2>${message}</h2>
                <p class="text-muted mt-3">The article you are looking for might have been moved or deleted.</p>
                <a href="../index.html" class="btn btn-primary mt-4">Back to Home</a>
            </div>
        `;
    }
}