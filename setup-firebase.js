// Firebase Setup Script - Initialize with Sample Data
// Run this script in your browser console after loading the admin dashboard
// to set up initial data for your blog

import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { collectionNames } from './database-schema.js';

class FirebaseSetup {
  constructor() {
    this.sampleData = {
      categories: [
        { name: 'Technology', slug: 'technology', description: 'Tech-related posts', color: '#3b82f6', order: 1 },
        { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle and personal posts', color: '#10b981', order: 2 },
        { name: 'Travel', slug: 'travel', description: 'Travel stories and tips', color: '#f59e0b', order: 3 },
        { name: 'Personal Growth', slug: 'growth', description: 'Self-improvement content', color: '#ef4444', order: 4 }
      ],
      tags: [
        { name: 'Productivity', slug: 'productivity', color: '#6366f1' },
        { name: 'Writing', slug: 'writing', color: '#8b5cf6' },
        { name: 'Mindset', slug: 'mindset', color: '#06b6d4' },
        { name: 'Business', slug: 'business', color: '#22c55e' },
        { name: 'Design', slug: 'design', color: '#f59e0b' },
        { name: 'Development', slug: 'development', color: '#10b981' }
      ],
      posts: [
        {
          title: 'The Future of Web Development in 2024',
          slug: 'future-of-web-development-2024',
          content: '<h2>Introduction</h2><p>Web development is evolving at an unprecedented pace. In 2024, we\'re seeing significant shifts in how we build and deploy web applications.</p><h3>Key Trends</h3><ul><li>AI-powered development tools</li><li>Edge computing</li><li>WebAssembly adoption</li><li>Progressive Web Apps</li></ul><h3>Conclusion</h3><p>The future looks bright for web developers who embrace these changes and continue learning.</p>',
          excerpt: 'Explore the latest trends and technologies shaping the web development landscape in 2024.',
          status: 'published',
          author: {
            id: 'admin',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          category: {
            id: 'technology',
            name: 'Technology'
          },
          tags: ['development', 'technology', 'trends'],
          featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop',
          publishDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          views: 1250,
          likes: 342,
          commentsCount: 15,
          seo: {
            metaTitle: 'The Future of Web Development in 2024 | Dearest Mide',
            metaDescription: 'Explore the latest trends and technologies shaping the web development landscape in 2024.',
            keywords: ['web development', '2024 trends', 'technology']
          }
        },
        {
          title: 'Mastering Bootstrap: From Basics to Advanced',
          slug: 'mastering-bootstrap-basics-advanced',
          content: '<h2>Getting Started with Bootstrap</h2><p>Bootstrap is one of the most popular CSS frameworks for building responsive websites.</p><h3>Grid System</h3><p>The Bootstrap grid system is built on a 12-column layout that adapts to different screen sizes.</p><h3>Components</h3><p>Bootstrap provides a wide range of pre-built components including buttons, forms, navigation, and more.</p>',
          excerpt: 'A comprehensive guide to building responsive web applications with Bootstrap 5.',
          status: 'published',
          author: {
            id: 'admin',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          category: {
            id: 'technology',
            name: 'Technology'
          },
          tags: ['bootstrap', 'css', 'responsive', 'design'],
          featuredImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
          publishDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          views: 980,
          likes: 256,
          commentsCount: 8,
          seo: {
            metaTitle: 'Mastering Bootstrap: From Basics to Advanced | Dearest Mide',
            metaDescription: 'A comprehensive guide to building responsive web applications with Bootstrap 5.',
            keywords: ['bootstrap', 'css', 'responsive design', 'web development']
          }
        },
        {
          title: 'Designing a Calm Productivity System',
          slug: 'designing-calm-productivity-system',
          content: '<h2>The Problem with Modern Productivity</h2><p>We live in an age of constant notifications, endless to-do lists, and the pressure to be always "on."</p><h3>A Better Approach</h3><p>Instead of trying to do more, focus on creating systems that help you do what matters most.</p><h3>Key Principles</h3><ul><li>Simplicity over complexity</li><li>Focus over multitasking</li><li>Rest over hustle</li></ul>',
          excerpt: 'Learn how to create a productivity system that supports your well-being rather than draining it.',
          status: 'published',
          author: {
            id: 'admin',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          category: {
            id: 'growth',
            name: 'Personal Growth'
          },
          tags: ['productivity', 'mindset', 'lifestyle'],
          featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d571a61c30?w=800&h=400&fit=crop',
          publishDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          views: 2150,
          likes: 420,
          commentsCount: 23,
          seo: {
            metaTitle: 'Designing a Calm Productivity System | Dearest Mide',
            metaDescription: 'Learn how to create a productivity system that supports your well-being rather than draining it.',
            keywords: ['productivity', 'mindset', 'lifestyle', 'wellness']
          }
        }
      ]
    };
  }

  // Initialize all sample data
  async initialize() {
    try {
      console.log('🚀 Starting Firebase setup...');
      
      // Create categories
      await this.createCategories();
      
      // Create tags
      await this.createTags();
      
      // Create posts
      await this.createPosts();
      
      console.log('✅ Firebase setup completed successfully!');
      console.log('📝 You can now log in to the admin dashboard and start managing your blog.');
      
    } catch (error) {
      console.error('❌ Error during setup:', error);
    }
  }

  // Create sample categories
  async createCategories() {
    console.log('📁 Creating categories...');
    
    for (const category of this.sampleData.categories) {
      try {
        await addDoc(collection(db, collectionNames.CATEGORIES), {
          ...category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Created category: ${category.name}`);
      } catch (error) {
        console.error(`❌ Error creating category ${category.name}:`, error);
      }
    }
  }

  // Create sample tags
  async createTags() {
    console.log('🏷️ Creating tags...');
    
    for (const tag of this.sampleData.tags) {
      try {
        await addDoc(collection(db, collectionNames.TAGS), {
          ...tag,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Created tag: ${tag.name}`);
      } catch (error) {
        console.error(`❌ Error creating tag ${tag.name}:`, error);
      }
    }
  }

  // Create sample posts
  async createPosts() {
    console.log('📝 Creating sample posts...');
    
    for (const post of this.sampleData.posts) {
      try {
        await addDoc(collection(db, collectionNames.POSTS), post);
        console.log(`✅ Created post: ${post.title}`);
      } catch (error) {
        console.error(`❌ Error creating post ${post.title}:`, error);
      }
    }
  }

  // Create initial admin user (call this separately)
  async createAdminUser(email, password, displayName) {
    try {
      // This would need to be called from the auth-service
      console.log('👤 Creating admin user...');
      console.log('Please use the auth-service.createAdminUser() function with:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`Display Name: ${displayName}`);
      
      return {
        success: true,
        message: 'Admin user creation instructions provided'
      };
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export for use in browser console
window.firebaseSetup = new FirebaseSetup();

// Instructions for use
console.log(`
🎯 Firebase Setup Instructions:

1. Open the admin dashboard in your browser
2. Open browser developer tools (F12)
3. In the Console tab, run:
   
   // To create sample data:
   await firebaseSetup.initialize()
   
   // To create an admin user:
   // (This requires auth-service, so use the admin dashboard instead)
   
4. Check the Firebase console to see your data

💡 Tip: Run this only once to avoid duplicate data.
`);