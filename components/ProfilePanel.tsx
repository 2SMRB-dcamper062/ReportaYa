import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Issue, UserRole, IssueStatus } from '../types';
import { SHOP_ITEMS, ALL_SHOP_ITEMS, EXCLUSIVE_BADGES } from '../constants';
import { User as UserIcon, Mail, Shield, Camera, Edit2, Save, X, Star, Trophy, Gift, Lock, Bus, Landmark, Music, Zap, Check, Crown } from 'lucide-react';

interface ProfilePanelProps {
    user: User;
    issues: Issue[];
    onUpdateUser: (updatedUser: User) => void;
}

// Reward Configuration
// (Recompensas eliminadas: se quitaron del componente por petición)

const ProfilePanel: React.FC<ProfilePanelProps> = ({ user, issues, onUpdateUser }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [profileTag, setProfileTag] = useState<string>(user.profileTag || '');
    const [selectedTagId, setSelectedTagId] = useState<string>(user.profileTag && (ALL_SHOP_ITEMS.find(i => i.id === user.profileTag) || EXCLUSIVE_BADGES.find(i => i.id === user.profileTag)) ? user.profileTag : '');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // Stats

    // Resolve profile tag name from shop or dynamic level badges
    const findDynamicBadge = (id?: string) => {
        if (!id) return undefined;
        const fromShop = ALL_SHOP_ITEMS.find(i => i.id === id) || EXCLUSIVE_BADGES.find(i => i.id === id);
        if (fromShop) return fromShop;
        const m = id.match(/^tag_nivel_(\d+)$/);
        if (!m) return undefined;
        const lvl = parseInt(m[1], 10);
        return {
            id,
            name: `${t('profile.level')} ${lvl}`,
            description: `${t('profile.unlocked_with_level')} ${lvl}.`,
            cost: 0,
            type: 'badge' as const,
            previewValue: `bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-800`,
            minLevel: lvl
        } as any;
    };

    const profileTagItem = findDynamicBadge(user.profileTag);
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

    // Sliding window state for infinite level badges
    const [badgeWindowStart, setBadgeWindowStart] = useState(0);
    const VISIBLE_BADGE_COUNT = 6;
    const badgeStyles = [
        'bg-gradient-to-r from-green-200 to-green-400 text-green-800',
        'bg-gradient-to-r from-teal-200 to-teal-400 text-teal-800',
        'bg-gradient-to-r from-blue-200 to-blue-400 text-blue-800',
        'bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-800',
        'bg-gradient-to-r from-purple-200 to-purple-400 text-purple-800'
    ];

    React.useEffect(() => {
        const highestUnlockedIndex = Math.floor(currentLevel / 20) - 1;
        if (highestUnlockedIndex < 0) return;
        const rightmostIndex = badgeWindowStart + VISIBLE_BADGE_COUNT - 1;
        if (highestUnlockedIndex > rightmostIndex) {
            setBadgeWindowStart(Math.max(0, highestUnlockedIndex - (VISIBLE_BADGE_COUNT - 1)));
        }
    }, [currentLevel]);
    const unlockedDynamicBadges = [] as { id: string; name: string }[];
    for (let lvl = 20; lvl <= currentLevel; lvl += 20) {
        const id = `tag_nivel_${lvl}`;
        unlockedDynamicBadges.push({ id, name: `${t('profile.level')} ${lvl}` });
    }

    // Get Equipped Styles
    const equippedBg = SHOP_ITEMS.find(i => i.id === user.equippedBackground)?.previewValue || 'bg-gradient-to-r from-primary to-blue-800';
    const equippedFrame = SHOP_ITEMS.find(i => i.id === user.equippedFrame)?.previewValue || 'border-white';

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({ ...user, name, avatar, profileTag: selectedTagId || '' });
        setIsEditing(false);
    };

    // Badges owned by the user (includes exclusive badges for admin/dev visibility)
    const ownedBadges = ([...ALL_SHOP_ITEMS, ...EXCLUSIVE_BADGES].filter(i => i.type === 'badge' && (((user.inventory || []).includes(i.id)) || (i.id === 'tag_admin' && user.role === UserRole.ADMIN))));

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-8 pb-10">

            {/* Modern Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden relative transition-colors">
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
                                            title={t('profile.upload_photo', 'Subir foto')}
                                        >
                                            <Camera size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setAvatar('')}
                                            className="absolute bottom-2 right-20 bg-white dark:bg-slate-700 text-red-500 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-600 transition shadow-lg transform hover:scale-110"
                                            title={t('profile.remove_photo', 'Eliminar foto')}
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
                                    <h1 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                                        <span className="flex items-center gap-2">
                                            <span>{user.name}</span>
                                            {user.role === UserRole.ADMIN && <Shield className="text-secondary fill-secondary/20 w-6 h-6" />}
                                            {user.premium && (
                                                <div className="ml-1 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shadow-md">
                                                    <Crown size={14} />
                                                </div>
                                            )}
                                            {profileTagItem && (
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${profileTagItem.previewValue} ${user.profileTag === profileTagItem.id ? 'ring-2 ring-yellow-400' : ''}`}>
                                                    {profileTagItem.name}
                                                </span>
                                            )}
                                            {user.role === UserRole.ADMIN && (
                                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                                    ADMIN
                                                </span>
                                            )}
                                            {/* DEV badge if in inventory */}
                                            {/* Removed inline DEV/ADMIN label per request; Developer is highlighted in the Insignias section */}
                                        </span>
                                    </h1>
                                    <p className="text-gray-500 font-medium">
                                        {profileTagItem?.name || user.profileTag || (user.role === UserRole.ADMIN ? t('role.admin_municipal', 'Administrador Municipal') : t('role.citizen', 'Ciudadano activo'))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 md:mt-0 flex gap-3">
                            {!isEditing ? (
                                <button
                                    onClick={() => { setSelectedTagId(user.profileTag || ''); setIsEditing(true); }}
                                    className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-600 hover:shadow-md transition shadow-sm flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> {t('profile.edit')}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setIsEditing(false); setName(user.name); setAvatar(user.avatar || ''); setSelectedTagId(user.profileTag || ''); }}
                                        className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition"
                                    >
                                        {t('profile.cancel')}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-900 shadow-lg transition transform hover:scale-105"
                                    >
                                        {t('profile.save_changes')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Name Fallback */}
                    <div className="md:hidden mt-2 mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                                <span>{user.name}</span>
                                {user.premium && (
                                    <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shadow-md">
                                        <Crown size={12} />
                                    </div>
                                )}
                                {profileTagItem && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${profileTagItem.previewValue} ${user.profileTag === profileTagItem.id ? 'ring-2 ring-yellow-400' : ''}`}>
                                        {profileTagItem.name}
                                    </span>
                                )}
                                {user.role === UserRole.ADMIN && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                        ADMIN
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{profileTagItem?.name || user.profileTag || (user.role === UserRole.ADMIN ? t('role.admin_municipal') : t('role.citizen'))}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Info, Insignias & Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                        {/* Recompensas */}
                        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">{t('profile.personal_info', 'Información Personal')}</h3>
                        <div className="space-y-4">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-400">{t('profile.name', 'Nombre')}</label>
                                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl dark:bg-slate-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">{t('profile.tags', 'Tag de perfil (adquiridos)')}</label>
                                        <select value={selectedTagId} onChange={(e) => setSelectedTagId(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl dark:bg-slate-700 dark:text-white">
                                            <option value="">{t('profile.none', 'Ninguno')}</option>
                                            {/* Insignias/etiquetas adquiridas (tienda y exclusivas) */}
                                            {([...ALL_SHOP_ITEMS, ...EXCLUSIVE_BADGES].filter(i => i.type === 'badge' && (user.inventory || []).includes(i.id))).map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                            {/* Dynamically include unlocked level badges (even if not yet claimed) */}
                                            {unlockedDynamicBadges.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}{(user.inventory || []).includes(d.id) ? ` (${t('profile.acquired', 'Adquirido')})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">{t('profile.email', 'Email')}</label>
                                        <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded dark:text-white">{user.email || ''}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">{t('profile.role', 'Rol')}</label>
                                        <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded dark:text-white">{user.role === UserRole.ADMIN ? t('role.admin', 'Administrador') : t('role.citizen', 'Ciudadano')}</div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-300">
                                            <Mail size={18} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-gray-400">{t('profile.email', 'Email')}</p>
                                            <p className="text-sm font-semibold truncate dark:text-white">{user.email || user.name.replace(/\s+/g, '.').toLowerCase() + '@reportaya.es'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-300">
                                            <Shield size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">{t('profile.role', 'Rol')}</p>
                                            <p className="text-sm font-semibold capitalize dark:text-white">{user.role === UserRole.ADMIN ? t('role.admin') : t('role.citizen')}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Owned Badges */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">{t('profile.badges', 'Insignias')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {ownedBadges.map(b => (
                                    <div key={b.id} className={`px-3 py-1 rounded-full text-xs font-semibold ${b.previewValue} ${(user.profileTag === b.id || b.id === 'tag_developer') ? 'ring-2 ring-yellow-400' : ''}`}>
                                        {b.name}
                                    </div>
                                ))}
                                {ownedBadges.length === 0 && (
                                    <div className="text-sm text-gray-400">{t('profile.no_badges', 'No tienes insignias aún.')}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">{t('profile.stats', 'Estadísticas')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                                <span className="block text-3xl font-black text-primary dark:text-white">{userIssues.length}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('profile.reports', 'Reportes')}</span>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl text-center">
                                <span className="block text-3xl font-black text-secondary dark:text-green-400">{resolvedCount}</span>
                                <span className="text-xs text-green-700 dark:text-green-300 font-medium">{t('profile.resolved_issues', 'Resueltos')}</span>
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
                                            <Star className="text-yellow-400 fill-yellow-400" /> {t('profile.level')} {currentLevel}
                                        </h2>
                                        <p className="text-blue-200 text-sm mt-1">{t('profile.keep_reporting', 'Sigue reportando para ganar EXP y subir de nivel.')}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-yellow-400 tracking-tight">{experience} <span className="text-lg text-white font-medium">EXP</span></div>
                                        <div className="text-xs text-blue-200 font-medium bg-white/10 px-2 py-1 rounded inline-block mt-1">{t('profile.next_level', 'Próximo Nivel')}: {nextLevelExp} EXP</div>
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

                                {/* Badges desbloqueables por nivel (debajo de la barra de progreso) */}
                                <div className="mb-6">
                                    <h3 className="text-sm text-blue-100 mb-3 font-semibold">Etiquetas desbloqueables</h3>
                                    <div className="flex gap-3 items-center pr-6">
                                        {Array.from({ length: VISIBLE_BADGE_COUNT }).map((_, idx) => {
                                            const index = badgeWindowStart + idx;
                                            const level = (index + 1) * 20;
                                            const id = `tag_nivel_${level}`;
                                            const name = `${t('profile.level')} ${level}`;
                                            const preview = badgeStyles[index % badgeStyles.length];
                                            const icons = ['🌿', '🌷', '🏵️', '🌟', '👑'];
                                            const icon = icons[index % icons.length];
                                            const unlocked = currentLevel >= level;
                                            const owned = (user.inventory || []).includes(id);
                                            const isRightmost = idx === VISIBLE_BADGE_COUNT - 1;

                                            const handleClick = () => {
                                                if (!unlocked) return;
                                                if (!owned) {
                                                    const newInv = [...(user.inventory || []), id];
                                                    onUpdateUser({ ...user, inventory: newInv, profileTag: id });
                                                    setToastMsg(`${t('profile.tag_claimed', 'Tag reclamado')}: ${name}`);
                                                } else {
                                                    onUpdateUser({ ...user, profileTag: id });
                                                    setToastMsg(`${t('profile.tag_selected', 'Tag seleccionado')}: ${name}`);
                                                }
                                                setSelectedTagId(id);
                                                setTimeout(() => setToastMsg(null), 2200);
                                            };

                                            return (
                                                <div
                                                    key={id}
                                                    onClick={handleClick}
                                                    title={unlocked ? (owned ? 'Seleccionar tag' : 'Reclamar y seleccionar tag') : `Requiere nivel ${level}`}
                                                    className={`w-28 p-1 rounded-lg border ${unlocked ? 'bg-white/10 border-white/20 cursor-pointer hover:scale-105 transition-transform' : 'bg-white/5 border-white/10 opacity-80 cursor-not-allowed'}`}
                                                >
                                                    <div className={`rounded-md w-full h-10 flex items-center justify-center gap-2 text-xs font-bold overflow-hidden ${preview} ${unlocked ? '' : 'filter grayscale'}`}>
                                                        <span className="text-lg leading-none">{icon}</span>
                                                        <span className={`px-1 text-center ${isRightmost ? '' : 'truncate'}`}>{name}</span>
                                                    </div>
                                                    <div className="text-[11px] text-blue-100 mt-1 text-center">{unlocked ? (owned ? 'Adquirido' : 'Desbloqueado') : `Nivel ${level}`}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Recompensas deshabilitadas */}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-primary/20 dark:border-gray-700 overflow-hidden h-full flex flex-col relative transition-colors">
                            <div className="bg-primary/5 dark:bg-blue-900/10 p-8 flex flex-col items-center justify-center text-center flex-1">
                                <div className="w-24 h-24 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 transform rotate-3">
                                    <Shield size={48} />
                                </div>
                                <h2 className="text-3xl font-bold text-primary dark:text-blue-300 mb-2">{t('profile.admin_panel', 'Panel de Administrador')}</h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                    {t('profile.admin_desc', 'Acceso privilegiado para la gestión de servicios urbanos. Utiliza el panel principal para gestionar incidencias.')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Toast breve */}
            {toastMsg && (
                <div className="fixed bottom-8 right-8 bg-primary text-white px-4 py-2 rounded-xl shadow-lg z-50">
                    {toastMsg}
                </div>
            )}
        </div>
    );
};

export default ProfilePanel;
