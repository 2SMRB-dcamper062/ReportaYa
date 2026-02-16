import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
        >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
};

export default ThemeToggle;
