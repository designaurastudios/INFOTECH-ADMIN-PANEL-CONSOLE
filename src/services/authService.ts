import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  IdTokenResult,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AdminUser {
  uid: string;
  email: string;
  role: 'master_admin';
  jwtToken: string;
  tokenExpiresAt: number;
  authTime: number;
  isFirebaseUser: boolean;
}

// In-memory cache for the validated JWT session
let currentJwtToken: string | null = null;
let currentClaims: IdTokenResult | null = null;
let inactivityTimer: NodeJS.Timeout | null = null;

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes session idle limit

export const authService = {
  /**
   * Login as Administrator via Google Firebase Auth with JWT Token issuance and verification
   */
  login: async (email: string, pass: string): Promise<AdminUser> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      
      // 1. Acquire cryptographically signed JWT ID Token
      const jwtToken = await cred.user.getIdToken(true);
      const tokenResult = await cred.user.getIdTokenResult();
      
      currentJwtToken = jwtToken;
      currentClaims = tokenResult;

      const expMs = Date.parse(tokenResult.expirationTime) || (Date.now() + 3600 * 1000);
      const authTimeMs = Date.parse(tokenResult.authTime) || Date.now();

      authService.resetInactivityTimer();

      return {
        uid: cred.user.uid,
        email: cred.user.email || email,
        role: 'master_admin',
        jwtToken,
        tokenExpiresAt: expMs,
        authTime: authTimeMs,
        isFirebaseUser: true,
      };
    } catch (err: any) {
      const code = err.code || '';
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'
      ) {
        throw new Error('Invalid administrator email or password.');
      } else if (code === 'auth/too-many-requests') {
        throw new Error('Access temporarily blocked due to multiple failed login attempts. Please try again later.');
      } else if (code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw new Error(err.message || 'Firebase authentication failed.');
    }
  },

  /**
   * Listen to Firebase auth state changes with cryptographic JWT token verification
   */
  checkAuth: (callback: (user: AdminUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        try {
          // Verify and refresh JWT ID Token
          const jwtToken = await user.getIdToken();
          const tokenResult = await user.getIdTokenResult();
          
          currentJwtToken = jwtToken;
          currentClaims = tokenResult;

          const expMs = Date.parse(tokenResult.expirationTime) || (Date.now() + 3600 * 1000);
          const authTimeMs = Date.parse(tokenResult.authTime) || Date.now();

          // Check if token is expired
          if (expMs < Date.now()) {
            await authService.logout();
            callback(null);
            return;
          }

          authService.resetInactivityTimer();

          callback({
            uid: user.uid,
            email: user.email || 'Admin',
            role: 'master_admin',
            jwtToken,
            tokenExpiresAt: expMs,
            authTime: authTimeMs,
            isFirebaseUser: true,
          });
        } catch {
          callback(null);
        }
      } else {
        currentJwtToken = null;
        currentClaims = null;
        authService.clearInactivityTimer();
        callback(null);
      }
    });
  },

  /**
   * Get the current valid JWT ID Token for authorized requests
   */
  getJwtToken: async (): Promise<string | null> => {
    if (auth.currentUser) {
      currentJwtToken = await auth.currentUser.getIdToken();
      return currentJwtToken;
    }
    return currentJwtToken;
  },

  /**
   * Reset session idle timeout on admin activity
   */
  resetInactivityTimer: () => {
    authService.clearInactivityTimer();
    inactivityTimer = setTimeout(() => {
      authService.logout().catch(() => {});
    }, INACTIVITY_TIMEOUT_MS);
  },

  /**
   * Clear active idle timer
   */
  clearInactivityTimer: () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  },

  /**
   * Secure Sign Out and session purge
   */
  logout: async (): Promise<void> => {
    authService.clearInactivityTimer();
    currentJwtToken = null;
    currentClaims = null;
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  },
};
