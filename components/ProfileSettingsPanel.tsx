/**
 * ProfileSettingsPanel.tsx
 * Unified panel combining the user profile view with app settings.
 * Uses useLocale() for reactive translations on every render.
 */
import React, { useState, useRef } from 'react';
import { User, Issue, UserRole, IssueStatus } from '../types';
import { SHOP_ITEMS, ALL_SHOP_ITEMS, EXCLUSIVE_BADGES } from '../constants';
import { useLocale, LOCALES, Locale } from '../i18n';
import { apiChangePassword } from '../services/api';
import {
    User as UserIcon, Mail, Shield, Camera, Edit2, Save, X,
    Star, Lock, Zap, Check, Crown, LogOut, Moon, Sun, Globe, Settings,
} from 'lucide-react';

interface ProfileSettingsPanelProps {
    user: User;
    issues: Issue[];
    onUpdateUser: (updatedUser: User) => void;
    onLogout: () => void;
    themeMode: 'light' | 'dark';
    onThemeModeChange: (mode: 'light' | 'dark') => void;
}

const ProfileSettingsPanel: React.FC<ProfileSettingsPanelProps> = ({
    user, issues, onUpdateUser, onLogout, themeMode, onThemeModeChange,
}) => {
    const { t, locale, setLocale } = useLocale();

    // ── Profile tab state ────────────────────────────────────────────────────
    const [tab, setTab] = useState<'profile' | 'settings'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar || '');
    const initialTagId = user.profileTag &&
        (ALL_SHOP_ITEMS.find(i => i.id === user.profileTag) || EXCLUSIVE_BADGES.find(i => i.id === user.profileTag))
        ? (user.profileTag || '') : '';
    const [selectedTagId, setSelectedTagId] = useState(initialTagId);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // ── Settings tab state ─────────────────────────────────────────────────
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [changing, setChanging] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

    // ── Gamification helpers ────────────────────────────────────────────────
    const findDynamicBadge = (id?: string) => {
        if (!id) return undefined;
        const fromShop = ALL_SHOP_ITEMS.find(i => i.id === id) || EXCLUSIVE_BADGES.find(i => i.id === id);
        if (fromShop) return fromShop;
        const m = id.match(/^tag_nivel_(\d+)$/);
        if (!m) return undefined;
        const lvl = parseInt(m[1], 10);
        return { id, name: `${t('ps.level')} ${lvl}`, description: '', cost: 0, type: 'badge' as const, previewValue: 'bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-800', minLevel: lvl } as any;
    };
    const profileTagItem = findDynamicBadge(user.profileTag);
    const userIssues = issues.filter(i => i.author === user.name);
    const resolvedCount = userIssues.filter(i => i.status === IssueStatus.RESOLVED).length;
    const experience = user.experience || 0;
    const currentLevel = Math.floor(experience / 100) + 1;
    const nextLevelExp = currentLevel * 100;
    const prevLevelExp = (currentLevel - 1) * 100;
    const expCurrent = Math.max(0, experience - prevLevelExp);
    const progressPercent = Math.min(100, (expCurrent / 100) * 100);
    const equippedBg = SHOP_ITEMS.find(i => i.id === user.equippedBackground)?.previewValue || 'bg-gradient-to-r from-primary to-blue-800';
    const equippedFrame = SHOP_ITEMS.find(i => i.id === user.equippedFrame)?.previewValue || 'border-white';
    const ownedBadges = [...ALL_SHOP_ITEMS, ...EXCLUSIVE_BADGES].filter(
        i => i.type === 'badge' && ((user.inventory || []).includes(i.id) || (i.id === 'tag_admin' && user.role === UserRole.ADMIN))
    );
    const [badgeWindowStart, setBadgeWindowStart] = useState(0);
    const VISIBLE = 6;
    const badgeStyles = [
        'bg-gradient-to-r from-green-200 to-green-400 text-green-800',
        'bg-gradient-to-r from-teal-200 to-teal-400 text-teal-800',
        'bg-gradient-to-r from-blue-200 to-blue-400 text-blue-800',
        'bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-800',
        'bg-gradient-to-r from-purple-200 to-purple-400 text-purple-800',
    ];
    React.useEffect(() => {
        const hi = Math.floor(currentLevel / 20) - 1;
        if (hi < 0) return;
        if (hi > badgeWindowStart + VISIBLE - 1) setBadgeWindowStart(Math.max(0, hi - (VISIBLE - 1)));
    }, [currentLevel]);
    const unlockedDynamicBadges: { id: string; name: string }[] = [];
    for (let lvl = 20; lvl <= currentLevel; lvl += 20) { unlockedDynamicBadges.push({ id: `tag_nivel_${lvl}`, name: `${t('ps.level')} ${lvl}` }); }

    // ── Save / Cancel ───────────────────────────────────────────────────────
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({ ...user, name, avatar, profileTag: selectedTagId || '' });
        setIsEditing(false);
    };

    const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2200); };

    // ── Change password ─────────────────────────────────────────────────────
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return setSettingsMsg(t('settings.not_auth'));
        if (!oldPassword || !newPassword) return setSettingsMsg(t('settings.fill_both'));
        setChanging(true);
        try {
            await apiChangePassword(user.id, oldPassword, newPassword);
            setSettingsMsg(t('settings.pw_saved'));
            setOldPassword(''); setNewPassword('');
        } catch (err: any) {
            setSettingsMsg(err?.message || 'Error');
        } finally {
            setChanging(false);
            setTimeout(() => setSettingsMsg(null), 3000);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-0 pb-10">

            {/* ── Header card with avatar + name ─────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden relative mb-6">
                <div className={`h-44 w-full ${equippedBg} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="px-8 pb-6 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between -mt-16 mb-4">

                        {/* Avatar + name */}
                        <div className="flex items-end gap-6">
                            <div className="relative group">
                                <div className="relative">
                                    <img
                                        src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`}
                                        alt="Profile"
                                        className={`w-32 h-32 rounded-full border-[6px] shadow-2xl bg-white object-cover ${equippedFrame}`}
                                    />
                                    {user.role === UserRole.CITIZEN && (
                                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-white shadow-md z-10 text-sm">
                                            {currentLevel}
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-2 right-8 bg-secondary text-white p-2 rounded-full hover:bg-teal-400 transition shadow-lg hover:scale-110"
                                            title={t('ps.upload_photo')}>
                                            <Camera size={16} />
                                        </button>
                                        <button type="button" onClick={() => setAvatar('')}
                                            className="absolute bottom-2 right-20 bg-white text-red-500 p-2 rounded-full hover:bg-gray-50 transition shadow-lg hover:scale-110"
                                            title={t('ps.remove_photo')}>
                                            <X size={14} />
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0]; if (!f) return;
                                                const reader = new FileReader();
                                                reader.onload = () => setAvatar(reader.result as string);
                                                reader.readAsDataURL(f);
                                            }} />
                                    </>
                                )}
                            </div>

                            <div className="mb-2 hidden md:block">
                                <h1 className="text-3xl font-black text-gray-800 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                                    {user.name}
                                    {user.role === UserRole.ADMIN && <Shield className="text-secondary fill-secondary/20 w-6 h-6" />}
                                    {user.premium && <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shadow-md"><Crown size={14} /></div>}
                                    {profileTagItem && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${profileTagItem.previewValue} ${user.profileTag === profileTagItem.id ? 'ring-2 ring-yellow-400' : ''}`}>
                                            {t(`item.${profileTagItem.id}.name`) || profileTagItem.name}
                                        </span>
                                    )}
                                    {user.role === UserRole.ADMIN && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white">ADMIN</span>
                                    )}
                                </h1>
                                <p className="text-gray-500 dark:text-slate-300 font-medium">
                                    {(profileTagItem && (t(`item.${profileTagItem.id}.name`) || profileTagItem.name)) || (user.role === UserRole.ADMIN ? t('ps.admin_title') : t('ps.citizen'))}
                                </p>
                            </div>
                        </div>

                        {/* Edit / Save / Cancel buttons */}
                        <div className="mt-4 md:mt-0 flex gap-3">
                            {!isEditing ? (
                                <button onClick={() => { setSelectedTagId(user.profileTag || ''); setIsEditing(true); }}
                                    className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 hover:shadow-md transition shadow-sm flex items-center gap-2">
                                    <Edit2 size={16} /> {t('ps.edit')}
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => { setIsEditing(false); setName(user.name); setAvatar(user.avatar || ''); setSelectedTagId(user.profileTag || ''); }}
                                        className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                                        {t('ps.cancel')}
                                    </button>
                                    <button onClick={handleSave}
                                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-900 shadow-lg transition hover:scale-105">
                                        {t('ps.save')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile name */}
                    <div className="md:hidden mt-2 mb-4">
                        <h1 className="text-2xl font-black text-gray-800 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                            {user.name}
                            {user.premium && <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shadow-md"><Crown size={12} /></div>}
                            {profileTagItem && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${profileTagItem.previewValue}`}>{profileTagItem.name}</span>
                            )}
                            {user.role === UserRole.ADMIN && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white">ADMIN</span>
                            )}
                        </h1>
                        <p className="text-gray-500 dark:text-slate-300 text-sm">{(profileTagItem && (t(`item.${profileTagItem.id}.name`) || profileTagItem.name)) || (user.role === UserRole.ADMIN ? t('ps.admin_title') : t('ps.citizen'))}</p>
                    </div>
                </div>
            </div>

            {/* ── Tab switcher ────────────────────────────────────────────────── */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab('profile')}
                    className={`flex items-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm transition-all shadow-sm ${tab === 'profile'
                        ? 'bg-primary text-white shadow-primary/30 shadow-lg scale-105'
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700'}`}
                >
                    <UserIcon size={16} />
                    {t('ps.tab_profile')}
                </button>
                <button
                    onClick={() => setTab('settings')}
                    className={`flex items-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm transition-all shadow-sm ${tab === 'settings'
                        ? 'bg-primary text-white shadow-primary/30 shadow-lg scale-105'
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700'}`}
                >
                    <Settings size={16} />
                    {t('ps.tab_settings')}
                </button>
            </div>
            {/* ══ PROFILE TAB ══════════════════════════════════════════════════ */}
            {tab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left column */}
                    <div className="space-y-6">
                        {/* Personal info */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <h3 className="font-bold text-gray-400 dark:text-slate-400 text-xs uppercase tracking-wider mb-4">{t('ps.personal_info')}</h3>
                            <div className="space-y-4">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-400 dark:text-slate-400">{t('ps.name')}</label>
                                            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-xl bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100 mt-1" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 dark:text-slate-400">{t('ps.profile_tag')}</label>
                                            <select value={selectedTagId} onChange={e => setSelectedTagId(e.target.value)} className="w-full p-3 border rounded-xl bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100 mt-1">
                                                <option value="">{t('ps.tag_none')}</option>
                                                {[...ALL_SHOP_ITEMS, ...EXCLUSIVE_BADGES].filter(i => i.type === 'badge' && (user.inventory || []).includes(i.id)).map(b => (
                                                    <option key={b.id} value={b.id}>{t(`item.${b.id}.name`) || b.name}</option>
                                                ))}
                                                {unlockedDynamicBadges.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}{(user.inventory || []).includes(d.id) ? ` (${t('ps.acquired')})` : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 dark:text-slate-400">{t('ps.email')}</label>
                                            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded mt-1 text-sm dark:text-slate-100">{user.email || ''}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 dark:text-slate-400">{t('ps.role')}</label>
                                            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded mt-1 text-sm dark:text-slate-100">{user.role === UserRole.ADMIN ? t('general.admin') : t('general.citizen')}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary"><Mail size={18} /></div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs text-gray-400 dark:text-slate-400">{t('ps.email')}</p>
                                                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{user.email || user.name.replace(/\s+/g, '.').toLowerCase() + '@reportaya.es'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary"><Shield size={18} /></div>
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-slate-400">{t('ps.role')}</p>
                                                <p className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-100">{user.role === UserRole.ADMIN ? t('general.admin') : t('general.citizen')}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <h3 className="font-bold text-gray-400 dark:text-slate-400 text-xs uppercase tracking-wider mb-4">{t('ps.badges')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {ownedBadges.map(b => (
                                    <div key={b.id} className={`px-3 py-1 rounded-full text-xs font-semibold ${b.previewValue} ${user.profileTag === b.id ? 'ring-2 ring-yellow-400' : ''}`}>
                                        {t(`item.${b.id}.name`) || b.name}
                                    </div>
                                ))}
                                {ownedBadges.length === 0 && <div className="text-sm text-gray-400 dark:text-slate-400">{t('ps.no_badges')}</div>}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <h3 className="font-bold text-gray-400 dark:text-slate-400 text-xs uppercase tracking-wider mb-4">{t('ps.stats')}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl text-center">
                                    <span className="block text-3xl font-black text-primary">{userIssues.length}</span>
                                    <span className="text-xs text-gray-500 dark:text-slate-300 font-medium">{t('ps.reports')}</span>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-emerald-900/20 rounded-xl text-center">
                                    <span className="block text-3xl font-black text-secondary">{resolvedCount}</span>
                                    <span className="text-xs text-green-700 dark:text-emerald-300 font-medium">{t('ps.resolved')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column — gamification or admin */}
                    <div className="lg:col-span-2">
                        {user.role === UserRole.CITIZEN ? (
                            <div className="bg-gradient-to-br from-indigo-900 to-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary opacity-10 rounded-full blur-3xl -ml-10 -mb-10" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold flex items-center gap-2"><Star className="text-yellow-400 fill-yellow-400" /> {t('ps.level')} {currentLevel}</h2>
                                            <p className="text-blue-200 text-sm mt-1">{t('ps.keep_reporting')}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-black text-yellow-400 tracking-tight">{experience} <span className="text-lg text-white font-medium">EXP</span></div>
                                            <div className="text-xs text-blue-200 font-medium bg-white/10 px-2 py-1 rounded inline-block mt-1">{t('ps.next_level')} {nextLevelExp} EXP</div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="relative h-6 bg-black/20 rounded-full mb-8 p-1 backdrop-blur-sm border border-white/10">
                                        <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-1000 relative" style={{ width: `${progressPercent}%` }}>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center -mr-4 border-2 border-yellow-500">
                                                <Zap size={14} className="text-yellow-600 fill-yellow-600" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unlockable level tags */}
                                    <div className="mb-4">
                                        <h3 className="text-sm text-blue-100 mb-3 font-semibold">{t('ps.unlockable_tags')}</h3>
                                        <div className="flex gap-3 items-center pr-6 flex-wrap">
                                            {Array.from({ length: VISIBLE }).map((_, idx) => {
                                                const index = badgeWindowStart + idx;
                                                const level = (index + 1) * 20;
                                                const id = `tag_nivel_${level}`;
                                                const preview = badgeStyles[index % badgeStyles.length];
                                                const icons = ['🌿', '🌷', '🏵️', '🌟', '👑'];
                                                const icon = icons[index % icons.length];
                                                const unlocked = currentLevel >= level;
                                                const owned = (user.inventory || []).includes(id);
                                                return (
                                                    <div key={id}
                                                        onClick={() => {
                                                            if (!unlocked) return;
                                                            if (!owned) {
                                                                onUpdateUser({ ...user, inventory: [...(user.inventory || []), id], profileTag: id });
                                                                toast(`${t('ps.tag_claimed')}: ${t('ps.level')} ${level}`);
                                                            } else {
                                                                onUpdateUser({ ...user, profileTag: id });
                                                                toast(`${t('ps.tag_selected')}: ${t('ps.level')} ${level}`);
                                                            }
                                                            setSelectedTagId(id);
                                                        }}
                                                        title={unlocked ? (owned ? t('ps.select_tag') : t('ps.claim_tag')) : `${t('ps.requires_level')} ${level}`}
                                                        className={`w-28 p-1 rounded-lg border cursor-pointer ${unlocked ? 'bg-white/10 border-white/20 hover:scale-105 transition-transform' : 'bg-white/5 border-white/10 opacity-80 cursor-not-allowed'}`}
                                                    >
                                                        <div className={`rounded-md w-full h-10 flex items-center justify-center gap-1 text-xs font-bold overflow-hidden ${preview} ${unlocked ? '' : 'filter grayscale'}`}>
                                                            <span className="text-lg leading-none">{icon}</span>
                                                            <span className="truncate">{t('ps.level')} {level}</span>
                                                        </div>
                                                        <div className="text-[11px] text-blue-100 mt-1 text-center">{unlocked ? (owned ? t('ps.acquired') : t('ps.unlocked')) : `${t('ps.requires_level')} ${level}`}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-primary/20 overflow-hidden h-full flex flex-col">
                                <div className="bg-primary/5 p-8 flex flex-col items-center justify-center text-center flex-1">
                                    <div className="w-24 h-24 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 transform rotate-3">
                                        <Shield size={48} />
                                    </div>
                                    <h2 className="text-3xl font-bold text-primary mb-2">{t('ps.admin_panel')}</h2>
                                    <p className="text-gray-500 max-w-md">{t('ps.admin_desc')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══ SETTINGS TAB ═════════════════════════════════════════════════ */}
            {tab === 'settings' && (
                <div className="max-w-2xl space-y-5">

                    {/* Language */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe size={18} className="text-primary" />
                            <h3 className="font-bold text-gray-700 dark:text-slate-200 text-sm uppercase tracking-wider">{t('settings.language')}</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {LOCALES.map(loc => (
                                <button key={loc.code}
                                    onClick={() => setLocale(loc.code as Locale)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${locale === loc.code ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-primary/30 bg-white dark:bg-slate-800'}`}
                                >
                                    <span className="text-xl leading-none">{loc.flag}</span>
                                    <span>{loc.label}</span>
                                    {locale === loc.code && <Check size={14} className="ml-auto text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            {themeMode === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
                            <h3 className="font-bold text-gray-700 dark:text-slate-200 text-sm uppercase tracking-wider">{t('settings.theme')}</h3>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => onThemeModeChange('light')}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${themeMode === 'light' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-primary/30 bg-white dark:bg-slate-800'}`}
                            >
                                <Sun size={16} /> {t('settings.theme_light')}
                                {themeMode === 'light' && <Check size={14} className="ml-1 text-primary" />}
                            </button>
                            <button
                                onClick={() => onThemeModeChange('dark')}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${themeMode === 'dark' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-primary/30 bg-white dark:bg-slate-800'}`}
                            >
                                <Moon size={16} /> {t('settings.theme_dark')}
                                {themeMode === 'dark' && <Check size={14} className="ml-1 text-primary" />}
                            </button>
                        </div>
                    </div>

                    {/* Account — change password */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock size={18} className="text-primary" />
                            <h3 className="font-bold text-gray-700 dark:text-slate-200 text-sm uppercase tracking-wider">{t('settings.account')}</h3>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-400 mb-4">{t('settings.change_password')}</p>
                        <form onSubmit={handleChangePassword} className="space-y-3">
                            <input type="password" placeholder={t('settings.current_password')} value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40" />
                            <input type="password" placeholder={t('settings.new_password')} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40" />
                            <div className="flex gap-2">
                                <button type="submit" disabled={changing}
                                    className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-900 transition disabled:opacity-60">
                                    {changing ? t('settings.saving') : t('settings.save_pw')}
                                </button>
                                <button type="button" onClick={() => { setOldPassword(''); setNewPassword(''); }}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                                    {t('settings.clear')}
                                </button>
                            </div>
                            {settingsMsg && <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">{settingsMsg}</p>}
                        </form>
                    </div>

                    {/* Logout */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <button onClick={onLogout}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 font-semibold hover:bg-red-100 transition text-sm">
                            <LogOut size={16} /> {t('settings.logout')}
                        </button>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toastMsg && (
                <div className="fixed bottom-8 right-8 bg-primary text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
                    {toastMsg}
                </div>
            )}
        </div>
    );
};

export default ProfileSettingsPanel;
