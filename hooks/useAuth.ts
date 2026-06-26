'use client';

import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { createOrUpdateUser } from '@/lib/firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await createOrUpdateUser({
          id: u.uid,
          displayName: u.displayName || u.email?.split('@')[0] || 'User',
          email: u.email || '',
          photoURL: u.photoURL || undefined,
        }).catch(() => {});
      }
      setLoading(false);
    });
  }, []);

  async function loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }

  async function signupWithEmail(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await updateProfile(cred.user, { displayName });
    return cred;
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(getFirebaseAuth(), provider);
  }

  async function logout() {
    return signOut(getFirebaseAuth());
  }

  return { user, loading, loginWithEmail, signupWithEmail, loginWithGoogle, logout };
}
