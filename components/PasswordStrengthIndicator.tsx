/**
 * PasswordStrengthIndicator.tsx
 * Visual checklist showing password requirements as the user types.
 */
import React from 'react';
import { Check, X } from 'lucide-react';
import { useLocale } from '../i18n';

interface Props {
    password: string;
    isError?: boolean;
}

export function getPasswordRules(password: string) {
    return [
        { key: 'min8', met: password.length >= 8 },
        { key: 'upper', met: /[A-Z]/.test(password) },
        { key: 'lower', met: /[a-z]/.test(password) },
        { key: 'number', met: /[0-9]/.test(password) },
        { key: 'special', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) },
    ];
}

export function isPasswordStrong(password: string): boolean {
    return getPasswordRules(password).every(r => r.met);
}

const PasswordStrengthIndicator: React.FC<Props> = ({ password, isError }) => {
    const { t } = useLocale();
    const rules = getPasswordRules(password);
    const [isOpen, setIsOpen] = React.useState(false);

    const labels: Record<string, string> = {
        min8: t('pw.min8') || 'Mínimo 8 caracteres',
        upper: t('pw.upper') || 'Una letra mayúscula',
        lower: t('pw.lower') || 'Una letra minúscula',
        number: t('pw.number') || 'Un número',
        special: t('pw.special') || 'Un carácter especial (!@#$%...)',
    };

    if (!password && !isOpen) return null; // Hide if no password and not open (optional, or always show icon?)
    // Actually user wants "?" icon to be there. So let's always render icon if we want consistent UI, or only when typing.
    // User said "appear when clicking ?".

    // Let's implement it as an independent component that manages its own popover

    return (
        <div className="relative inline-block ml-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`transition focus:outline-none ${isError ? 'text-red-500' : 'text-gray-400 hover:text-blue-500'}`}
                title={t('pw.requirements') || 'Requisitos de contraseña'}
            >
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">?</div>
            </button>

            {isOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50 text-left">
                    <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                        {t('pw.requirements') || 'La contraseña debe tener:'}
                    </p>
                    <ul className="space-y-1">
                        {rules.map(rule => (
                            <li key={rule.key} className={`flex items-center gap-2 text-xs transition-colors ${rule.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {rule.met
                                    ? <Check size={12} className="shrink-0 text-green-600 dark:text-green-400" />
                                    : <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-slate-600 shrink-0" />
                                }
                                <span>{labels[rule.key]}</span>
                            </li>
                        ))}
                    </ul>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white dark:border-t-slate-800"></div>
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;
