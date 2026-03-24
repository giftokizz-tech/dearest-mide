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
      this.toggleAuthView(!!user);
      if (user) {
        this.currentUser = user;
        this.updateWelcomeMessage(user);
        await this.loadDashboard();
        this.showSection('section-overview');
      }
    });

    // Setup Login Form listener (always attached since loginWrapper is in DOM)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }
  }

  toggleAuthView(isLoggedIn) {
    const loginWrapper = document.getElementById('loginWrapper');
    const dashboardWrapper = document.getElementById('dashboardWrapper');
    
    if (isLoggedIn) {
      loginWrapper.classList.add('d-none');
      dashboardWrapper.classList.remove('d-none');
    } else {
      loginWrapper.classList.remove('d-none');
      dashboardWrapper.classList.add('d-none');
    }
  }

  updateWelcomeMessage(user) {
    const welcome = document.getElementById('adminWelcome');
    if (welcome) {
      welcome.textContent = `Welcome back, ${user.displayName || user.email}`;
    }
  }

  // Handle Login
  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('loginSubmitBtn');
    const messageEl = document.getElementById('loginMessage');

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
      
      const result = await authService.login(email, password);
      if (result.success) {
        // Auth state change will handle the transition
        messageEl.className = 'mt-3 text-center small text-success';
        messageEl.textContent = 'Success! Redirecting...';
      }
    } catch (error) {
      messageEl.className = 'mt-3 text-center small text-danger';
      messageEl.textContent = error.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In to Dashboard';
    }
  }

  // Handle Logout
  async handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      await authService.signOut();
      window.location.reload(); // Hard refresh to clear state
    }
  }

  // Load dashboard
  async loadDashboard() {
    // Check if running from file:// protocol
    if (window.location.protocol === 'file:') {
      this.showFileProtocolWarning();
      return;
    }

    this.setupEventListeners();
    this.loadOverview();
    this.seedInitialData();
  }

  // Seed default categories and tags if they don't exist
  async seedInitialData() {
    try {
      const { defaultCategories, defaultTags } = await import('../database-schema.js');
      
      const catSnap = await getDocs(collection(db, collectionNames.CATEGORIES));
      if (catSnap.empty) {
        for (const cat of defaultCategories) {
          await addDoc(collection(db, collectionNames.CATEGORIES), { ...cat, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
      }

      const tagSnap = await getDocs(collection(db, collectionNames.TAGS));
      if (tagSnap.empty) {
        for (const tag of defaultTags) {
          await addDoc(collection(db, collectionNames.TAGS), { ...tag, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
      }
    } catch (err) {
      console.error('Error seeding data:', err);
    }
  }

  // Setup event listeners for admin interface
  setupEventListeners() {
    // Section navigation
    const navButtons = document.querySelectorAll('#sidebarNav .nav-link');
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-target');
        if (target) this.showSection(target);
      });
    });

    // New Post buttons
    const headerBtn = document.getElementById('headerNewPostBtn');
    if (headerBtn) {
      headerBtn.addEventListener('click', () => {
        this.showSection('section-posts');
        this.resetPostForm();
      });
    }

    this.setupPostEvents();
    this.setupCategoryEvents();
  }

  // Show specific section
  showSection(sectionId) {
    this.currentSection = sectionId;
    
    // Update navigation
    document.querySelectorAll('#sidebarNav .nav-link').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-target') === sectionId);
    });

    // Show/hide sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
      section.classList.toggle('d-none', section.id !== sectionId);
    });

    // Update section title
    const sectionTitle = document.getElementById('sectionTitle');
    if (sectionTitle) {
      const titles = {
        'section-overview': 'Overview',
        'section-posts': 'Posts & Content',
        'section-categories': 'Categories & Tags',
        'section-comments': 'Comments'
      };
      sectionTitle.textContent = titles[sectionId] || 'Dashboard';
    }

    // Load section data
    switch (sectionId) {
      case 'section-overview': this.loadOverview(); break;
      case 'section-posts': this.loadPosts(); this.loadFormOptions(); break;
      case 'section-categories': this.loadCategories(); this.loadTags(); break;
    }
  }

  // Load overview data
  async loadOverview() {
    try {
      const postsSnapshot = await getDocs(collection(db, collectionNames.POSTS));
      const totalPosts = postsSnapshot.size;
      const publishedCount = postsSnapshot.docs.filter(d => d.data().status === 'published').length;

      this.updateOverviewStats({
        totalPosts,
        published: publishedCount,
        views: 0,
        comments: 0
      });
      
      await this.loadRecentPostsOverview();
    } catch (error) {
      console.error('Error loading overview:', error);
    }
  }

  async loadRecentPostsOverview() {
    try {
      const q = query(collection(db, collectionNames.POSTS));
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      posts.sort((a, b) => this._getTimestampDate(b.createdAt) - this._getTimestampDate(a.createdAt));
      const recentPosts = posts.slice(0, 5);
      
      const tbody = document.querySelector('#section-overview table tbody');
      if (!tbody) return;

      if (recentPosts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted small">No posts yet</td></tr>';
        return;
      }

      tbody.innerHTML = recentPosts.map(post => `
        <tr>
          <td>
            <div class="fw-semibold small">${post.title}</div>
            <div class="text-muted" style="font-size: 0.7rem;">${post.slug}</div>
          </td>
          <td><span class="badge ${post.status === 'published' ? 'bg-success' : 'bg-secondary'} small">${post.status}</span></td>
          <td class="small">${post.category?.name || '—'}</td>
          <td class="small text-muted">${this.formatDate(post.createdAt)}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.log('Error loading recent posts:', error);
    }
  }

  updateOverviewStats(stats) {
    const mappings = {
      'stat-total-posts': stats.totalPosts,
      'stat-published-posts': stats.published,
      'stat-views': stats.views,
      'stat-comments': stats.comments
    };

    for (const [id, value] of Object.entries(mappings)) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }
  }

  async loadPosts() {
    try {
      const snapshot = await getDocs(collection(db, collectionNames.POSTS));
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      posts.sort((a, b) => this._getTimestampDate(b.createdAt) - this._getTimestampDate(a.createdAt));
      this.renderPostsList(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  renderPostsList(posts) {
    const container = document.querySelector('#section-posts table tbody');
    if (!container) return;

    if (posts.length === 0) {
      container.innerHTML = '<tr><td colspan="4" class="text-center py-4">No posts found</td></tr>';
      return;
    }

    container.innerHTML = '';
    posts.forEach(post => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="small fw-semibold">${post.title}</td>
        <td><span class="badge ${post.status === 'published' ? 'bg-success' : 'bg-secondary'} small">${post.status}</span></td>
        <td class="small">${post.author?.name || 'Unknown'}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="adminDashboard.editPost('${post.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.deletePost('${post.id}')"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      container.appendChild(row);
    });
  }

  async loadCategories() {
    try {
      const snapshot = await getDocs(collection(db, collectionNames.CATEGORIES));
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      container.innerHTML = '<tr><td colspan="2" class="text-center py-4 small">No categories</td></tr>';
      return;
    }

    container.innerHTML = categories.map(cat => `
      <tr>
        <td class="small fw-semibold">${cat.name}</td>
        <td class="text-muted small">0</td>
      </tr>
    `).join('');
  }

  async loadTags() {
    try {
      const snapshot = await getDocs(collection(db, collectionNames.TAGS));
      const tags = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      container.innerHTML = '<tr><td class="text-center py-4 small">No tags</td></tr>';
      return;
    }

    container.innerHTML = tags.map(tag => `
      <tr>
        <td class="small">
          <span class="badge" style="background-color: ${tag.color || '#3b82f6'}">${tag.name}</span>
        </td>
      </tr>
    `).join('');
  }

  formatDate(timestamp) {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  _getTimestampDate(timestamp) {
    if (!timestamp) return new Date(0);
    if (timestamp.toDate) return timestamp.toDate();
    return new Date(timestamp);
  }

  setupPostEvents() {
    const postForm = document.getElementById('postForm');
    if (postForm) {
      postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
    }

    const titleInput = document.getElementById('postTitle');
    const slugInput = document.getElementById('postSlug');
    if (titleInput && slugInput) {
      titleInput.addEventListener('input', (e) => {
        if (!slugInput.dataset.manual) {
          slugInput.value = this.generateSlug(e.target.value);
        }
      });
    }

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
        }
      });
    }
  }

  generateSlug(text) {
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
  }

  async loadFormOptions() {
    try {
      const catSnap = await getDocs(collection(db, collectionNames.CATEGORIES));
      const select = document.getElementById('postCategory');
      if (select) {
        const categories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        categories.sort((a, b) => a.name.localeCompare(b.name));
        select.innerHTML = '<option value="">Select Category</option>' + categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }
    } catch (err) { console.error(err); }
  }

  async handlePostSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const postId = formData.get('postId');
    
    const postData = {
      title: formData.get('postTitle'),
      slug: formData.get('postSlug'),
      excerpt: formData.get('postExcerpt'),
      content: formData.get('postContent'),
      status: formData.get('postStatus'),
      category: {
        id: formData.get('postCategory'),
        name: document.getElementById('postCategory').options[document.getElementById('postCategory').selectedIndex]?.text || 'Uncategorized'
      },
      updatedAt: serverTimestamp()
    };

    if (!postId) {
      postData.author = { id: this.currentUser.uid, name: this.currentUser.displayName || this.currentUser.email, email: this.currentUser.email };
      postData.createdAt = serverTimestamp();
      postData.views = 0;
    }

    try {
      const publishBtn = document.getElementById('publishBtn');
      publishBtn.disabled = true;
      publishBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

      const imageFile = document.getElementById('postImage').files[0];
      if (imageFile) {
        const storageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
        const snap = await uploadBytes(storageRef, imageFile);
        postData.featuredImage = await getDownloadURL(snap.ref);
      }

      if (postId) {
        await updateDoc(doc(db, collectionNames.POSTS, postId), postData);
      } else {
        await addDoc(collection(db, collectionNames.POSTS), postData);
      }

      this.showNotification('Post saved successfully!', 'success');
      form.reset();
      this.showSection('section-overview');
    } catch (err) {
      console.error(err);
      this.showNotification('Error: ' + err.message, 'error');
    } finally {
      document.getElementById('publishBtn').disabled = false;
      document.getElementById('publishBtn').textContent = 'Save Post';
    }
  }

  setupCategoryEvents() {
    const catForm = document.getElementById('categoryForm');
    if (catForm) {
      catForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputs = catForm.querySelectorAll('input, textarea');
        try {
          await addDoc(collection(db, collectionNames.CATEGORIES), {
            name: inputs[0].value,
            slug: inputs[1].value,
            description: inputs[2].value,
            createdAt: serverTimestamp()
          });
          this.showNotification('Category added!', 'success');
          catForm.reset();
          this.loadCategories();
          this.loadFormOptions();
        } catch (err) { console.error(err); }
      });
    }

    const tagForm = document.getElementById('tagForm');
    if (tagForm) {
      tagForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputs = tagForm.querySelectorAll('input');
        try {
          await addDoc(collection(db, collectionNames.TAGS), {
            name: inputs[0].value,
            slug: inputs[1].value,
            color: inputs[2].value,
            createdAt: serverTimestamp()
          });
          this.showNotification('Tag added!', 'success');
          tagForm.reset();
          this.loadTags();
        } catch (err) { console.error(err); }
      });
    }
  }

  showNotification(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'danger' : 'success'} position-fixed top-0 end-0 m-3 shadow`;
    alert.style.zIndex = '9999';
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
  }
}

const adminDashboard = new AdminDashboard();
window.adminDashboard = adminDashboard;