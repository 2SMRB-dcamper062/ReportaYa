import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { UserRole, Issue, IssueStatus, IssueCategory, User, ShopItem } from './types';
import { MOCK_ISSUES, MOCK_USER, SEVILLA_CENTER, PREMIUM_COST_POINTS, SHOP_ITEMS, ALL_SHOP_ITEMS, EXCLUSIVE_BADGES } from './constants';
import IssueMap from './components/IssueMap';
import StatsPanel from './components/StatsPanel';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import ProfilePanel from './components/ProfilePanel';
import SettingsPanel from './components/SettingsPanel';
import ShopPanel from './components/ShopPanel';
import IssueDetailModal from './components/IssueDetailModal';
import { analyzeReportText, validateIssueEvidence } from './services/geminiService';
import {
  MapPin,
  Map,
  Plus,
  User as UserIcon,
  LogOut,
  Zap,
  Filter,
  CheckCircle,
  Clock,
  Search,
  Camera,
  ShoppingBag,
  Crown,
  Info
} from 'lucide-react';
import { Settings } from 'lucide-react';
import {
  apiSaveUser,
  apiSaveReport,
  apiGetReports,
  apiGetUser,
  apiGetUserByEmail,
  apiUpdateReport,
  getStoredUser,
  apiLogoutLocal
} from './services/api';
import { debounce } from 'lodash';

// --- Sub-components for cleaner App.tsx ---

type ThemeMode = 'light' | 'dark';
const THEME_STORAGE_KEY = 'themeMode';

function getInitialThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

