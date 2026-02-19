import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Mail, Lock, X, ArrowRight, Send, CheckCircle } from 'lucide-react';
import { apiLoginLocal, apiRegisterLocal, apiForgotPassword, apiResetPassword } from '../services/api';
import { useLocale } from '../i18n';
import PasswordStrengthIndicator, { isPasswordStrong } from './PasswordStrengthIndicator';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onClose }) => {
  const { t } = useLocale();
  const [view, setView] = useState<AuthView>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [resetToken, setResetToken] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check for reset token on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset');
    if (token) {
      setResetToken(token);
      setView('reset');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Common validations
    if (view === 'login') {
      if (!email || !password) return setError(t('auth.fill_required'));
    } else if (view === 'register') {
      if (!email || !password || !name || !surname || !postalCode) return setError(t('auth.fill_required'));
      if (password !== confirmPassword) return setError(t('auth.passwords_no_match'));
      if (!isPasswordStrong(password)) return setError(t('auth.password_weak') || 'Contraseña débil');

      // Strict Postal Code Validation Removed (Allowed all for registration)
      // if (!postalCode.startsWith('41')) return setError(t('auth.postal_code_error') || 'Solo códigos postales de Sevilla (41xxx).');
    } else if (view === 'forgot') {
      if (!email) return setError(t('auth.fill_required'));
    } else if (view === 'reset') {
      if (!password || !confirmPassword) return setError(t('auth.fill_required'));
      if (password !== confirmPassword) return setError(t('auth.passwords_no_match'));
      if (!isPasswordStrong(password)) return setError(t('auth.password_weak') || 'Contraseña débil');
    }

    setLoading(true);
    try {
      if (view === 'login') {
        const user = await apiLoginLocal(email, password);
        onLogin(user);
        onClose();
      } else if (view === 'register') {
        const newUser = await apiRegisterLocal(email, password, name, surname, postalCode);
        onLogin(newUser);
        onClose();
      } else if (view === 'forgot') {
        await apiForgotPassword(email);
        setSuccessMsg(t('auth.reset_link_sent'));
      } else if (view === 'reset') {
        await apiResetPassword(resetToken, password);
        setSuccessMsg(t('auth.reset_success'));
        setTimeout(() => setView('login'), 2000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    switch (view) {
      case 'register': return t('auth.create_account');
      case 'forgot': return t('auth.forgot');
      case 'reset': return t('auth.reset_password');
      default: return t('auth.welcome');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white dark:bg-slate-900 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-transparent dark:border-slate-800">
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center relative">
          {view !== 'login' && view !== 'reset' && (
            <button onClick={() => { setView('login'); setError(null); }} className="absolute left-4 text-white hover:bg-white/10 rounded-full p-1">
              <ArrowRight className="transform rotate-180" size={20} />
            </button>
          )}
          <h2 className="text-lg font-bold w-full text-center">{renderHeader()}</h2>
          <button onClick={onClose} className="absolute right-4 text-white hover:bg-white/10 rounded-full p-1 transition">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6">
          {/* Tabs for Login/Register */}
          {view !== 'forgot' && view !== 'reset' && (
            <div className="flex justify-center mb-6 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                className={`flex-1 py-2 text-center rounded-lg transition-all text-sm font-bold ${view === 'login' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600' : 'text-gray-500 dark:text-slate-300'}`}
                onClick={() => { setView('login'); setError(null); }}
              >
                {t('auth.login')}
              </button>
              <button
                className={`flex-1 py-2 text-center rounded-lg transition-all text-sm font-bold ${view === 'register' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600' : 'text-gray-500 dark:text-slate-300'}`}
                onClick={() => { setView('register'); setError(null); }}
              >
                {t('auth.register')}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME FIELD (Register only) */}
            {/* NAME & SURNAME (Register only) */}
            {view === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t('auth.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                    placeholder={t('auth.name_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t('auth.surname')}</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                    placeholder={t('auth.surname_placeholder')}
                  />
                </div>
              </div>
            )}

            {/* POSTAL CODE (Register only) */}
            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t('auth.postal_code')}</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                  placeholder="41..."
                />
              </div>
            )}

            {/* EMAIL FIELD (Login, Register, Forgot) */}
            {view !== 'reset' && (
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
                  />
                </div>
              </div>
            )}

            {/* PASSWORD FIELD (Login, Register, Reset) */}
            {view !== 'forgot' && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t('auth.password')}</label>
                  {(view === 'register' || view === 'reset') && <PasswordStrengthIndicator password={password} isError={error === t('auth.password_weak')} />}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* CONFIRM PASSWORD (Register, Reset) */}
            {(view === 'register' || view === 'reset') && (
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
                  />
                </div>
              </div>
            )}

            {/* ERRORS & SUCCESS */}
            {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50 flex items-start gap-2"><div className='mt-0.5'>⚠️</div><span>{error}</span></div>}
            {successMsg && <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-100 dark:border-green-900/50 flex items-center gap-2"><CheckCircle size={16} />{successMsg}</div>}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{t('auth.loading')}</span>
              ) : (
                <>
                  {view === 'login' && t('auth.enter')}
                  {view === 'register' && t('auth.register')}
                  {view === 'forgot' && <><Send size={16} /> {t('auth.send_link')}</>}
                  {view === 'reset' && t('auth.reset_password')}
                </>
              )}
            </button>
          </form>

          {/* FORGOT PASSWORD LINK */}
          {view === 'login' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => { setView('forgot'); setError(null); setSuccessMsg(null); }}
              >
                {t('auth.forgot')}
              </button>
            </div>
          )}

          {/* BACK TO LOGIN (Forgot/Reset) */}
          {(view === 'forgot' || (view as string) === 'reset') && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
              >
                {t('auth.back_to_login')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;