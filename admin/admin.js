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
    // Load the admin HTML and integrate Firebase
    this.setupEventListeners();
    this.loadOverview();
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

  // Event setup methods (placeholders for now)
  setupPostEvents() {
    // Add event listeners for post management
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