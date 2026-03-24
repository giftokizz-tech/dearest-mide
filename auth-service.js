// Firebase Authentication Service for Admin Access
import { auth, db, getCurrentUser, isAuthenticated } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.initAuthListener();
  }

  // Initialize auth state listener
  initAuthListener() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        // Update last login time
        await this.updateLastLogin(user.uid);
        // Check if user has admin access
        const userDoc = await this.getUserProfile(user.uid);
        if (userDoc && userDoc.isActive) {
          console.log('Admin user authenticated:', user.email);
        } else {
          console.log('User does not have active admin access');
          await this.signOut();
        }
      } else {
        this.currentUser = null;
      }
    });
  }

  // Admin login
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userProfile = await this.getUserProfile(user.uid);
      if (!userProfile || !userProfile.isActive) {
        throw new Error('Access denied: Account not found or deactivated');
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // General signup for every user
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userProfile = {
        uid: user.uid,
        email: email,
        displayName: displayName || email.split('@')[0],
        role: 'user', // Default role which you can manually upgrade to admin later
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      await updateProfile(user, { displayName: userProfile.displayName });
      
      return { success: true, user, profile: userProfile };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Admin logout
  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      console.log('Admin signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Create admin user (for initial setup)
  async createAdminUser(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: email,
        displayName: displayName || email.split('@')[0],
        role: 'admin',
        permissions: {
          canManagePosts: true,
          canManageUsers: true,
          canManageCategories: true,
          canModerateComments: true,
          canViewAnalytics: true
        },
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: userProfile.displayName });
      
      console.log('Admin user created successfully:', user.email);
      return { success: true, user, profile: userProfile };
    } catch (error) {
      console.error('Create admin user error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Get user profile
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      console.log('User profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  // Get all users (for admin management)
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  // Update user role and permissions
  async updateUserRole(uid, role, permissions) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        role: role,
        permissions: permissions,
        updatedAt: new Date().toISOString()
      });
      console.log('User role updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  // Deactivate user account
  async deactivateUser(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });
      console.log('User deactivated successfully');
      return { success: true };
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Check if user has admin role
  hasAdminRole(role) {
    return ['admin', 'editor', 'user'].includes(role);
  }

  // Get current authenticated user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser && isAuthenticated();
  }

  // Get auth error messages
  getAuthErrorMessage(code) {
    const errorMessages = {
      'auth/invalid-email': 'The email address is not valid.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No user found with this email address.',
      'auth/wrong-password': 'The password is incorrect.',
      'auth/too-many-requests': 'Too many login attempts. Please try again later.',
      'auth/email-already-in-use': 'This email is already in use by another account.',
      'auth/weak-password': 'The password is too weak. Please use a stronger password.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'Access denied: You do not have admin privileges': 'Access denied: You do not have admin privileges'
    };
    
    return errorMessages[code] || 'An unexpected error occurred. Please try again.';
  }

  // Update last login time
  async updateLastLogin(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastLoginAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update last login error:', error);
      // Don't throw error for this, just log it
    }
  }

  // Validate admin permissions
  hasPermission(permission) {
    if (!this.currentUser) return false;
    
    const userProfile = this.getUserProfile(this.currentUser.uid);
    if (!userProfile) return false;
    
    return userProfile.permissions && userProfile.permissions[permission];
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;

// Export individual functions for direct use if needed
export {
  signInWithEmailAndPassword,
  signOut as signOutAuth,
  sendPasswordResetEmail,
  updateProfile
};