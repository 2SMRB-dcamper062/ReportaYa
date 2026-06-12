import React, { useRef, useEffect } from 'react';
import { X, User as UserIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { User } from '../types';

interface DropdownMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  show: boolean;
}

interface MobileDropdownMenuProps {
  items: DropdownMenuItem[];
  activeId: string;
  onSelect: (itemId: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  user?: User | null;
  onProfileClick?: () => void;
  className?: string;
}

/**
 * Componente de menú desplegable optimizado para móvil
 * Se abre/cierra con botón hamburguesa desde el header
 */
const MobileDropdownMenu: React.FC<MobileDropdownMenuProps> = ({
  items,
  activeId,
  onSelect,
  isOpen,
  onToggle,
  user,
  onProfileClick,
  className = '',
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  const handleSelect = (itemId: string) => {
    onSelect(itemId);
    onToggle(false);
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    onToggle(false);
  };

  const visibleItems = items.filter(item => item.show);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className={`fixed inset-x-4 top-[72px] z-40 ${className}`}>
      {/* Overlay de cierre */}
      <div
        className="fixed inset-0 z-30 bg-black/40"
        onClick={() => onToggle(false)}
      />

      {/* Menú desplegable - ancho completo */}
      <div className="relative z-40 bg-blue-900/95 border-2 border-white/20 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Header con perfil y botón cerrar */}
        {user && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 flex-1 hover:opacity-80 transition"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt="avatar"
                className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
              />
              <div className="text-left">
                <div className="text-sm font-bold text-white">{user.name}</div>
                <div className="text-xs text-cyan-300">Ver perfil</div>
              </div>
            </button>
            <button
              onClick={() => onToggle(false)}
              className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Items del menú */}
        <div className="flex flex-col gap-1 p-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-cyan-500/30 text-white border-l-4 border-cyan-400 font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-medium flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileDropdownMenu;
