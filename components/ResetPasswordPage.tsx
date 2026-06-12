import React, { useState, useEffect } from 'react';
import { Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { apiResetPassword } from '../services/api';
import { useLocale } from '../i18n';
import PasswordStrengthIndicator, { isPasswordStrong } from './PasswordStrengthIndicator';

interface ResetPasswordPageProps {
    token: string;
    onSuccess: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ token, onSuccess }) => {
    const { t } = useLocale();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!password || !confirmPassword) {
            return setError(t('auth.fill_required') || 'Por favor, rellena todos los campos');
        }

        if (password !== confirmPassword) {
            return setError(t('auth.passwords_no_match') || 'Las contraseñas no coinciden');
        }

        if (!isPasswordStrong(password)) {
            return setError(t('auth.password_weak') || 'La contraseña debe ser más fuerte');
        }

        setLoading(true);
        try {
            await apiResetPassword(token, password);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
                <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6">
                    <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-black text-gray-800 dark:text-slate-100 mb-4">
                    {t('auth.reset_success')}
                </h2>
                <p className="text-gray-600 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg">
                    Tu contraseña ha sido actualizada. Ya puedes iniciar sesión en ReportaYa.
                </p>
                <button
                    onClick={onSuccess}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl shadow-lg hover:bg-blue-900 transition font-bold"
                >
                    {t('auth.back_to_login')} <ArrowRight size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl mt-12 border border-gray-100 dark:border-slate-800 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-800 dark:text-slate-100 mb-2">
                    {t('auth.new_password')}
                </h2>
                <p className="text-gray-500 dark:text-slate-400">
                    Introduce tu nueva contraseña para acceder a ReportaYa
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-200">
                            {t('auth.new_password')}
                        </label>
                        <PasswordStrengthIndicator password={password} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition bg-white dark:bg-slate-950/40 dark:text-slate-100"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">
                        {t('auth.confirm_password')}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition bg-white dark:bg-slate-950/40 dark:text-slate-100"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                        <span className="mt-0.5">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-blue-900 transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? t('auth.loading') : t('auth.reset_password')}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;
