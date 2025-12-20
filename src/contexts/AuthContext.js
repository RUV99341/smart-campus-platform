import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, provider, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // ensure user doc exists
        const userRef = doc(db, 'users', u.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: u.uid,
            name: u.displayName || '',
            email: u.email || '',
            role: 'student',
            avatar: u.photoURL || '',
            createdAt: serverTimestamp(),
          });
          setUser({ uid: u.uid, name: u.displayName, email: u.email, role: 'student', avatar: u.photoURL });
        } else {
          setUser({ uid: u.uid, ...(snap.data()) });
        }

        // Only auto-redirect to dashboard if user is currently on a public landing route
        const publicPaths = ['/', '/signup', '/forgot-password', '/login'];
        const role = (snap && snap.exists() && snap.data().role) || 'student';
        if (publicPaths.includes(location.pathname)) {
          if (role === 'admin') navigate('/admin-dashboard');
          else navigate('/home');
        }
      } else {
        setUser(null);
        // send to landing only if not already there
        if (location.pathname !== '/') navigate('/');
      }
      setLoading(false);
    });
    return unsub;
  }, [navigate, location]);

  async function signInWithGoogle() {
    setLoading(true);
    const res = await signInWithPopup(auth, provider);
    const u = res.user;
    const userRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: u.uid,
        name: u.displayName || '',
        email: u.email || '',
        role: 'student',
        avatar: u.photoURL || '',
        createdAt: serverTimestamp(),
      });
    }
    setLoading(false);
  }

  function signOut() {
    return firebaseSignOut(auth);
  }

  const value = { user, loading, signInWithGoogle, signOut };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
