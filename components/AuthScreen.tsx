import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Mail, Lock, X } from 'lucide-react';
import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent login if email or password are empty
    if (!email || !email.trim() || !password || !password.trim()) {
      alert('Introduce correo y contraseña para continuar.');
      return;
    }

    setLoading(true);
    // Shortcut for local admin credentials (useful for testing/offline)
    if (email === 'ayuntamiento@reportaya.es' && password === 'ayuntamiento') {
      // Directly log in as admin without calling Firebase (keeps app flow simple)
      setTimeout(() => {
        onLogin({
          id: 'local-admin',
          name: 'Ayuntamiento ReportaYa',
          role: UserRole.ADMIN,
          email,
          points: 1000,
          avatar: '',
          inventory: [],
          experience: 0,
          equippedFrame: null,
          equippedBackground: null,
          profileTag: null,
          premium: true,
        });
        setLoading(false);
      }, 400);
      return;
    }
    // Use Firebase Auth to sign in and then fetch Firestore profile
    signInWithEmailAndPassword(auth, email, password)
      .then(async (res) => {
        const u = res.user;

        // Optimistic: immediately log user in with minimal info to improve perceived speed
        const minimalUser: User = {
          id: u.uid,
          name: u.displayName || email.split('@')[0] || 'Usuario',
          role: UserRole.CITIZEN,
          email: u.email || email,
          points: 0,
          avatar: u.photoURL || '',
          inventory: [],
          experience: 0,
        };
        onLogin(minimalUser);
        setLoading(false);

        // Try to load Firestore profile, but don't block the UI — use a short timeout
        try {
          const docRef = doc(db, 'users', u.uid);

          const timedGet = (ms: number) => {
            return Promise.race([
              getDoc(docRef),
              new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
            ]);
          };

          const snap = await timedGet(1000); // 1s timeout (faster perceived login)
          if (snap && (snap as any).exists && (snap as any).exists()) {
            const profileData = (snap as any).data();
            const updatedUser: User = {
              id: u.uid,
              name: profileData?.name || minimalUser.name,
              role: (profileData?.role as UserRole) || UserRole.CITIZEN,
              email: profileData?.email || minimalUser.email,
              points: profileData?.points || 0,
              avatar: profileData?.avatar || minimalUser.avatar || '',
              inventory: profileData?.inventory || [],
              experience: profileData?.experience || 0,
              equippedFrame: profileData?.equippedFrame || null,
              equippedBackground: profileData?.equippedBackground || null,
              profileTag: profileData?.profileTag || null,
              premium: profileData?.premium || false,
            };
            // Update app with full profile
            onLogin(updatedUser);
          }
        } catch (err) {
          // Silently ignore profile fetch problems — user is already logged in optimistically
          console.warn('Perfil Firestore no disponible o tardó demasiado:', err);
        }
      })
      .catch((err) => {
        console.error('Login error', err);
        alert('Error al iniciar sesión: ' + (err.message || err));
        setLoading(false);
      });
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Try load Firestore profile
      let profileData: any = null;
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) profileData = snap.data();
      } catch (err) {
        console.error('Error fetching user profile from Firestore', err);
      }

      onLogin({
        id: user.uid,
        name: profileData?.name || user.displayName || 'Usuario',
        role: (profileData?.role as UserRole) || UserRole.CITIZEN,
        email: user.email || '',
        points: profileData?.points || 0,
        avatar: profileData?.avatar || user.photoURL || '',
        inventory: profileData?.inventory || [],
        experience: profileData?.experience || 0,
        equippedFrame: profileData?.equippedFrame || null,
        equippedBackground: profileData?.equippedBackground || null,
        profileTag: profileData?.profileTag || null,
        premium: profileData?.premium || false,
      });
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <header className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-bold">Bienvenido</h2>
          <button onClick={onClose} className="text-white">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <button
              className={`px-4 py-2 w-1/2 text-center ${!isRegister ? 'border-b-2 border-blue-600 font-bold' : 'text-gray-500'}`}
              onClick={() => setIsRegister(false)}
            >
              INICIAR SESIÓN
            </button>
            <button
              className={`px-4 py-2 w-1/2 text-center ${isRegister ? 'border-b-2 border-blue-600 font-bold' : 'text-gray-500'}`}
              onClick={() => setIsRegister(true)}
            >
              REGISTRARSE
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Correo electrónico"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contraseña"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!email.trim() || !password.trim() || loading}
              className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${(!email.trim() || !password.trim() || loading) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {loading ? 'Cargando...' : 'Entrar →'}
            </button>
          </form>
          <div className="text-center mt-4 text-sm text-gray-500">O continúa con</div>
          <div className="flex justify-center mt-2">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-2 border rounded-md py-2 px-4 text-gray-700 hover:bg-gray-100"
            >
              <img src="/google-icon.png" alt="Google" className="w-5 h-5" /> Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;