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
            <form id="loginForm" onsubmit="return false;">
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
    
    // Seed initial data if needed
    this.seedInitialData();
  }

  // Seed default categories and tags if they don't exist
  async seedInitialData() {
    try {
      const { defaultCategories, defaultTags } = await import('../database-schema.js');
      
      // Check categories
      const catSnap = await getDocs(collection(db, collectionNames.CATEGORIES));
      if (catSnap.empty) {
        console.log('Seeding default categories...');
        for (const cat of defaultCategories) {
          await addDoc(collection(db, collectionNames.CATEGORIES), {
            ...cat,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }

      // Check tags
      const tagSnap = await getDocs(collection(db, collectionNames.TAGS));
      if (tagSnap.empty) {
        console.log('Seeding default tags...');
        for (const tag of defaultTags) {
          await addDoc(collection(db, collectionNames.TAGS), {
            ...tag,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (err) {
      console.error('Error seeding data:', err);
    }
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
        const target = e.currentTarget.getAttribute('data-target');
        this.showSection(target);
      });
    });

    // New Post buttons
    const headerNewPostBtn = document.getElementById('headerNewPostBtn');
    if (headerNewPostBtn) {
      headerNewPostBtn.addEventListener('click', () => {
        this.showSection('section-posts');
        this.resetPostForm();
      });
    }

    const quickNewPostBtn = document.getElementById('quickNewPostBtn');
    if (quickNewPostBtn) {
      quickNewPostBtn.addEventListener('click', () => {
        this.showSection('section-posts');
        this.resetPostForm();
      });
    }

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

    // Update section title
    const sectionTitle = document.getElementById('sectionTitle');
    if (sectionTitle) {
      const titles = {
        'section-overview': 'Overview',
        'section-posts': 'Posts & Content',
        'section-categories': 'Categories & Tags',
        'section-scheduling': 'Drafts & Scheduling',
        'section-analytics': 'Analytics',
        'section-users': 'Users & Permissions',
        'section-seo': 'SEO Tools',
        'section-media': 'Media Library',
        'section-comments': 'Comments'
      };
      sectionTitle.textContent = titles[sectionId] || 'Dashboard';
    }

    // Load section data
    switch (sectionId) {
      case 'section-overview':
        // loadOverview will call loadRecentPostsOverview
        this.loadOverview();
        break;
      case 'section-posts':
        this.loadPosts();
        this.loadFormOptions();
        break;
      case 'section-categories':
        this.loadCategories();
        this.loadTags();
        break;
      case 'section-users':
        this.loadUsers();
        break;
    }
  }

  // Load overview data
  async loadOverview() {
    try {
      // Get posts count
      const postsSnapshot = await getDocs(collection(db, collectionNames.POSTS));
      const totalPosts = postsSnapshot.size;
      const publishedCount = postsSnapshot.docs.filter(d => d.data().status === 'published').length;
      console.log('Overview stats loaded:', { total: totalPosts, published: publishedCount });

      // Update overview stats
      const stats = {
        totalPosts: totalPosts,
        published: publishedCount,
        views: 0,
        pendingComments: 0
      };

      this.updateOverviewStats(stats);
      await this.loadRecentPostsOverview();
    } catch (error) {
      console.error('Error loading overview:', error);
    }
  }

  // Load recent posts for overview table
  async loadRecentPostsOverview() {
    try {
      console.log('Loading recent posts for overview...');
      const q = query(collection(db, collectionNames.POSTS));
      const snapshot = await getDocs(q);
      let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort in memory to avoid index requirement
      posts.sort((a, b) => this._getTimestampDate(b.createdAt) - this._getTimestampDate(a.createdAt));
      posts = posts.slice(0, 5);

      console.log('Recent posts found:', posts.length);
      
      const tbody = document.querySelector('#section-overview table tbody');
      if (!tbody) return;

      if (posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No posts yet</td></tr>';
        return;
      }

      tbody.innerHTML = posts.map(post => `
        <tr>
          <td>
            <div class="fw-semibold">${post.title}</div>
            <div class="small text-muted">${post.slug}</div>
          </td>
          <td><span class="badge ${this.getStatusBadgeClass(post.status)}">${post.status}</span></td>
          <td>${post.category?.name || '—'}</td>
          <td>${post.views || 0}</td>
          <td>${this.formatDate(post.updatedAt?.toDate ? post.updatedAt.toDate() : post.updatedAt)}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.log('Error loading recent posts overview:', error);
    }
  }

  // Update overview statistics
  updateOverviewStats(stats) {
    const statCards = document.querySelectorAll('.stat-value');
    if (statCards.length >= 4) {
      statCards[0].textContent = stats.totalPosts;
      statCards[1].textContent = stats.published;
      statCards[2].textContent = this.formatNumber(stats.views);
      statCards[3].textContent = stats.pendingComments;
    }
  }

  // Load posts management
  async loadPosts() {
    try {
      const postsQuery = query(collection(db, collectionNames.POSTS));
      const postsSnapshot = await getDocs(postsQuery);
      
      const posts = [];
      postsSnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      // Sort in memory
      posts.sort((a, b) => this._getTimestampDate(b.createdAt) - this._getTimestampDate(a.createdAt));

      this.renderPostsList(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  // Render posts list
  renderPostsList(posts) {
    const container = document.querySelector('#section-posts table:last-of-type tbody');
    if (!container) return;

    if (posts.length === 0) {
      container.innerHTML = '<tr><td colspan="5" class="text-center py-4">No posts found</td></tr>';
      return;
    }

    container.innerHTML = '';
    posts.forEach(post => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="fw-semibold">${post.title}</div>
          <div class="small text-muted">Slug: ${post.slug}</div>
        </td>
        <td><span class="badge ${this.getStatusBadgeClass(post.status)}">${post.status}</span></td>
        <td>${post.author?.name || 'Unknown'}</td>
        <td>${post.status === 'published' ? this.formatDate(post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt) : '—'}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="adminDashboard.editPost('${post.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.deletePost('${post.id}')">Delete</button>
        </td>
      `;
      container.appendChild(row);
    });
  }

  // Load categories
  async loadCategories() {
    try {
      const categoriesSnapshot = await getDocs(collection(db, collectionNames.CATEGORIES));
      const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      categories.sort((a, b) => a.name.localeCompare(b.name));

      this.renderCategoriesList(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  renderCategoriesList(categories) {
    const container = document.querySelector('#section-categories table tbody');
    if (!container) return;
    
    if (categories.length === 0) {
      container.innerHTML = '<tr><td colspan="3" class="text-center py-4">No categories yet</td></tr>';
      return;
    }

    container.innerHTML = categories.map(cat => `
      <tr>
        <td>${cat.name}</td>
        <td>0</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-1">Edit</button>
          <button class="btn btn-sm btn-outline-danger">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // Load tags
  async loadTags() {
    try {
      const tagsSnapshot = await getDocs(collection(db, collectionNames.TAGS));
      const tags = tagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      tags.sort((a, b) => a.name.localeCompare(b.name));

      this.renderTagsList(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  }

  renderTagsList(tags) {
    const container = document.querySelectorAll('#section-categories table tbody')[1];
    if (!container) return;
    
    if (tags.length === 0) {
      container.innerHTML = '<tr><td colspan="3" class="text-center py-4">No tags yet</td></tr>';
      return;
    }

    container.innerHTML = tags.map(tag => `
      <tr>
        <td>
          <span class="badge" style="background-color: ${tag.color || '#6c757d'}">${tag.name}</span>
        </td>
        <td>0</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-1">Edit</button>
          <button class="btn btn-sm btn-outline-danger">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // Load users
  async loadUsers() {
    try {
      const usersQuery = query(collection(db, collectionNames.USERS));
      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.renderUsersList(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  renderUsersList(users) {}

  // Utility methods
  getStatusBadgeClass(status) {
    switch (status) {
      case 'published': return 'bg-success';
      case 'draft': return 'bg-secondary';
      case 'scheduled': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  formatDate(date) {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  // Event setup methods
  setupPostEvents() {
    // Post form submission
    const postForm = document.getElementById('postForm');
    if (postForm) {
      postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
    }

    // Auto-slug generation
    const titleInput = document.getElementById('postTitle');
    const slugInput = document.getElementById('postSlug');
    if (titleInput && slugInput) {
      titleInput.addEventListener('input', (e) => {
        if (!slugInput.dataset.manual) {
          slugInput.value = this.generateSlug(e.target.value);
        }
      });
      slugInput.addEventListener('input', () => {
        slugInput.dataset.manual = 'true';
      });
    }

    // Image preview
    const imageInput = document.getElementById('postImage');
    const imagePreview = document.getElementById('imagePreview');
    if (imageInput && imagePreview) {
      imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            imagePreview.querySelector('img').src = event.target.result;
            imagePreview.classList.remove('d-none');
          };
          reader.readAsDataURL(file);
        } else {
          imagePreview.classList.add('d-none');
        }
      });
    }

    // Save as Draft button
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn && postForm) {
      saveDraftBtn.addEventListener('click', () => {
        const draftRadio = document.getElementById('statusDraft');
        if (draftRadio) draftRadio.checked = true;
        postForm.requestSubmit();
      });
    }
  }

  generateSlug(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  _getTimestampDate(timestamp) {
    if (!timestamp) return new Date(0);
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'string' || typeof timestamp === 'number') return new Date(timestamp);
    return new Date(); // Default to now for new posts pending server timestamp
  }

  resetPostForm() {
    const form = document.getElementById('postForm');
    if (form) {
      form.reset();
      document.getElementById('postId').value = '';
      const slugInput = document.getElementById('postSlug');
      if (slugInput) slugInput.dataset.manual = '';
      const imagePreview = document.getElementById('imagePreview');
      if (imagePreview) imagePreview.classList.add('d-none');
      const statusDraft = document.getElementById('statusDraft');
      if (statusDraft) statusDraft.checked = true;
    }
  }

  // Load form options (categories, tags)
  async loadFormOptions() {
    try {
      // Load categories
      const categoriesSnapshot = await getDocs(collection(db, collectionNames.CATEGORIES));
      const categoriesSelect = document.getElementById('postCategory');
      
      if (categoriesSelect) {
        const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        categories.sort((a, b) => a.name.localeCompare(b.name));

        categoriesSelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          categoriesSelect.appendChild(option);
        });
      }

      // Load tags
      const tagsSnapshot = await getDocs(collection(db, collectionNames.TAGS));
      const tagsContainer = document.getElementById('postTags');
      
      if (tagsContainer) {
        const tags = tagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        tags.sort((a, b) => a.name.localeCompare(b.name));

        tagsContainer.innerHTML = '';
        if (tags.length === 0) {
          tagsContainer.innerHTML = '<div class="small text-muted">No tags available</div>';
        }
        tags.forEach(tag => {
          const checkbox = document.createElement('div');
          checkbox.className = 'form-check';
          checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" name="postTags" id="tag-${tag.id}" value="${tag.id}">
            <label class="form-check-label small" for="tag-${tag.id}">${tag.name}</label>
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
    
    const form = e.target;
    const formData = new FormData(form);
    const postId = formData.get('postId');
    
    // Check if category is selected
    const categoryId = formData.get('postCategory');
    let categoryObj = { id: '', name: 'Uncategorized' };
    if (categoryId) {
      const categorySelect = document.getElementById('postCategory');
      categoryObj = {
        id: categoryId,
        name: categorySelect.options[categorySelect.selectedIndex].text
      };
    }

    const postData = {
      title: formData.get('postTitle'),
      slug: formData.get('postSlug'),
      excerpt: formData.get('postExcerpt'),
      content: formData.get('postContent'),
      status: formData.get('postStatus'),
      category: categoryObj,
      tags: Array.from(form.querySelectorAll('input[name="postTags"]:checked')).map(cb => cb.value),
      updatedAt: serverTimestamp()
    };

    // Add author info for new posts
    if (!postId) {
      postData.author = {
        id: this.currentUser.uid,
        name: this.currentUser.displayName || this.currentUser.email.split('@')[0],
        email: this.currentUser.email
      };
      postData.createdAt = serverTimestamp();
      postData.views = 0;
      postData.likes = 0;
      postData.commentsCount = 0;
    }

    try {
      this.setLoading(true);

      // Handle featured image upload
      const imageFile = document.getElementById('postImage').files[0];
      if (imageFile) {
        const imageUrl = await this.uploadImage(imageFile);
        postData.featuredImage = imageUrl;
      }

      if (postId) {
        console.log('Updating post:', postId, postData);
        await updateDoc(doc(db, collectionNames.POSTS, postId), postData);
        this.showNotification('Post updated successfully!', 'success');
      } else {
        console.log('Creating new post:', postData);
        const docRef = await addDoc(collection(db, collectionNames.POSTS), postData);
        console.log('Post created with ID:', docRef.id);
        this.showNotification('Post published successfully!', 'success');
      }
      
      this.resetPostForm();
      this.showSection('section-overview');
      
    } catch (error) {
      console.error('Error saving post:', error);
      this.showNotification('Error saving post: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
      publishBtn.disabled = isLoading;
      publishBtn.innerHTML = isLoading ? '<span class="spinner-border spinner-border-sm me-2"></span>Saving...' : 'Publish';
    }
  }

  // Upload image to Firebase Storage
  async uploadImage(file) {
    const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : (type === 'success' ? 'success' : 'info')} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  }

  // CRUD operations
  async editPost(postId) {
    try {
      this.showSection('section-posts');
      this.setLoading(true);
      
      const postDoc = await getDoc(doc(db, collectionNames.POSTS, postId));
      if (!postDoc.exists()) {
        this.showNotification('Post not found', 'error');
        return;
      }

      const post = postDoc.data();
      
      // Fill form
      document.getElementById('postId').value = postId;
      document.getElementById('postTitle').value = post.title;
      document.getElementById('postSlug').value = post.slug;
      document.getElementById('postSlug').dataset.manual = 'true';
      document.getElementById('postExcerpt').value = post.excerpt || '';
      document.getElementById('postContent').value = post.content;
      document.getElementById('postCategory').value = post.category?.id || '';
      
      // Select tags
      const tagCheckboxes = document.querySelectorAll('input[name="postTags"]');
      tagCheckboxes.forEach(cb => {
        cb.checked = post.tags?.includes(cb.value);
      });

      // Status
      const statusRadio = document.querySelector(`input[name="postStatus"][value="${post.status}"]`);
      if (statusRadio) statusRadio.checked = true;

      // Image
      if (post.featuredImage) {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.querySelector('img').src = post.featuredImage;
        imagePreview.classList.remove('d-none');
      } else {
        document.getElementById('imagePreview').classList.add('d-none');
      }

    } catch (error) {
      console.error('Error loading post for edit:', error);
      this.showNotification('Error loading post: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, collectionNames.POSTS, postId));
      this.showNotification('Post deleted successfully', 'success');
      this.loadPosts();
      if (this.currentSection === 'section-overview') {
        this.loadOverview();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      this.showNotification('Error deleting post: ' + error.message, 'error');
    }
  }

  setupCategoryManagement() {
    const catForm = document.querySelector('#section-categories form');
    if (catForm) {
      catForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = catForm.querySelector('input[placeholder="Category name"]');
        const slugInput = catForm.querySelector('input[placeholder="productivity"]');
        const descInput = catForm.querySelector('textarea');
        
        if (!nameInput || !slugInput) return;

        try {
          await addDoc(collection(db, collectionNames.CATEGORIES), {
            name: nameInput.value,
            slug: slugInput.value,
            description: descInput.value,
            order: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          this.showNotification('Category added', 'success');
          catForm.reset();
          this.loadCategories();
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  setupTagManagement() {
    const tagForm = document.querySelectorAll('#section-categories form')[1];
    if (tagForm) {
      tagForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = tagForm.querySelector('input[placeholder="Tag name"]');
        const slugInput = tagForm.querySelector('input[placeholder="tag-slug"]');
        const colorInput = tagForm.querySelector('input[type="color"]');
        
        if (!nameInput || !slugInput) return;

        try {
          await addDoc(collection(db, collectionNames.TAGS), {
            name: nameInput.value,
            slug: slugInput.value,
            color: colorInput.value,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          this.showNotification('Tag added', 'success');
          tagForm.reset();
          this.loadFormOptions();
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  setupCategoryEvents() {
    this.setupCategoryManagement();
    this.setupTagManagement();
  }
  setupUserEvents() {}
}

const adminDashboard = new AdminDashboard();
window.adminDashboard = adminDashboard;