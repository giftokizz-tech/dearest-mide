// User Site Blog Service - Firebase Integration
import { db } from '../../firebase-config.js';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, addDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { collectionNames } from '../../database-schema.js';

class BlogService {
  constructor() {
    this.currentPage = 1;
    this.postsPerPage = 6;
    this.lastVisible = null;
    this.currentCategory = null;
    this.currentTag = null;
  }

  // Get published posts
  async getPublishedPosts(category = null, tag = null, page = 1) {
    try {
      let postsQuery = query(
        collection(db, collectionNames.POSTS),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      if (category) {
        postsQuery = query(postsQuery, where('category.id', '==', category));
      }

      if (tag) {
        postsQuery = query(postsQuery, where('tags', 'array-contains', tag));
      }

      if (page > 1 && this.lastVisible) {
        postsQuery = query(postsQuery, startAfter(this.lastVisible));
      }

      const postsSnapshot = await getDocs(postsQuery);
      const posts = [];
      
      postsSnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      // Update last visible for pagination
      if (postsSnapshot.docs.length > 0) {
        this.lastVisible = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      }

      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  // Get post by slug
  async getPostBySlug(slug) {
    try {
      const postsQuery = query(
        collection(db, collectionNames.POSTS),
        where('slug', '==', slug),
        where('status', '==', 'published')
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      
      if (postsSnapshot.empty) {
        return null;
      }

      const doc = postsSnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      return null;
    }
  }

  // Get all categories
  async getCategories() {
    try {
      const categoriesQuery = query(
        collection(db, collectionNames.CATEGORIES),
        orderBy('order', 'asc')
      );
      
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categories = [];
      
      categoriesSnapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get all tags
  async getTags() {
    try {
      const tagsQuery = query(
        collection(db, collectionNames.TAGS),
        orderBy('name', 'asc')
      );
      
      const tagsSnapshot = await getDocs(tagsQuery);
      const tags = [];
      
      tagsSnapshot.forEach(doc => {
        tags.push({ id: doc.id, ...doc.data() });
      });

      return tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }

  // Get comments for a post
  async getCommentsForPost(postId) {
    try {
      const commentsQuery = query(
        collection(db, collectionNames.COMMENTS),
        where('postId', '==', postId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'asc')
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      const comments = [];
      
      commentsSnapshot.forEach(doc => {
        comments.push({ id: doc.id, ...doc.data() });
      });

      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Add a comment to a post
  async addComment(postId, commentData) {
    try {
      const comment = {
        ...commentData,
        postId: postId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        replies: []
      };

      const docRef = await addDoc(collection(db, collectionNames.COMMENTS), comment);
      
      // Update post comments count
      await this.updatePostCommentsCount(postId);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  }

  // Update post comments count
  async updatePostCommentsCount(postId) {
    try {
      const commentsQuery = query(
        collection(db, collectionNames.COMMENTS),
        where('postId', '==', postId),
        where('status', '==', 'approved')
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsCount = commentsSnapshot.size;

      const postRef = doc(db, collectionNames.POSTS, postId);
      await updateDoc(postRef, {
        commentsCount: commentsCount,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating comments count:', error);
    }
  }

  // Search posts
  async searchPosts(searchTerm, category = null, tag = null) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation that searches in title and content
      let postsQuery = query(
        collection(db, collectionNames.POSTS),
        where('status', '==', 'published')
      );

      if (category) {
        postsQuery = query(postsQuery, where('category.id', '==', category));
      }

      if (tag) {
        postsQuery = query(postsQuery, where('tags', 'array-contains', tag));
      }

      const postsSnapshot = await getDocs(postsQuery);
      const posts = [];
      
      postsSnapshot.forEach(doc => {
        const postData = { id: doc.id, ...doc.data() };
        
        // Basic text search
        if (searchTerm) {
          const searchText = `${postData.title} ${postData.content} ${postData.excerpt}`.toLowerCase();
          if (!searchText.includes(searchTerm.toLowerCase())) {
            return;
          }
        }
        
        posts.push(postData);
      });

      // Sort by date descending
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return posts;
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  // Get featured posts
  async getFeaturedPosts(limit = 3) {
    try {
      const postsQuery = query(
        collection(db, collectionNames.POSTS),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      const posts = [];
      
      postsSnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      return posts;
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  }

  // Get recent posts
  async getRecentPosts(limit = 5) {
    try {
      const postsQuery = query(
        collection(db, collectionNames.POSTS),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      const posts = [];
      
      postsSnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      return posts;
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      return [];
    }
  }

  // Increment post views
  async incrementPostViews(postId) {
    try {
      const postRef = doc(db, collectionNames.POSTS, postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const currentViews = postDoc.data().views || 0;
        await updateDoc(postRef, {
          views: currentViews + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  // Get posts by category
  async getPostsByCategory(categoryId, limit = 10) {
    try {
      const postsQuery = query(
        collection(db, collectionNames.POSTS),
        where('status', '==', 'published'),
        where('category.id', '==', categoryId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      const posts = [];
      
      postsSnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      return posts;
    } catch (error) {
      console.error('Error fetching posts by category:', error);
      return [];
    }
  }

  // Get posts by tag
  async getPostsByTag(tagId, limit = 10) {
    try {
      const postsQuery = query(
        collection(db, collectionNames.POSTS),
        where('status', '==', 'published'),
        where('tags', 'array-contains', tagId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      const posts = [];
      
      postsSnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      return posts;
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
      return [];
    }
  }
}

// Create and export singleton instance
const blogService = new BlogService();
export default blogService;