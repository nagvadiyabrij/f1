'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from '@/lib/db';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | { uid: string; displayName: string | null; email: string | null } | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, avatar: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USER_ID = 'demo-user-123';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !auth;

  async function loadProfile(uid: string) {
    const p = await getUserProfile(uid);
    setProfile(p);
  }

  useEffect(() => {
    // If Firebase auth is not configured, check for local demo session
    if (!auth) {
      const savedDemo = localStorage.getItem('life_rpg_demo_active');
      if (savedDemo === 'true') {
        const demoUser = { uid: DEMO_USER_ID, displayName: 'Valiant Adventurer', email: 'adventurer@realm.com' };
        setUser(demoUser);
        loadProfile(DEMO_USER_ID).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function loginAsDemo() {
    localStorage.setItem('life_rpg_demo_active', 'true');
    const demoUser = { uid: DEMO_USER_ID, displayName: 'Valiant Adventurer', email: 'adventurer@realm.com' };
    setUser(demoUser);
    await loadProfile(DEMO_USER_ID);
  }

  async function login(email: string, password: string) {
    if (!auth) {
      // Fallback to Demo login when Firebase keys are not present
      await loginAsDemo();
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email: string, password: string, displayName: string, avatar: string) {
    if (!auth) {
      // Create local demo profile when Firebase keys are not present
      localStorage.setItem('life_rpg_demo_active', 'true');
      await createUserProfile(DEMO_USER_ID, displayName || 'Adventurer', email, avatar);
      const demoUser = { uid: DEMO_USER_ID, displayName, email };
      setUser(demoUser);
      await loadProfile(DEMO_USER_ID);
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await createUserProfile(cred.user.uid, displayName, email, avatar);
    await loadProfile(cred.user.uid);
  }

  async function loginWithGoogle() {
    if (!auth) {
      // Fallback to Demo Google login when Firebase keys are not present
      await loginAsDemo();
      return;
    }
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      await createUserProfile(
        cred.user.uid,
        cred.user.displayName || 'Adventurer',
        cred.user.email || '',
        '🧙'
      );
    }
    await loadProfile(cred.user.uid);
  }

  async function logout() {
    if (!auth) {
      localStorage.removeItem('life_rpg_demo_active');
      setUser(null);
      setProfile(null);
      return;
    }
    await signOut(auth);
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.uid);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isDemoMode, login, register, loginWithGoogle, loginAsDemo, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
