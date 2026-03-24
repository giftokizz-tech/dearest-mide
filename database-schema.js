// Firestore Database Schema and Collection Definitions
// This file defines the structure of our blog database

// Collection: posts
// Purpose: Stores all blog posts with their content and metadata
const postsSchema = {
  title: "string",           // Post title
  slug: "string",            // URL-friendly version of title
  content: "string",         // Post content (HTML or markdown)
  excerpt: "string",         // Short summary for listing pages
  status: "string",          // 'draft', 'published', 'scheduled'
  author: {
    id: "string",            // User ID
    name: "string",          // Author display name
    email: "string"          // Author email
  },
  category: {
    id: "string",            // Category ID reference
    name: "string"           // Category name
  },
  tags: ["string"],          // Array of tag IDs
  featuredImage: "string",   // URL to featured image
  publishDate: "timestamp",  // When to publish (for scheduled posts)
  createdAt: "timestamp",    // Creation timestamp
  updatedAt: "timestamp",    // Last update timestamp
  views: "number",           // View count
  likes: "number",           // Like count
  commentsCount: "number",   // Number of approved comments
  seo: {
    metaTitle: "string",     // SEO meta title
    metaDescription: "string", // SEO meta description
    keywords: ["string"]     // SEO keywords
  }
};

// Collection: categories
// Purpose: Stores blog categories for organizing posts
const categoriesSchema = {
  name: "string",            // Category display name
  slug: "string",            // URL-friendly version
  description: "string",     // Optional description
  color: "string",           // Color for UI display
  order: "number",           // Display order
  createdAt: "timestamp",
  updatedAt: "timestamp"
};

// Collection: tags
// Purpose: Stores tags for posts
const tagsSchema = {
  name: "string",            // Tag display name
  slug: "string",            // URL-friendly version
  color: "string",           // Color for UI display
  createdAt: "timestamp",
  updatedAt: "timestamp"
};

// Collection: users
// Purpose: Stores user information and permissions
const usersSchema = {
  uid: "string",             // Firebase Auth UID
  email: "string",           // User email
  displayName: "string",     // Display name
  photoURL: "string",        // Profile picture URL
  role: "string",            // 'admin', 'editor', 'author', 'viewer'
  permissions: {
    canManagePosts: "boolean",
    canManageUsers: "boolean",
    canManageCategories: "boolean",
    canModerateComments: "boolean",
    canViewAnalytics: "boolean"
  },
  isActive: "boolean",       // Account status
  lastLoginAt: "timestamp",
  createdAt: "timestamp",
  updatedAt: "timestamp"
};

// Collection: comments
// Purpose: Stores comments on posts
const commentsSchema = {
  postId: "string",          // Reference to post
  author: {
    name: "string",          // Commenter name
    email: "string",         // Commenter email (optional)
    website: "string"        // Optional website
  },
  content: "string",         // Comment content
  status: "string",          // 'pending', 'approved', 'spam', 'trashed'
  createdAt: "timestamp",
  updatedAt: "timestamp",
  likes: "number",           // Like count
  replies: ["string"]        // Array of comment IDs for replies
};

// Collection: media
// Purpose: Stores uploaded media files
const mediaSchema = {
  filename: "string",        // Original filename
  url: "string",             // Public URL
  type: "string",            // 'image', 'video', 'document'
  size: "number",            // File size in bytes
  dimensions: {              // For images
    width: "number",
    height: "number"
  },
  altText: "string",         // Alt text for accessibility
  caption: "string",         // Optional caption
  uploadedBy: "string",      // User ID
  postId: "string",          // Optional post reference
  createdAt: "timestamp"
};

// Collection: analytics
// Purpose: Stores basic analytics data
const analyticsSchema = {
  date: "string",            // YYYY-MM-DD format
  postId: "string",          // Optional post reference
  pageViews: "number",       // Page view count
  uniqueVisitors: "number",  // Unique visitor count
  bounceRate: "number",      // Bounce rate percentage
  avgTimeOnPage: "number",   // Average time in seconds
  createdAt: "timestamp"
};

// Utility functions for working with the database
export const collectionNames = {
  POSTS: 'posts',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  USERS: 'users',
  COMMENTS: 'comments',
  MEDIA: 'media',
  ANALYTICS: 'analytics'
};

// Default data for initial setup
export const defaultCategories = [
  { name: 'Technology', slug: 'technology', description: 'Tech-related posts', color: '#3b82f6', order: 1 },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle and personal posts', color: '#10b981', order: 2 },
  { name: 'Travel', slug: 'travel', description: 'Travel stories and tips', color: '#f59e0b', order: 3 },
  { name: 'Personal Growth', slug: 'growth', description: 'Self-improvement content', color: '#ef4444', order: 4 }
];

export const defaultTags = [
  { name: 'Productivity', slug: 'productivity', color: '#6366f1' },
  { name: 'Writing', slug: 'writing', color: '#8b5cf6' },
  { name: 'Mindset', slug: 'mindset', color: '#06b6d4' },
  { name: 'Business', slug: 'business', color: '#22c55e' }
];

console.log('Database schema defined successfully');