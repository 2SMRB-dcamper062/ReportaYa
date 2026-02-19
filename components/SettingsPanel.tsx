import React, { useState } from 'react';
import { User } from '../types';
import { apiChangePassword, getStoredUser } from '../services/api';
import { Lock, LogOut, SunMoon, Globe } from 'lucide-react';

interface SettingsPanelProps {
  user: User | null;
  onLogout: () => void;
  themeMode: 'light' | 'dark';
  onThemeModeChange: (mode: 'light' | 'dark') => void;
  locale: string;
  onLocaleChange: (l: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ user, onLogout, themeMode, onThemeModeChange }) => {
  const [localeState, setLocaleState] = useState<string>(localStorage.getItem('locale') || 'es');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleLocaleChange = (l: string) => {
    setLocaleState(l);
    try { localStorage.setItem('locale', l); } catch {}
    if (typeof (window as any).onLocaleChange === 'function') {
      try { (window as any).onLocaleChange(l); } catch {}
    }
    setMsg('Idioma guardado');
    setTimeout(() => setMsg(null), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setMsg('No estás autenticado');
    if (!oldPassword || !newPassword) return setMsg('Rellena ambos campos');
    setChanging(true);
    try {
      await apiChangePassword(user.id, oldPassword, newPassword);
      setMsg('Contraseña actualizada correctamente');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMsg(err?.message || 'Error actualizando contraseña');
    } finally {
      setChanging(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="font-bold text-gray-700 dark:text-slate-300 mb-4">Ajustes</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Idioma</label>
            <div className="mt-2 flex gap-2">
              <select value={localeState} onChange={(e) => { handleLocaleChange(e.target.value); if (typeof onLocaleChange === 'function') onLocaleChange(e.target.value); }} className="w-full p-3 border rounded-xl bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">Tema</label>
            <div className="mt-2 flex items-center gap-3">
              <button onClick={() => onThemeModeChange(themeMode === 'dark' ? 'light' : 'dark')} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-sm">
                <SunMoon className="inline mr-2" /> Alternar tema ({themeMode})
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-400">Cuenta</label>
            <div className="mt-2 flex gap-2">
              <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <LogOut /> Cerrar sesión
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-100 dark:border-slate-800">
            <h4 className="font-semibold mb-2">Cambiar contraseña</h4>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <input type="password" placeholder="Contraseña actual" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full p-3 border rounded-xl bg-white dark:bg-slate-950/40" />
              </div>
              <div>
                <input type="password" placeholder="Nueva contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 border rounded-xl bg-white dark:bg-slate-950/40" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={changing} className="bg-primary text-white px-4 py-2 rounded-xl">{changing ? 'Guardando...' : 'Cambiar contraseña'}</button>
                <button type="button" onClick={() => { setOldPassword(''); setNewPassword(''); }} className="px-4 py-2 rounded-xl border">Limpiar</button>
              </div>
              {msg && <div className="text-sm text-gray-500 mt-2">{msg}</div>}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
