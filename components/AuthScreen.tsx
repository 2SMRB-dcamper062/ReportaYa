import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, X } from 'lucide-react';
import { apiLoginLocal, apiRegisterLocal } from '../services/api';
import { useLocale } from '../i18n';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onClose }) => {
  const { t, locale } = useLocale();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError(t('auth.fill_required'));
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError(t('auth.passwords_no_match'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        const newUser = await apiRegisterLocal(email, password, name);
        onLogin(newUser);
      } else {
        const user = await apiLoginLocal(email, password);
        onLogin(user);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-slate-900 dark:text-slate-100 rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-fade-in border border-transparent dark:border-slate-800">
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">{isRegister ? t('auth.create_account') : t('auth.welcome')}</h2>
          <button onClick={onClose} className="text-white hover:bg-white/10 rounded-full p-1 transition">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6">
          <div className="flex justify-center mb-6 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              className={`flex-1 py-2 text-center rounded-lg transition-all ${!isRegister ? 'bg-white dark:bg-slate-900 shadow-sm font-bold text-blue-600' : 'text-gray-500 dark:text-slate-300'}`}
              onClick={() => { setIsRegister(false); setError(null); }}
            >
              {t('auth.login')}
            </button>
            <button
              className={`flex-1 py-2 text-center rounded-lg transition-all ${isRegister ? 'bg-white dark:bg-slate-900 shadow-sm font-bold text-blue-600' : 'text-gray-500 dark:text-slate-300'}`}
              onClick={() => { setIsRegister(true); setError(null); }}
            >
              {t('auth.register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t('auth.name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                  placeholder={t('auth.name_placeholder')}
                  required={isRegister}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                  placeholder={t('auth.email_placeholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t('auth.confirm_password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                    placeholder="••••••••"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-100 dark:border-red-900/50">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? t('auth.loading') : isRegister ? t('auth.register') : t('auth.enter')}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => alert(t('auth.forgot_support'))}
              >
                {t('auth.forgot')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;