import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Mail, Lock, X } from 'lucide-react';
import { auth, googleProvider } from '../firebaseConfig';
import { MOCK_USERS } from '../constants';
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { apiGetUser, apiSaveUser } from '../services/api';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetErr, setResetErr] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent login if email or password are empty
    if (!email || !email.trim() || !password || !password.trim()) {
      alert('Introduce correo y contraseña para continuar.');
      return;
    }

    setLoading(true);
    // Allow local mock users for quick testing without Firebase
    const mock = MOCK_USERS.find(u => u.email === email && (u as any).password === password);
    if (mock) {
      setTimeout(() => {
        onLogin({
          id: mock.id,
          name: mock.name,
          role: mock.role,
          email: mock.email,
          points: mock.points || 0,
          avatar: mock.avatar || '',
          inventory: mock.inventory || [],
          experience: mock.experience || 0,
          equippedFrame: mock.equippedFrame || null,
          equippedBackground: mock.equippedBackground || null,
          profileTag: mock.profileTag || null,
          premium: mock.premium || false,
        });
        setLoading(false);
      }, 300);
      return;
    }
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

        // Try to load MongoDB profile, but don't block the UI — use a short timeout
        try {
          const profileFetch = apiGetUser(u.uid);
          const timedGet = (ms: number) => {
            return Promise.race([
              profileFetch,
              new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
            ]);
          };

          const profileData = await timedGet(1000); // 1s timeout (faster perceived login)
          if (profileData) {
            const updatedUser: User = {
              id: u.uid,
              name: profileData.name || minimalUser.name,
              role: (profileData.role as UserRole) || UserRole.CITIZEN,
              email: profileData.email || minimalUser.email,
              points: profileData.points || 0,
              avatar: profileData.avatar || minimalUser.avatar || '',
              inventory: profileData.inventory || [],
              experience: profileData.experience || 0,
              equippedFrame: profileData.equippedFrame || null,
              equippedBackground: profileData.equippedBackground || null,
              profileTag: profileData.profileTag || null,
              premium: profileData.premium || false,
            };
            // Update app with full profile
            onLogin(updatedUser);
          } else {
            // No profile found — save the minimal user to MongoDB
            apiSaveUser(minimalUser).catch(err => console.error('Error guardando perfil nuevo en MongoDB:', err));
          }
        } catch (err) {
          // Silently ignore profile fetch problems — user is already logged in optimistically
          console.warn('Perfil MongoDB no disponible o tardó demasiado:', err);
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
      const firebaseUser = result.user;
      // Try load MongoDB profile
      let profileData: User | null = null;
      try {
        profileData = await apiGetUser(firebaseUser.uid);
      } catch (err) {
        console.error('Error fetching user profile from MongoDB', err);
      }

      const loginUser: User = {
        id: firebaseUser.uid,
        name: profileData?.name || firebaseUser.displayName || 'Usuario',
        role: (profileData?.role as UserRole) || UserRole.CITIZEN,
        email: profileData?.email || firebaseUser.email || '',
        points: profileData?.points || 0,
        avatar: profileData?.avatar || firebaseUser.photoURL || '',
        inventory: profileData?.inventory || [],
        experience: profileData?.experience || 0,
        equippedFrame: profileData?.equippedFrame || null,
        equippedBackground: profileData?.equippedBackground || null,
        profileTag: profileData?.profileTag || null,
        premium: profileData?.premium || false,
      };

      onLogin(loginUser);

      // Save/update profile in MongoDB
      apiSaveUser(loginUser).catch(err => console.error('Error guardando perfil Google en MongoDB:', err));
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <header className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center relative h-16">
          <h2 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold">Bienvenido</h2>
          <button onClick={onClose} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
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
                  onChange={(e) => { setEmail(e.target.value); setResetMsg(null); setResetErr(null); }}
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
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={async () => {
                  if (!email || !email.trim()) {
                    setResetErr('Introduce tu correo para recibir el enlace de cambio de contraseña.');
                    setResetMsg(null);
                    return;
                  }

                  const mock = MOCK_USERS.find(u => u.email === email);
                  if (mock) {
                    setResetErr('Esta cuenta es de prueba local; el restablecimiento por correo solo funciona para cuentas reales.');
                    setResetMsg(null);
                    return;
                  }

                  try {
                    await sendPasswordResetEmail(auth, email);
                    setResetMsg(`Se ha enviado un correo de restablecimiento a ${email}. Revisa tu bandeja.`);
                    setResetErr(null);
                  } catch (err: any) {
                    console.error('Error sending password reset email', err);
                    setResetErr('No se pudo enviar el correo de restablecimiento: ' + (err?.message || String(err)));
                    setResetMsg(null);
                  }
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Cambiar contraseña
              </button>

              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-sm text-gray-500 hover:underline"
              >
                Crear cuenta
              </button>
            </div>
            {resetMsg && <div className="text-sm text-green-600 mt-2">{resetMsg}</div>}
            {resetErr && <div className="text-sm text-red-600 mt-2">{resetErr}</div>}
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