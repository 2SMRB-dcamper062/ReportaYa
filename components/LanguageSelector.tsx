import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white flex items-center gap-1"
            title="Cambiar idioma / Change language"
        >
            <Globe size={20} />
            <span className="text-xs font-bold uppercase">{i18n.language}</span>
        </button>
    );
};
