import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="p-2.5 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-1"
            title="Cambiar Idioma / Change Language"
        >
            <Globe size={18} />
            <span className="text-xs font-bold uppercase">{i18n.language}</span>
        </button>
    );
};

export default LanguageSwitcher;
