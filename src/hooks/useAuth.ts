import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { allowedEmail, auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && allowedEmail && currentUser.email !== allowedEmail) {
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    const credentials = await signInWithEmailAndPassword(auth, email, password);

    if (allowedEmail && credentials.user.email !== allowedEmail) {
      await signOut(auth);
      throw new Error('Este usuário não está autorizado.');
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, loading, login, logout };
}
