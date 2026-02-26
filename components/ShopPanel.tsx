import React, { useState, useEffect } from 'react';
import { User, ShopItem } from '../types';
import { ALL_SHOP_ITEMS, PREMIUM_COST_POINTS } from '../constants';
import {
  ShoppingBag,
  Lock,
  Check,
  Layout,
  Star,
  Crown,
  CreditCard,
  Trophy,
  Gift,
  Info,
  Coins,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Zap,
  X
} from 'lucide-react';
import { useLocale } from '../i18n';

interface ShopPanelProps {
  user: User;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
  onBuyPremium?: () => void;
  onStartPremiumCheckout?: () => void;
}

const ShopPanel: React.FC<ShopPanelProps> = ({ user, onPurchase, onEquip, onBuyPremium, onStartPremiumCheckout }) => {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<'frame' | 'background' | 'badge' | 'collaboration'>('frame');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [modalAnimateIn, setModalAnimateIn] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsModalAnimateIn, setPointsModalAnimateIn] = useState(false);

  const filteredItems = ALL_SHOP_ITEMS.filter(item => item.type === activeTab);

  // Helper to determine if an item is "Premium"
  const isPremiumItem = (item: ShopItem) => !!item.premium;

  // Trigger animation state when modal opens
  useEffect(() => {
    if (showPremiumModal) {
      const timeout = setTimeout(() => setModalAnimateIn(true), 10);
      return () => clearTimeout(timeout);
    }
    setModalAnimateIn(false);
  }, [showPremiumModal]);

  useEffect(() => {
    if (showPointsModal) {
      const timeout = setTimeout(() => setPointsModalAnimateIn(true), 10);
      return () => clearTimeout(timeout);
    }
    setPointsModalAnimateIn(false);
  }, [showPointsModal]);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-8 pb-12">

      {/* Hero / Wallet Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary to-blue-900 p-8 text-white shadow-2xl">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-secondary opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <ShoppingBag size={32} className="text-secondary" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">{t('shop.title')}</h2>
              <p className="text-blue-200 font-light">{t('shop.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/30 p-4 pr-6 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
              <CreditCard className="text-white" size={20} />
            </div>
            <div className="text-right">
              <p className="text-xs text-yellow-100 uppercase font-bold tracking-wider">{t('shop.balance')}</p>
              <p className="text-3xl font-black text-white leading-none">{user.points || 0} <span className="text-lg font-medium text-yellow-400">pts</span></p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPointsModal(true)}
                aria-label={t('shop.how_points')}
                title={t('shop.how_points')}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <Info size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium banner */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-gradient-to-r from-indigo-900 to-primary rounded-3xl p-4 shadow-2xl text-white flex flex-col sm:flex-row items-center gap-4 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center ring-1 ring-white/10 shadow-md">
              <Crown size={22} className="text-yellow-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg">{t('shop.premium_title')}</div>
              <div className="text-sm text-white/80">{t('shop.premium_sub')}</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-2">
              <Star className="text-yellow-300" />
              <span className="text-sm text-white/90">{t('shop.premium_exclusive')}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-2">
              <Trophy className="text-yellow-300" />
              <span className="text-sm text-white/90">{t('shop.premium_tags')}</span>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            {(() => {
              const isPremiumUser = Boolean(user?.premium);
              return (
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className={`px-5 py-2 rounded-full font-bold shadow-lg hover:scale-105 transform transition ${isPremiumUser ? 'bg-white/10 text-yellow-300' : 'bg-yellow-400 text-indigo-900'
                    }`}
                >
                  {isPremiumUser ? t('shop.my_benefits') : t('shop.get_premium')}
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-lg border border-gray-100 dark:border-slate-800 inline-flex relative">
          <button
            onClick={() => setActiveTab('frame')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'frame'
              ? 'bg-primary text-white shadow-md transform scale-105'
              : 'text-gray-500 dark:text-slate-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800/60'
              }`}
          >
            <Layout size={18} /> {t('shop.tab_frames')}
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'background'
              ? 'bg-primary text-white shadow-md transform scale-105'
              : 'text-gray-500 dark:text-slate-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800/60'
              }`}
          >
            <Layout size={18} /> {t('shop.tab_backgrounds')}
          </button>
          <button
            onClick={() => setActiveTab('badge')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'badge'
              ? 'bg-primary text-white shadow-md transform scale-105'
              : 'text-gray-500 dark:text-slate-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800/60'
              }`}
          >
            <Trophy size={18} /> {t('shop.tab_badges')}
          </button>
          <button
            onClick={() => setActiveTab('collaboration')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'collaboration'
              ? 'bg-primary text-white shadow-md transform scale-105'
              : 'text-gray-500 dark:text-slate-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800/60'
              }`}
          >
            <Gift size={18} /> {t('shop.tab_collabs')}
          </button>
        </div>
      </div>

      {/* Grid Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => {
          const isPurchased = (user.inventory || []).includes(item.id);
          const isEquipped = item.type === 'frame'
            ? user.equippedFrame === item.id
            : user.equippedBackground === item.id;
          const canAfford = (user.points || 0) >= item.cost;
          const premium = isPremiumItem(item);

          const experience = user.experience || 0;
          const userLevel = Math.floor(experience / 100) + 1;
          const isLevelLocked = (item.minLevel || 0) > userLevel;

          return (
            <div
              key={item.id}
              className={`group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border ${premium ? 'border-yellow-100 shadow-yellow-100/50' : 'border-gray-100 shadow-sm'
                }`}
            >
              {premium && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-400 to-yellow-600 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl z-20 shadow-md flex items-center gap-1">
                  <Crown size={10} /> PREMIUM
                </div>
              )}

              {/* Preview Area */}
              <div className={`h-40 relative flex items-center justify-center overflow-hidden ${premium ? 'bg-slate-50 dark:bg-slate-800/40' : 'bg-gray-50 dark:bg-slate-800/40'
                }`}>
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#003B73 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                {item.type === 'background' ? (
                  <div className={`w-3/4 h-24 rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-500 ${item.previewValue}`}></div>
                ) : item.type === 'badge' ? (
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${item.previewValue}`}>{t(`item.${item.id}.name`) || item.name}</div>
                ) : item.type === 'collaboration' ? (
                  <div className={`w-3/4 h-24 rounded-2xl shadow-lg border-2 border-dashed border-white/40 flex flex-col items-center justify-center p-4 transform group-hover:scale-105 transition-transform duration-500 ${item.previewValue}`}>
                    <Zap size={24} className="mb-1" />
                    <span className="text-xs font-black uppercase tracking-widest">Coupón</span>
                  </div>
                ) : (
                  <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                      className={`w-20 h-20 rounded-full object-cover border-4 bg-white dark:bg-slate-900 shadow-lg ${item.previewValue}`}
                      alt="Preview"
                    />
                  </div>
                )}

                {!isPurchased && (
                  <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-900/80 backdrop-blur text-primary dark:text-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-1">
                    {item.cost === 0 ? t('shop.free') : item.cost}
                    {item.cost > 0 && <span className="text-[10px] text-gray-400 dark:text-slate-300">pts</span>}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold text-lg leading-tight ${premium ? 'text-yellow-700' : 'text-gray-800 dark:text-slate-100'}`}>
                    {t(`item.${item.id}.name`) || item.name}
                  </h3>
                  {premium && <Crown size={16} className="text-yellow-600 shrink-0 mt-1" />}
                </div>

                <p className="text-xs text-gray-500 dark:text-slate-300 mb-6 line-clamp-2 h-8">
                  {t(`item.${item.id}.desc`) || item.description}
                </p>

                <div className="mt-auto">
                  {isPurchased ? (
                    isEquipped ? (
                      <button disabled className="w-full py-2.5 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-sm cursor-default flex items-center justify-center gap-2">
                        <Check size={16} /> {t('shop.equipped')}
                      </button>
                    ) : (
                      <button
                        onClick={() => onEquip(item)}
                        className="w-full py-2.5 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-100 border-2 border-gray-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:border-primary hover:text-primary dark:hover:text-blue-300 transition-colors"
                      >
                        {t('shop.equip')}
                      </button>
                    )
                  ) : (
                    premium && !user.premium ? (
                      <button
                        onClick={() => setShowPremiumModal(true)}
                        className="w-full py-2.5 rounded-xl font-bold text-sm bg-yellow-500 text-white flex items-center justify-center gap-2 hover:opacity-90"
                      >
                        <Lock size={14} /> {t('shop.premium_only')}
                      </button>
                    ) : (
                      <button
                        onClick={() => onPurchase(item)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 
                            ${canAfford
                            ? 'bg-gradient-to-r from-primary to-blue-700 text-white hover:shadow-lg hover:from-blue-700 hover:to-blue-900'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-400 cursor-not-allowed shadow-none'}`}
                      >
                        {!canAfford ? <Lock size={14} /> : <ShoppingBag size={14} />}
                        {canAfford ? t('shop.buy') : t('shop.no_points')}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Modal */}
      {(showPremiumModal || modalAnimateIn) && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${modalAnimateIn ? 'bg-black/50' : 'bg-black/0'}`}>
          <div className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-300 ${modalAnimateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-primary text-white">
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-400 flex items-center justify-center text-indigo-900 shadow-lg">
                      <Crown size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold">{t('shop.premium_title')}</h3>
                      <p className="text-sm text-yellow-200">{t('shop.premium_sub')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-yellow-300"><Star size={18} /></div>
                      <div>
                        <div className="font-semibold">{t('shop.premium_exclusive')}</div>
                        <div className="text-xs text-white/70">{t('shop.premium_desc_exclusive')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-yellow-300"><Trophy size={18} /></div>
                      <div>
                        <div className="font-semibold">{t('shop.premium_tags')}</div>
                        <div className="text-xs text-white/70">{t('shop.premium_desc_tags')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-yellow-300"><Gift size={18} /></div>
                      <div>
                        <div className="font-semibold">{t('shop.premium_bonuses')}</div>
                        <div className="text-xs text-white/70">{t('shop.premium_desc_bonuses')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-yellow-300"><Check size={18} /></div>
                      <div>
                        <div className="font-semibold text-white">{t('shop.premium_vip')}</div>
                        <div className="text-xs text-white/70">{t('shop.premium_desc_vip')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {user?.premium ? (
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Check className="text-green-400" />
                      <span className="font-bold">{t('shop.premium_thanks')}</span>
                    </div>
                    <p className="text-sm text-white/70">{t('shop.premium_updated')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Opción 1: Puntos */}
                      <div className={`p-5 rounded-2xl border-2 transition-all ${(user.points || 0) >= PREMIUM_COST_POINTS
                        ? 'bg-white/10 border-yellow-400/30'
                        : 'bg-white/5 border-white/10 opacity-70'
                        }`}>
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="bg-yellow-400/20 p-3 rounded-full">
                            <Coins className="text-yellow-400" size={24} />
                          </div>
                          <h4 className="font-bold text-lg">{t('shop.points_card')}</h4>
                          <div>
                            <p className="text-2xl font-black text-yellow-300">{PREMIUM_COST_POINTS} pts</p>
                            <p className="text-xs text-white/60">{(user.points || 0)} pts disponibles</p>
                          </div>
                          <button
                            onClick={() => {
                              if ((user.points || 0) >= PREMIUM_COST_POINTS) {
                                onBuyPremium && onBuyPremium();
                                setModalAnimateIn(false);
                                setTimeout(() => setShowPremiumModal(false), 280);
                              }
                            }}
                            disabled={(user.points || 0) < PREMIUM_COST_POINTS}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${(user.points || 0) >= PREMIUM_COST_POINTS
                              ? 'bg-yellow-400 text-indigo-900 hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/20'
                              : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                              }`}
                          >
                            {(user.points || 0) >= PREMIUM_COST_POINTS ? t('shop.buy') : t('shop.no_points')}
                          </button>
                        </div>
                      </div>

                      {/* Opción 2: Tarjeta */}
                      <div className="p-5 rounded-2xl border-2 bg-indigo-500/20 border-white/20 hover:border-white/40 transition-all">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="bg-white/20 p-3 rounded-full text-white">
                            <CreditCard size={24} />
                          </div>
                          <h4 className="font-bold text-lg">{t('shop.pay_card')}</h4>
                          <div>
                            <p className="text-2xl font-black text-white">4.99€</p>
                            <p className="text-xs text-white/60">Pago mensual recurrente</p>
                          </div>
                          {onStartPremiumCheckout && (
                            <button
                              onClick={() => {
                                onStartPremiumCheckout();
                                setModalAnimateIn(false);
                                setTimeout(() => setShowPremiumModal(false), 280);
                              }}
                              className="w-full py-3 rounded-xl font-bold bg-white text-indigo-900 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                              {t('shop.pay_card')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-center text-white/40 px-4">
                      Pagar con tarjeta desbloquea instantáneamente todas las funciones premium. Las suscripciones mensuales pueden cancelarse en cualquier momento desde tu panel de usuario.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 text-right border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => { setModalAnimateIn(false); setTimeout(() => setShowPremiumModal(false), 280); }}
                className="text-sm text-indigo-900 dark:text-slate-100 font-semibold px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                {t('shop.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points & XP Help Modal */}
      {(showPointsModal || pointsModalAnimateIn) && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${pointsModalAnimateIn ? 'bg-black/50' : 'bg-black/0'}`}>
          <div className={`w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-300 ${pointsModalAnimateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="p-8 bg-gradient-to-r from-indigo-900 to-primary text-white">
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-extrabold mb-3">{t('shop.points_title')}</h3>
                <p className="text-white/80 max-w-2xl mx-auto">{t('shop.points_sub')}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-primary flex items-center justify-center shadow-inner">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xl mb-1">{t('shop.points_card')}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t('shop.points_desc')}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-secondary flex items-center justify-center shadow-inner">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xl mb-1">{t('shop.xp_card')}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t('shop.xp_desc')}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center shadow-inner">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xl mb-1">{t('shop.store_card')}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t('shop.store_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 text-right border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => { setPointsModalAnimateIn(false); setTimeout(() => setShowPointsModal(false), 280); }}
                className="text-sm text-indigo-900 dark:text-slate-100 font-semibold px-6 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                {t('shop.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPanel;