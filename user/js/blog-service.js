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

  // Utility to convert various date formats to JS Date
  _getTimestampDate(timestamp) {
    if (!timestamp) return new Date(0);
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'string' || typeof timestamp === 'number') return new Date(timestamp);
    return new Date(0);
  }

  // Get published posts
  async getPublishedPosts(category = null, tag = null, limitCount = 10) {
    try {
      // NOTE: We're fetching without orderBy first to avoid composite index requirements
      // which can be frustrating during initial setup. We'll sort in memory for now.
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
        posts.push({ id: doc.id, ...doc.data() });
      });

      // Sort by createdAt descending (most recent first)
      posts.sort((a, b) => this._getTimestampDate(b.createdAt) - this._getTimestampDate(a.createdAt));

      // Limit results if requested
      return posts.slice(0, limitCount);
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
      const categoriesQuery = query(collection(db, collectionNames.CATEGORIES));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categories = [];
      
      categoriesSnapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });

      // Sort locally by order or name
      categories.sort((a, b) => (a.order || 0) - (b.order || 0));

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get all tags
  async getTags() {
    try {
      const tagsQuery = query(collection(db, collectionNames.TAGS));
      const tagsSnapshot = await getDocs(tagsQuery);
      const tags = [];
      
      tagsSnapshot.forEach(doc => {
        tags.push({ id: doc.id, ...doc.data() });
      });

      tags.sort((a, b) => a.name.localeCompare(b.name));
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
        where('status', '==', 'approved')
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      const comments = [];
      
      commentsSnapshot.forEach(doc => {
        comments.push({ id: doc.id, ...doc.data() });
      });

      comments.sort((a, b) => this._getTimestampDate(a.createdAt) - this._getTimestampDate(b.createdAt));

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
        
        if (searchTerm) {
          const searchText = `${postData.title} ${postData.content} ${postData.excerpt}`.toLowerCase();
          if (!searchText.includes(searchTerm.toLowerCase())) return;
        }
        
        posts.push(postData);
      });

      posts.sort((a, b) => this._getTimestampDate(b.createdAt) - this._getTimestampDate(a.createdAt));
      return posts;
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  // Get featured posts
  async getFeaturedPosts(limitCount = 3) {
    return this.getPublishedPosts(null, null, limitCount);
  }

  // Get recent posts
  async getRecentPosts(limitCount = 5) {
    return this.getPublishedPosts(null, null, limitCount);
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
  async getPostsByCategory(categoryId, limitCount = 10) {
    return this.getPublishedPosts(categoryId, null, limitCount);
  }

  // Get posts by tag
  async getPostsByTag(tagId, limitCount = 10) {
    return this.getPublishedPosts(null, tagId, limitCount);
  }
}

const blogService = new BlogService();
export default blogService;