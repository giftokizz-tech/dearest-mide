// Admin Dashboard JavaScript - Firebase Integration
import authService from '../auth-service.js';
import { db, auth, storage } from '../firebase-config.js';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js';
import { collectionNames } from '../database-schema.js';

class AdminDashboard {
  constructor() {
    this.currentUser = null;
    this.currentSection = 'section-overview';
    this.init();
  }

  async init() {
    // Initialize Firebase auth listener
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        await this.loadDashboard();
        this.showSection('section-overview');
      } else {
        this.showLogin();
      }
    });
  }

  // Show login form
  showLogin() {
    document.body.innerHTML = `
      <div class="container d-flex align-items-center justify-content-center min-vh-100">
        <div class="card p-4" style="width: 100%; max-width: 400px;">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Admin Login</h2>
            <form id="loginForm">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            <div id="loginMessage" class="mt-3 text-center"></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
  }

  // Handle login
  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('loginMessage');

    try {
      const result = await authService.login(email, password);
      if (result.success) {
        messageEl.innerHTML = '<div class="alert alert-success">Login successful!</div>';
        setTimeout(() => {
          this.loadDashboard();
        }, 1000);
      }
    } catch (error) {
      messageEl.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  }

  // Load dashboard
  async loadDashboard() {
    // Check if running from file:// protocol
    if (window.location.protocol === 'file:') {
      this.showFileProtocolWarning();
      return;
    }

    // Load the admin HTML and integrate Firebase
    this.setupEventListeners();
    this.loadOverview();
  }

  // Show warning when running from file:// protocol
  showFileProtocolWarning() {
    const warningHtml = `
      <div class="container d-flex align-items-center justify-content-center min-vh-100">
        <div class="card p-4 text-center" style="width: 100%; max-width: 600px;">
          <div class="card-body">
            <h3 class="card-title text-danger mb-3">
              <i class="fas fa-exclamation-triangle me-2"></i>Security Warning
            </h3>
            <p class="card-text mb-4">
              The admin dashboard cannot run directly from the file system due to security restrictions.
              Firebase and external resources require a local development server.
            </p>
            <div class="alert alert-info mb-4">
              <strong>Recommended Solutions:</strong>
              <ul class="mb-0 mt-2">
                <li>Use <code>Live Server</code> extension in VS Code</li>
                <li>Run <code>python -m http.server</code> in project directory</li>
                <li>Use <code>npm http-server</code> or similar</li>
                <li>Deploy to a web server</li>
              </ul>
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-primary" onclick="window.open('https://marketplace.visualstudio.com/items?itemName=ritwickdey.liveserver', '_blank')">
                Install Live Server Extension
              </button>
              <button class="btn btn-outline-secondary" onclick="window.open('https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server', '_blank')">
                Learn More About Local Servers
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.innerHTML = warningHtml;
  }

  // Setup event listeners for admin interface
  setupEventListeners() {
    // Section navigation
    const navButtons = document.querySelectorAll('#sidebarNav .nav-link');
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target.getAttribute('data-target');
        this.showSection(target);
      });
    });

    // Mobile section selector
    const mobileSelect = document.getElementById('mobileSectionSelect');
    if (mobileSelect) {
      mobileSelect.addEventListener('change', (e) => {
        this.showSection(e.target.value);
      });
    }

    // Post management events
    this.setupPostEvents();
    
    // Category and tag events
    this.setupCategoryEvents();
    
    // User management events
    this.setupUserEvents();
  }

  // Show specific section
  showSection(sectionId) {
    this.currentSection = sectionId;
    
    // Update navigation
    document.querySelectorAll('#sidebarNav .nav-link').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-target') === sectionId) {
        btn.classList.add('active');
      }
    });

    // Update mobile selector
    const mobileSelect = document.getElementById('mobileSectionSelect');
    if (mobileSelect) {
      mobileSelect.value = sectionId;
    }

    // Show/hide sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
      section.classList.add('d-none');
      if (section.id === sectionId) {
        section.classList.remove('d-none');
      }
    });

    // Load section data
    switch (sectionId) {
      case 'section-overview':
        this.loadOverview();
        break;
      case 'section-posts':
        this.loadPosts();
        break;
      case 'section-categories':
        this.loadCategories();
        break;
      case 'section-users':
        this.loadUsers();
        break;
    }
  }

  // Load overview data
  async loadOverview() {
    try {
      // Get published posts count
      const postsQuery = query(collection(db, collectionNames.POSTS), where('status', '==', 'published'));
      const postsSnapshot = await getDocs(postsQuery);
      const publishedCount = postsSnapshot.size;

      // Update overview stats
      const stats = {
        totalPosts: 128, // This would come from a real count
        published: publishedCount,
        views: 42400,
        pendingComments: 34
      };

      // Update DOM elements (you'll need to add appropriate IDs to your HTML)
      this.updateOverviewStats(stats);
    } catch (error) {
      console.error('Error loading overview:', error);
    }
  }

  // Update overview statistics
  updateOverviewStats(stats) {
    const totalPostsEl = document.querySelector('.stat-value:nth-child(2)');
    const publishedEl = document.querySelector('.stat-value:nth-child(5)');
    const viewsEl = document.querySelector('.stat-value:nth-child(8)');
    const commentsEl = document.querySelector('.stat-value:nth-child(11)');

    if (totalPostsEl) totalPostsEl.textContent = stats.totalPosts;
    if (publishedEl) publishedEl.textContent = stats.published;
    if (viewsEl) viewsEl.textContent = this.formatNumber(stats.views);
    if (commentsEl) commentsEl.textContent = stats.pendingComments;
  }

  // Load posts management
  async loadPosts() {
    try {
      const postsQuery = query(collection(db, collectionNames.POSTS), orderBy('createdAt', 'desc'), limit(10));
      const postsSnapshot = await getDocs(postsQuery);
      
      const posts = [];
      postsSnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      this.renderPostsList(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  // Render posts list
  renderPostsList(posts) {
    const container = document.querySelector('#section-posts .table tbody');
    if (!container) return;

    container.innerHTML = '';
    posts.forEach(post => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="fw-semibold">${post.title}</div>
          <div class="small text-muted">Slug: ${post.slug}</div>
        </td>
        <td><span class="badge ${this.getStatusBadgeClass(post.status)}">${post.status}</span></td>
        <td>${post.category?.name || 'Uncategorized'}</td>
        <td>${post.views || 0}</td>
        <td>${this.formatDate(post.updatedAt)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="adminDashboard.editPost('${post.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-secondary" onclick="adminDashboard.deletePost('${post.id}')">Delete</button>
        </td>
      `;
      container.appendChild(row);
    });
  }

  // Load categories
  async loadCategories() {
    try {
      const categoriesQuery = query(collection(db, collectionNames.CATEGORIES), orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const categories = [];
      categoriesSnapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });

      this.renderCategoriesList(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  // Load users
  async loadUsers() {
    try {
      const users = await authService.getAllUsers();
      this.renderUsersList(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  // Utility methods
  getStatusBadgeClass(status) {
    switch (status) {
      case 'published': return 'badge-status-published';
      case 'draft': return 'badge-status-draft';
      case 'scheduled': return 'badge-status-scheduled';
      default: return 'badge-status-draft';
    }
  }

  formatDate(date) {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  // Event setup methods
  setupPostEvents() {
    // Add new post button
    const addPostBtn = document.getElementById('addPostBtn');
    if (addPostBtn) {
      addPostBtn.addEventListener('click', () => this.showPostForm());
    }

    // Post form submission
    const postForm = document.getElementById('postForm');
    if (postForm) {
      postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
    }

    // Category and tag management
    this.setupCategoryManagement();
    this.setupTagManagement();
  }

  // Show post creation form
  showPostForm() {
    const modal = document.getElementById('postModal');
    if (modal) {
      modal.style.display = 'block';
      this.loadFormOptions();
    }
  }

  // Load form options (categories, tags)
  async loadFormOptions() {
    try {
      // Load categories
      const categoriesQuery = query(collection(db, collectionNames.CATEGORIES), orderBy('name', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categoriesSelect = document.getElementById('postCategory');
      
      if (categoriesSelect) {
        categoriesSelect.innerHTML = '<option value="">Select Category</option>';
        categoriesSnapshot.forEach(doc => {
          const category = { id: doc.id, ...doc.data() };
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          categoriesSelect.appendChild(option);
        });
      }

      // Load tags
      const tagsQuery = query(collection(db, collectionNames.TAGS), orderBy('name', 'asc'));
      const tagsSnapshot = await getDocs(tagsQuery);
      const tagsContainer = document.getElementById('postTags');
      
      if (tagsContainer) {
        tagsContainer.innerHTML = '';
        tagsSnapshot.forEach(doc => {
          const tag = { id: doc.id, ...doc.data() };
          const checkbox = document.createElement('div');
          checkbox.className = 'form-check form-check-inline';
          checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" id="tag-${tag.id}" value="${tag.id}">
            <label class="form-check-label" for="tag-${tag.id}">${tag.name}</label>
          `;
          tagsContainer.appendChild(checkbox);
        });
      }
    } catch (error) {
      console.error('Error loading form options:', error);
    }
  }

  // Handle post form submission
  async handlePostSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const postData = {
      title: formData.get('postTitle'),
      slug: formData.get('postSlug'),
      excerpt: formData.get('postExcerpt'),
      content: formData.get('postContent'),
      status: formData.get('postStatus'),
      category: {
        id: formData.get('postCategory'),
        name: document.querySelector(`#postCategory option[value="${formData.get('postCategory')}"]`)?.textContent || ''
      },
      tags: Array.from(document.querySelectorAll('#postTags input[type="checkbox"]:checked')).map(cb => cb.value),
      author: {
        id: this.currentUser.uid,
        name: this.currentUser.displayName || this.currentUser.email,
        email: this.currentUser.email
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      likes: 0,
      commentsCount: 0
    };

    try {
      // Handle featured image upload
      const imageFile = document.getElementById('postImage').files[0];
      if (imageFile) {
        const imageUrl = await this.uploadImage(imageFile);
        postData.featuredImage = imageUrl;
      }

      // Save post
      const docRef = await addDoc(collection(db, collectionNames.POSTS), postData);
      
      // Show success message
      this.showNotification('Post created successfully!', 'success');
      
      // Close modal and refresh posts list
      this.closePostModal();
      this.loadPosts();
      
    } catch (error) {
      console.error('Error creating post:', error);
      this.showNotification('Error creating post: ' + error.message, 'error');
    }
  }

  // Upload image to Firebase Storage
  async uploadImage(file) {
    const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  // Close post modal
  closePostModal() {
    const modal = document.getElementById('postModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  setupCategoryEvents() {
    // Add event listeners for category management
  }

  setupUserEvents() {
    // Add event listeners for user management
  }

  // CRUD operations (to be implemented)
  async editPost(postId) {
    console.log('Edit post:', postId);
  }

  async deletePost(postId) {
    console.log('Delete post:', postId);
  }
}

// Initialize dashboard
const adminDashboard = new AdminDashboard();
window.adminDashboard = adminDashboard;