const Header = ({ user, activeTab, setActiveTab, onLogout, onLoginClick }: any) => {
  const experience = user?.experience || 0;
  const level = Math.floor(experience / 100) + 1;
  const expCurrent = Math.max(0, experience - (level - 1) * 100);
  const expTotal = 100;
  const devItem = ALL_SHOP_ITEMS.find(i => i.id === 'tag_developer') || EXCLUSIVE_BADGES.find(i => i.id === 'tag_developer');
  const hasDev = (user?.inventory || []).includes('tag_developer');

  const prevLevelRef = useRef(level);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const curr = Math.floor((user?.experience || 0) / 100) + 1;
    if (curr > prevLevelRef.current) {
      setShowLevelUp(true);
      const t = setTimeout(() => setShowLevelUp(false), 2400);
      // update prev after timeout start
      prevLevelRef.current = curr;
      return () => clearTimeout(t);
    }
    prevLevelRef.current = curr;
  }, [user?.experience]);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md shadow-lg border-b border-white/5 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer group" onClick={() => setActiveTab('home')}>
          <img src="/logo.png" alt="Reporta Ya Logo" className="h-12 object-contain" />
        </div>

        <nav className="flex items-center gap-1 md:gap-2 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-sm">
          {/* Navigation for everyone */}
          <button
            onClick={() => setActiveTab('home')}
            className={`p-2.5 rounded-full transition-all duration-200 ${activeTab === 'home' ? 'bg-secondary text-primary shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            title="Inicio"
          >
            <Map size={18} />
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`p-2.5 rounded-full transition-all duration-200 ${activeTab === 'map' ? 'bg-secondary text-primary shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            title="Mapa de Incidencias"
          >
          {/* (Settings moved to profile area) */}
            <MapPin size={18} />
          </button>

          {/* Only Citizen can report */}
          {(user?.role === UserRole.CITIZEN || !user) && (
            <button
              onClick={() => {
                if (!user) onLoginClick();
                else setActiveTab('create');
              }}
              className={`p-2.5 rounded-full transition-all duration-200 ${activeTab === 'create' ? 'bg-secondary text-primary shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              title="Crear Reporte"
            >
              <Plus size={18} />
            </button>
          )}

          {/* Only Admin can see stats */}
          {user?.role === UserRole.ADMIN && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`p-2.5 rounded-full transition-all duration-200 ${activeTab === 'admin' ? 'bg-secondary text-primary shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              title="Panel Admin"
            >
              <Zap size={18} />
            </button>
          )}

          {/* Shop for Citizens */}
          {user?.role === UserRole.CITIZEN && (
            <button
              onClick={() => setActiveTab('shop')}
              className={`p-2.5 rounded-full transition-all duration-200 ${activeTab === 'shop' ? 'bg-secondary text-primary shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              title="Tienda de Puntos"
            >
              <ShoppingBag size={18} />
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full transition group border border-transparent ${activeTab === 'profile' ? 'bg-white/10 border-white/20' : 'hover:bg-white/5'}`}
              >
                <div className="relative">
                  {(() => {
                    const framePreview = user?.equippedFrame ? (SHOP_ITEMS.find(i => i.id === user.equippedFrame)?.previewValue || 'border-white/50') : 'border-white/50';
                    return (
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                        alt="avatar"
                        className={`w-9 h-9 rounded-full border-2 ${framePreview} object-cover`}
                      />
                    );
                  })()}

                  {/* Online Dot */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary"></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce z-50">
                    <Zap size={14} />
                  </div>
                  {user.premium && (
                    <div className="absolute -top-2 left-8 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shadow-md z-40">
                      <Crown size={12} />
                    </div>
                  )}
                  {/* (Removed avatar bubble) */}
                </div>

                <div className="hidden md:flex flex-col items-center justify-center leading-tight">
                  <div className="text-sm font-bold text-white group-hover:text-secondary transition text-center flex items-center gap-2">
                    <span>{user.name.split(' ')[0]}</span>
                    {hasDev && (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${devItem?.previewValue || 'bg-sky-200 text-sky-800'}`}>{user.role === UserRole.ADMIN ? 'ADMIN' : 'DEV'}</span>
                    )}
                  </div>

                  {user.role === UserRole.CITIZEN && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Lvl {level}</span>
                      <span className="text-[11px] text-white/70">{expCurrent}/{expTotal} EXP</span>
                    </div>
                  )}
                </div>
              </button>
              <button onClick={() => setActiveTab('settings')} className="p-2.5 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition" title="Ajustes">
                <Settings size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 text-primary dark:text-slate-100 px-5 py-2 rounded-full font-bold transition hover:bg-gray-100 dark:hover:bg-slate-800 shadow-md text-sm border border-transparent dark:border-slate-800"
            >
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const ReportForm = ({ onSubmit, onCancel }: { onSubmit: (data: Partial<Issue>) => void, onCancel: () => void }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState(IssueCategory.OTHER);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [evidenceStatus, setEvidenceStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [evidenceConfidence, setEvidenceConfidence] = useState<number | null>(null);
  const [evidenceReason, setEvidenceReason] = useState<string | null>(null);
  const [street, setStreet] = useState('');
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lon: number }[]>([]);

  const handleAIAnalysis = async () => {
    if (!desc) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeReportText(desc);
      setTitle(result.suggestedTitle);
      setCategory(result.category);
    } catch (e) {
      console.error("AI Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeolocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocating(false);
        },
        () => {
          alert('No se pudo obtener la ubicación. Usando el centro de Sevilla por defecto.');
          setLocation(SEVILLA_CENTER);
          setLocating(false);
        }
      );
    } else {
      setLocation(SEVILLA_CENTER);
      setLocating(false);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      title,
      description: desc,
      category,
      location: location || SEVILLA_CENTER,
      imageUrl: previewUrl || undefined
    });
  };

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}+Sevilla&format=json&addressdetails=1&limit=5&countrycodes=es`
      );
      const data = await response.json();
      const addresses = data.map((item: any) => ({
        label: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
      setSuggestions(addresses);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchSuggestions(street), 300);
    return () => clearTimeout(timeoutId);
  }, [street]);

  const handleSuggestionClick = (suggestion: { label: string; lat: number; lon: number }) => {
    setStreet(suggestion.label);
    setLocation({ lat: suggestion.lat, lng: suggestion.lon });
    setSuggestions([]);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl mt-6 border border-gray-100 dark:border-slate-800 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">Fotografía</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
            role="button"
            tabIndex={0}
            className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/40 hover:border-primary transition cursor-pointer group"
          >
            {previewUrl ? (
              <div className="w-full max-w-md">
                <img src={previewUrl} alt="preview" className="w-full h-48 object-cover rounded-md mb-3" />
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-300">
                  <span>{selectedFileName}</span>
                  <div className="flex items-center gap-3">
                    {evidenceStatus === 'validating' && (
                      <span className="text-xs text-gray-500 dark:text-slate-300">Validando...</span>
                    )}
                    {evidenceStatus === 'valid' && (
                      <span className="text-xs text-green-600 font-bold">✓ Evidencia válida ({(evidenceConfidence || 0).toFixed(2)})</span>
                    )}
                    {evidenceStatus === 'invalid' && (
                      <span className="text-xs text-red-600 font-bold">✕ No coincide</span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedFileName(null); setEvidenceStatus('idle'); setEvidenceConfidence(null); setEvidenceReason(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-red-500 font-bold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                {evidenceReason && (
                  <div className="text-xs text-gray-500 dark:text-slate-300 mt-2">{evidenceReason}</div>
                )}
              </div>
            ) : (
              <>
                <span className="text-sm font-medium">Haz clic o arrastra una foto</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                setSelectedFileName(f.name);
                const reader = new FileReader();
                reader.onload = async () => {
                  const dataUrl = reader.result as string;
                  setPreviewUrl(dataUrl);

                  // Validate evidence via Gemini service (simulated)
                  try {
                    setEvidenceStatus('validating');
                    setEvidenceConfidence(null);
                    setEvidenceReason(null);
                    const res = await validateIssueEvidence(dataUrl, category);
                    if (res.isValid) {
                      setEvidenceStatus('valid');
                      setEvidenceConfidence(res.confidence);
                      setEvidenceReason(res.reason);
                    } else {
                      setEvidenceStatus('invalid');
                      setEvidenceConfidence(res.confidence);
                      setEvidenceReason(res.reason);
                    }
                  } catch (err) {
                    setEvidenceStatus('invalid');
                    setEvidenceReason('Error al validar la imagen');
                  }
                };
                reader.readAsDataURL(f);
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">Descripción</label>
          <div className="relative">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition h-32 outline-none resize-none bg-white dark:bg-slate-950/40 dark:text-slate-100"
              placeholder="Describe el problema (ej. Farola rota en Alameda...)"
              required
            />
            <button
              type="button"
              onClick={handleAIAnalysis}
              disabled={!desc || isAnalyzing}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition disabled:opacity-50"
            >
              <Zap size={14} />
              {isAnalyzing ? 'Analizando...' : 'IA Auto-completar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition bg-white dark:bg-slate-950/40 dark:text-slate-100"
              placeholder="Título breve"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition bg-white dark:bg-slate-950/40 dark:text-slate-100"
            >
              {Object.values(IssueCategory).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">Ubicación</label>
          <p className="text-sm text-gray-600 dark:text-slate-300">Introduce la calle o detecta tu ubicación:</p>
          <div className="relative mt-2">
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition bg-white dark:bg-slate-950/40 dark:text-slate-100"
              placeholder="Escribe la calle..."
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg mt-1 w-full">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {suggestion.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={handleGeolocation}
            className={`w-full p-4 mt-4 rounded-xl border-2 flex items-center justify-center gap-2 transition font-bold ${
              location
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-emerald-950/25 dark:border-emerald-900/40 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <MapPin size={20} />
            {locating ? 'Localizando...' : location ? `Ubicación detectada` : 'Detectar mi ubicación'}
          </button>
        </div>

        {
          location && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-slate-300">Ubicación seleccionada:</p>
              <p className="text-sm font-bold text-gray-800 dark:text-slate-100">Latitud: {location.lat}, Longitud: {location.lng}</p>
            </div>
          )
        }

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-blue-900 transition font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Enviar Reporte
          </button>
        </div>
      </form >
    </div >
  );
};

const IssueCard: FC<{
  issue: Issue;
  onClick: () => void;
  isAdmin?: boolean;
  onStatusChange?: (id: string, s: IssueStatus) => void;
}> = ({ issue, onClick, isAdmin, onStatusChange }) => {
  const getStatusColor = (s: IssueStatus) => {
    switch (s) {
      case IssueStatus.RESOLVED: return 'bg-teal-100 text-teal-800 border-teal-200';
      case IssueStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  const getIcon = (s: IssueStatus) => {
    switch (s) {
      case IssueStatus.RESOLVED: return <CheckCircle size={14} />;
      case IssueStatus.IN_PROGRESS: return <Clock size={14} />;
      default: return <Info size={14} />;
    }
  }

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1"
    >
      <div className="h-44 w-full bg-gray-200 dark:bg-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition z-10"></div>
        <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
        <span className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 border z-20 shadow-sm uppercase tracking-wide ${getStatusColor(issue.status)}`}>
          {getIcon(issue.status)}
          {issue.status}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary transition leading-tight">{issue.title}</h3>
        <p className="text-gray-500 dark:text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">{issue.description}</p>

        <div className="flex justify-between items-center text-xs text-gray-400 dark:text-slate-400 border-t border-gray-50 dark:border-slate-800 pt-3">
          <span className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-gray-500 dark:text-slate-300 font-medium">{issue.category.split(' ')[0]}</span>
          <span>{issue.createdAt}</span>
        </div>

        {isAdmin && onStatusChange && (
          <div className="mt-4 pt-3 border-t border-gray-50 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <select
              className="w-full text-xs p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-800 dark:text-slate-100"
              value={issue.status}
              onChange={(e) => onStatusChange(issue.id, e.target.value as IssueStatus)}
            >
              {Object.values(IssueStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main App Component ---

const App = () => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialThemeMode());
  const [locale, setLocale] = useState<string>(() => {
    try { return localStorage.getItem('locale') || 'es'; } catch { return 'es'; }
  });
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'create' | 'admin' | 'profile' | 'shop'>('home');
  const [issues, setIssues] = useState<Issue[]>([]);

  // Apply theme globally (Tailwind dark mode uses the "dark" class)
  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', themeMode === 'dark');
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // ignore
    }
  }, [themeMode]);

  // Load reports and refresh user session from MongoDB on mount
  useEffect(() => {
    // 1. Load reports
    apiGetReports().then(reports => {
      if (reports.length > 0) {
        setIssues(reports);
      }
    }).catch(err => console.error('Error cargando reportes desde MongoDB:', err));

    // 2. Refresh user data if logged in
    const currentUser = getStoredUser();
    if (currentUser) {
      apiGetUser(currentUser.id).then(fresh => {
        if (fresh) {
          setUser(fresh);
          localStorage.setItem('currentUser', JSON.stringify(fresh));
        }
      }).catch(err => console.warn('No se pudo refrescar la sesión del servidor:', err));
    }
  }, []);

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [focusedIssue, setFocusedIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Auth State
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const handleLogin = (user: User) => {
    setAuthModalOpen(false);

    // Asegurar que las propiedades necesarias estén inicializadas y tengan valores por defecto
    setUser({
      ...user,
      inventory: user.inventory || [],
      equippedFrame: user.equippedFrame || null,
      equippedBackground: user.equippedBackground || null,
      points: user.points || 0,
      experience: user.experience || 0,
    });

    // Redirect logic based on role
    if (user.role === UserRole.ADMIN) {
      setActiveTab('admin');
    } else {
      setActiveTab('map');
    }
  };

  const handleLogout = () => {
    apiLogoutLocal();
    setUser(null);
    setActiveTab('home');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    await apiSaveUser(updatedUser);
  };

  const handleShopPurchase = (item: ShopItem) => {
    if (!user) return;
    // Prevent non-premium users from purchasing premium items
    const isPremiumItem = (item.cost || 0) >= 400;
    if (isPremiumItem && !user.premium) {
      alert('Este artículo solo está disponible para usuarios Premium. Consigue Premium para poder reclamarlo.');
      return;
    }

    if (user.points < item.cost) {
      alert("No tienes suficientes puntos.");
      return;
    }

    const updatedUser = {
      ...user,
      points: user.points - item.cost,
      inventory: [...(user.inventory || []), item.id]
    };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    // Persist profile change
    apiSaveUser(updatedUser).catch(err => console.error('Error guardando compra en tienda:', err));
  };

  const handleEquipItem = (item: ShopItem) => {
    if (!user) return;

    const updatedUser = { ...user };
    if (item.type === 'frame') {
      updatedUser.equippedFrame = item.id;
    } else if (item.type === 'background') {
      updatedUser.equippedBackground = item.id;
    }
    setUser(updatedUser);
  };

  const handleBuyPremium = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Purchase premium with points
    const cost = PREMIUM_COST_POINTS || 500;
    if ((user.points || 0) < cost) {
      alert(`No tienes suficientes puntos. Necesitas ${cost} pts para comprar Premium.`);
      return;
    }

    const updatedUser: User = {
      ...user,
      premium: true,
      points: (user.points || 0) - cost,
    };
    setUser(updatedUser);
    apiSaveUser(updatedUser).catch(err => console.error('Error guardando compra premium:', err));
    alert('Gracias por comprar Premium. Tu cuenta ha sido actualizada.');
  };

  const handleStartPremiumCheckout = async (email?: string) => {
    try {
      const res = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.id) throw new Error('No session id returned');

      // Load Stripe.js dynamically
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || (window as any).STRIPE_PUBLISHABLE_KEY || '');
      if (!stripe) throw new Error('Stripe failed to load');
      const result = await stripe.redirectToCheckout({ sessionId: data.id });
      if ((result as any).error) {
        alert((result as any).error.message || 'Error redirigiendo a pago');
      }
    } catch (err: any) {
      console.error('Error iniciando checkout:', err);
      alert('No se pudo iniciar el pago: ' + (err.message || err));
    }
  };

  const handleCreateIssue = async (data: Partial<Issue>) => {
    const newIssue: Issue = {
      id: `${Date.now()}`,
      ...data,
      status: IssueStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creando nuevo reporte:', newIssue); // Log para depuración

    try {
      setIssues(prev => [...prev, newIssue]);

      // Persist report in background so UI/navigation isn't blocked by large image uploads
      apiSaveReport(newIssue)
        .then(() => console.log('Reporte guardado exitosamente en MongoDB.'))
        .catch(err => console.error('Error al guardar el reporte (background):', err));

      // Otorgar puntos y experiencia al enviar el reporte (no bloqueante)
      if (user) {
        // Puntos normales por reporte
        const newPoints = (user.points || 0) + 10;
        const updatedUser = {
          ...user,
          points: newPoints,
          experience: (user.experience || 0) + 20,
        };

        // Update UI immediately
        setUser(updatedUser);

        // Persist in background (don't await to avoid blocking map navigation)
        apiSaveUser(updatedUser).catch(err => console.error('Error guardando perfil de usuario:', err));
      }

      // Navegar al mapa y enfocar la incidencia creada.
      // Retrasamos el setFocusedIssue para asegurarnos de que IssueMap haya creado los marcadores
      setActiveTab('map');
      setFocusedIssue(null);
      setTimeout(() => {
        setFocusedIssue(newIssue);
      }, 600);
    } catch (error) {
      console.error('Error al procesar el reporte en el cliente:', error);
    }
  };

  const handleStatusChange = (id: string, newStatus: IssueStatus) => {
    setIssues(issues.map(i => i.id === id ? { ...i, status: newStatus } : i));
    // Persist status change to MongoDB
    apiUpdateReport(id, { status: newStatus }).catch(err => console.error('Error actualizando estado en MongoDB:', err));
  };

  const handleIssueUpdate = (updatedIssue: Issue) => {
    setIssues(issues.map(i => i.id === updatedIssue.id ? updatedIssue : i));
    setSelectedIssue(updatedIssue); // Update the modal view as well
    // Persist issue update to MongoDB
    apiUpdateReport(updatedIssue.id, updatedIssue).catch(err => console.error('Error actualizando reporte en MongoDB:', err));
  };

  const filteredIssues = issues.filter(i => {
    const matchCat = filterCategory === 'All' || i.category === filterCategory;
    const matchStat = filterStatus === 'All' || i.status === filterStatus;
    return matchCat && matchStat;
  });

  // Filter Bar Component
  const FilterBar = () => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-6 flex flex-wrap gap-4 items-center animate-fade-in sticky top-20 z-30">
      <div className="flex items-center gap-2 text-primary font-bold">
        <Filter size={20} />
        <span className="hidden sm:inline">Filtrar:</span>
      </div>
      <select
        className="p-2 px-3 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-800 dark:text-slate-100"
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="All">Todas las Categorías</option>
        {Object.values(IssueCategory).map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        className="p-2 px-3 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-800 dark:text-slate-100"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="All">Todos los Estados</option>
        {Object.values(IssueStatus).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="ml-auto text-sm text-gray-500 dark:text-slate-300 font-medium">
        <strong>{filteredIssues.length}</strong> resultados
      </div>
    </div>
  );

  // Las funciones saveUserProfile y saveReport ahora usan la API REST de MongoDB
  const saveUserProfile = async (user: User) => {
    try {
      await apiSaveUser(user);
      console.log('Perfil actualizado correctamente en MongoDB.');
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
    }
  };

  const saveReport = async (report: Issue) => {
    try {
      await apiSaveReport(report);
      console.log('Reporte guardado correctamente en MongoDB.');
    } catch (error) {
      console.error('Error al guardar el reporte:', error);
    }
  };

  // Social login handlers removed - No longer supported with MongoDB manual auth

  return (
    <div className="min-h-screen bg-bgLight dark:bg-slate-950 font-sans pb-10 pt-[72px]">

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthScreen
          onLogin={handleLogin}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {/* Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          currentUser={user}
          onClose={() => setSelectedIssue(null)}
          onFocusLocation={(loc) => setFocusedIssue({ ...selectedIssue, location: loc })}
          onUpdateIssue={handleIssueUpdate}
        />
      )}

      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onLoginClick={() => setAuthModalOpen(true)}
      />

      <main className="container mx-auto px-4 pt-6">

        {activeTab === 'home' && (
          <LandingPage onStart={() => {
            if (user) setActiveTab('map');
            else setAuthModalOpen(true);
          }} />
        )}

        {/* Dynamic Content */}

        {activeTab === 'map' && (
          <div className="h-[calc(100vh-160px)] flex flex-col animate-fade-in">
            <FilterBar />

            <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
              {/* Sidebar List - Left side */}
              <div className="w-full md:w-1/3 lg:w-[380px] overflow-y-auto pr-2 space-y-4 pb-4 order-2 md:order-1 custom-scrollbar">
                {filteredIssues.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={() => setSelectedIssue(issue)}
                    isAdmin={user?.role === UserRole.ADMIN}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {filteredIssues.length === 0 && (
                  <div className="p-12 text-center text-gray-400 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center">
                    <Search size={40} className="mb-3 opacity-20" />
                    <p>No hay incidencias.</p>
                  </div>
                )}
              </div>

              {/* Map Container - Right side */}
              <div className="flex-1 relative rounded-3xl overflow-hidden border-8 border-white dark:border-slate-900 shadow-xl min-h-[400px] order-1 md:order-2">
                <IssueMap
                  issues={filteredIssues}
                  onSelectIssue={(i) => setSelectedIssue(i)}
                  focusedIssue={focusedIssue}
                />

                {/* Map Overlay Legend */}
                <div className="absolute bottom-6 left-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl text-xs space-y-2 z-[400] border border-gray-100 dark:border-slate-700">
                  <div className="font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider mb-2">Leyenda</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#EF4444] shadow-sm"></div>Pendiente</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-sm"></div>En Proceso</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#48C9B0] shadow-sm"></div>Resuelto</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && user?.role === UserRole.CITIZEN && (
          <ReportForm
            onSubmit={handleCreateIssue}
            onCancel={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'admin' && user?.role === UserRole.ADMIN && (
          <StatsPanel issues={issues} />
        )}

        {activeTab === 'profile' && user && (
          <ProfilePanel
            user={user}
            issues={issues}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            user={user}
            onLogout={handleLogout}
            themeMode={themeMode}
            onThemeModeChange={setThemeMode}
            locale={locale}
            onLocaleChange={(l) => { setLocale(l); try { localStorage.setItem('locale', l); } catch {} }}
          />
        )}

        {activeTab === 'shop' && user && (
          <ShopPanel
            user={user}
            onPurchase={handleShopPurchase}
            onEquip={handleEquipItem}
            onBuyPremium={handleBuyPremium}
          />
        )}

        {/* Access Denied / Fallback */}
        {activeTab === 'admin' && user?.role !== UserRole.ADMIN && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-4">
              <Info size={48} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-700 dark:text-slate-100">Acceso Restringido</h3>
            <p>Solo personal autorizado del Ayuntamiento.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
