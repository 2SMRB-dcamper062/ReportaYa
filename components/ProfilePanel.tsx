import React, { useState, useRef } from 'react';
import { User, Issue, UserRole, IssueStatus } from '../types';
import { SHOP_ITEMS, ALL_SHOP_ITEMS } from '../constants';
import { User as UserIcon, Mail, Shield, Camera, Edit2, Save, X, Star, Trophy, Gift, Lock, Bus, Landmark, Music, Zap, Check, Crown } from 'lucide-react';

interface ProfilePanelProps {
  user: User;
  issues: Issue[];
  onUpdateUser: (updatedUser: User) => void;
}

// Reward Configuration
const REWARDS = [

];

const ProfilePanel: React.FC<ProfilePanelProps> = ({ user, issues, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [profileTag, setProfileTag] = useState<string>(user.profileTag || '');
    const [selectedTagId, setSelectedTagId] = useState<string>(user.profileTag && ALL_SHOP_ITEMS.find(i => i.id === user.profileTag) ? user.profileTag : '');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stats
  const userIssues = issues.filter(i => i.author === user.name);
  const resolvedCount = userIssues.filter(i => i.status === IssueStatus.RESOLVED).length;
  const adminTotal = issues.length;
  const adminResolved = issues.filter(i => i.status === IssueStatus.RESOLVED).length;

  // Gamification Logic
    const currentPoints = user.points || 0;
    const experience = user.experience || 0;
    const currentLevel = Math.floor(experience / 100) + 1;
    const prevLevelExp = (currentLevel - 1) * 100;
    const nextLevelExp = currentLevel * 100;
    const expToNext = Math.max(0, nextLevelExp - experience);
    const expCurrent = Math.max(0, experience - prevLevelExp);
    const progressPercent = Math.min(100, Math.max(0, (expCurrent / 100) * 100));

  // Get Equipped Styles
  const equippedBg = SHOP_ITEMS.find(i => i.id === user.equippedBackground)?.previewValue || 'bg-gradient-to-r from-primary to-blue-800';
  const equippedFrame = SHOP_ITEMS.find(i => i.id === user.equippedFrame)?.previewValue || 'border-white';

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({ ...user, name, avatar, profileTag: selectedTagId || '' });
        setIsEditing(false);
    };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8 pb-10">
      
      {/* Modern Header Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative">
        {/* Dynamic Background */}
        <div className={`h-48 w-full ${equippedBg} relative`}>
            {/* Overlay Gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        
        <div className="px-8 pb-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between -mt-16 mb-4">
            
            <div className="flex items-end gap-6">
                <div className="relative group">
                    {/* Dynamic Frame */}
                    <div className="relative">
                        <img 
                            src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`} 
                            alt="Profile" 
                            className={`w-32 h-32 rounded-full border-[6px] shadow-2xl bg-white object-cover ${equippedFrame}`}
                        />
                         {/* Level Badge Overlapping */}
                         {user.role === UserRole.CITIZEN && (
                             <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-white shadow-md z-10 text-sm">
                                {currentLevel}
                             </div>
                         )}
                    </div>

                                        

                                        {isEditing && (
                                                <>
                                                    <button 
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="absolute bottom-2 right-8 bg-secondary text-white p-2 rounded-full hover:bg-teal-400 transition shadow-lg transform hover:scale-110"
                                                        title="Subir foto"
                                                    >
                                                        <Camera size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setAvatar('')}
                                                        className="absolute bottom-2 right-20 bg-white text-red-500 p-2 rounded-full hover:bg-gray-50 transition shadow-lg transform hover:scale-110"
                                                        title="Eliminar foto"
                                                    >
                                                        <X size={14} />
                                                    </button>

                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const f = e.target.files && e.target.files[0];
                                                            if (!f) return;
                                                            const reader = new FileReader();
                                                            reader.onload = () => {
                                                                setAvatar(reader.result as string);
                                                            };
                                                            reader.readAsDataURL(f);
                                                        }}
                                                    />
                                                </>
                                        )}
                </div>

                <div className="mb-2 hidden md:block">
                        <div>
                            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                                <span className="flex items-center gap-2">
                                    <span>{user.name}</span>
                                    {user.role === UserRole.ADMIN && <Shield className="text-secondary fill-secondary/20 w-6 h-6" />}
                                    {user.premium && (
                                        <div className="ml-1 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shadow-md">
                                            <Crown size={14} />
                                        </div>
                                    )}
                                </span>
                            </h1>
                            <p className="text-gray-500 font-medium">
                                {ALL_SHOP_ITEMS.find(i => i.id === user.profileTag)?.name || user.profileTag || (user.role === UserRole.ADMIN ? 'Administrador Municipal' : 'Ciudadano activo')}
                            </p>
                        </div>
                </div>
            </div>

            <div className="mt-4 md:mt-0 flex gap-3">
                 {!isEditing ? (
                    <button 
                        onClick={() => { setSelectedTagId(user.profileTag || ''); setIsEditing(true); }}
                        className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 hover:shadow-md transition shadow-sm flex items-center gap-2"
                    >
                        <Edit2 size={16} /> Editar
                    </button>
                 ) : (
                    <>
                        <button 
                            onClick={() => { setIsEditing(false); setName(user.name); setAvatar(user.avatar || ''); setSelectedTagId(user.profileTag || ''); }}
                            className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSave}
                            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-900 shadow-lg transition transform hover:scale-105"
                        >
                            Guardar Cambios
                        </button>
                    </>
                 )}
            </div>
          </div>

          {/* Mobile Name Fallback */}
          <div className="md:hidden mt-2 mb-4">
               <div>
                    <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <span>{user.name}</span>
                        {user.premium && (
                            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shadow-md">
                                <Crown size={12} />
                            </div>
                        )}
                    </h1>
                    <p className="text-gray-500 text-sm">{ALL_SHOP_ITEMS.find(i => i.id === user.profileTag)?.name || user.profileTag || (user.role === UserRole.ADMIN ? 'Administrador Municipal' : 'Ciudadano activo')}</p>
               </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info & Stats */}
        <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        {/* Recompensas */}
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">Información Personal</h3>
                <div className="space-y-4">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400">Nombre</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-xl" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Tag de perfil (adquiridos)</label>
                                <select value={selectedTagId} onChange={(e) => setSelectedTagId(e.target.value)} className="w-full p-3 border rounded-xl">
                                    <option value="">Ninguno</option>
                                    {ALL_SHOP_ITEMS.filter(i => i.type === 'badge' && (user.inventory || []).includes(i.id)).map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Email</label>
                                <div className="p-3 bg-gray-50 rounded">{user.email || ''}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Rol</label>
                                <div className="p-3 bg-gray-50 rounded">{user.role === UserRole.ADMIN ? 'Administrador' : 'Ciudadano'}</div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                                    <Mail size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="text-sm font-semibold truncate">{user.email || user.name.replace(/\s+/g, '.').toLowerCase() + '@reportaya.es'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Rol</p>
                                    <p className="text-sm font-semibold capitalize">{user.role === UserRole.ADMIN ? 'Administrador' : 'Ciudadano'}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">Estadísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-gray-50 rounded-xl text-center">
                         <span className="block text-3xl font-black text-primary">{userIssues.length}</span>
                         <span className="text-xs text-gray-500 font-medium">Reportes</span>
                     </div>
                     <div className="p-4 bg-green-50 rounded-xl text-center">
                         <span className="block text-3xl font-black text-secondary">{resolvedCount}</span>
                         <span className="text-xs text-green-700 font-medium">Resueltos</span>
                     </div>
                </div>
            </div>
        </div>

        {/* Right Column: Gamification Center */}
        <div className="lg:col-span-2">
             {user.role === UserRole.CITIZEN ? (
                <div className="bg-gradient-to-br from-indigo-900 to-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary opacity-10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Star className="text-yellow-400 fill-yellow-400" /> Nivel {currentLevel}
                                </h2>
                                <p className="text-blue-200 text-sm mt-1">Sigue reportando para ganar EXP y subir de nivel.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-yellow-400 tracking-tight">{experience} <span className="text-lg text-white font-medium">EXP</span></div>
                                <div className="text-xs text-blue-200 font-medium bg-white/10 px-2 py-1 rounded inline-block mt-1">Próximo Nivel: {nextLevelExp} EXP</div>
                            </div>
                        </div>

                        {/* Custom Progress Bar */}
                        <div className="relative h-6 bg-black/20 rounded-full mb-10 p-1 backdrop-blur-sm border border-white/10">
                            <div 
                                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-1000 relative"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center -mr-4 border-2 border-yellow-500">
                                    <Zap size={14} className="text-yellow-600 fill-yellow-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {REWARDS.map((reward, idx) => {
                                const isUnlocked = currentPoints >= reward.points;
                                return (
                                    <div key={idx} className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${isUnlocked ? 'bg-white text-gray-800 border-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-yellow-100 text-yellow-700' : 'bg-white/10 text-gray-500'}`}>
                                            {isUnlocked ? reward.icon : <Lock size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm leading-tight mb-1">{reward.title}</div>
                                            <div className="text-xs opacity-70">{reward.points} pts necesarios</div>
                                        </div>
                                        {isUnlocked && <Check className="ml-auto text-green-500" size={20} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
             ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-primary/20 overflow-hidden h-full flex flex-col relative">
                     <div className="bg-primary/5 p-8 flex flex-col items-center justify-center text-center flex-1">
                         <div className="w-24 h-24 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 transform rotate-3">
                             <Shield size={48} />
                         </div>
                         <h2 className="text-3xl font-bold text-primary mb-2">Panel de Administrador</h2>
                         <p className="text-gray-500 max-w-md">
                             Acceso privilegiado para la gestión de servicios urbanos.
                             Utiliza el panel principal para gestionar incidencias.
                         </p>
                     </div>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
