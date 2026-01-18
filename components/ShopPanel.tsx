import React, { useState } from 'react';
import { User, ShopItem } from '../types';
import { ALL_SHOP_ITEMS, PREMIUM_COST_POINTS } from '../constants';
import { ShoppingBag, Lock, Check, Layout, Square, Sparkles, Crown, Wallet, Trophy } from 'lucide-react';

interface ShopPanelProps {
  user: User;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
  onBuyPremium?: () => void;
}

const ShopPanel: React.FC<ShopPanelProps> = ({ user, onPurchase, onEquip, onBuyPremium, onStartPremiumCheckout }) => {
  const [activeTab, setActiveTab] = useState<'frame' | 'background' | 'badge'>('frame');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const filteredItems = ALL_SHOP_ITEMS.filter(item => item.type === activeTab);

  // Helper to determine if an item is "Premium" based on cost
  const isPremium = (cost: number) => cost >= 400;

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
                <h2 className="text-3xl font-extrabold tracking-tight">Tienda de Recompensas</h2>
                <p className="text-blue-200 font-light">Canjea tus puntos por personalizaciones exclusivas</p>
             </div>
          </div>

          <div className="flex items-center gap-3 bg-black/30 p-4 pr-6 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
             <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                <Wallet className="text-white" size={20} />
             </div>
             <div className="text-right">
                <p className="text-xs text-yellow-100 uppercase font-bold tracking-wider">Tu Saldo</p>
                <p className="text-3xl font-black text-white leading-none">{user.points || 0} <span className="text-lg font-medium text-yellow-400">pts</span></p>
             </div>
            {/* Buy Premium Button */}
             <div className="ml-4">
              <button
                onClick={() => setShowPremiumModal(true)}
                className="ml-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-90 flex items-center gap-2"
              >
                <Crown size={16} className="text-white" /> Comprar Premium
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Pill Design */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-full shadow-lg border border-gray-100 inline-flex relative">
            <button
              onClick={() => setActiveTab('frame')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'frame' 
                ? 'bg-primary text-white shadow-md transform scale-105' 
                : 'text-gray-500 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Square size={18} /> Marcos
            </button>
            <button
              onClick={() => setActiveTab('background')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'background' 
                ? 'bg-primary text-white shadow-md transform scale-105' 
                : 'text-gray-500 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Layout size={18} /> Fondos
            </button>
            <button
              onClick={() => setActiveTab('badge')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'badge' 
                ? 'bg-primary text-white shadow-md transform scale-105' 
                : 'text-gray-500 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Trophy size={18} /> Tags
            </button>
        </div>
      </div>

      {/* Grid Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => {
          const isOwned = user.inventory.includes(item.id);
          const isEquipped = item.type === 'frame' 
            ? user.equippedFrame === item.id 
            : user.equippedBackground === item.id;
          const canAfford = (user.points || 0) >= item.cost;
          const premium = isPremium(item.cost);

          return (
            <div 
              key={item.id} 
              className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border ${
                premium ? 'border-yellow-100 shadow-yellow-100/50' : 'border-gray-100 shadow-sm'
              }`}
            >
              {premium && (
                 <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-400 to-yellow-600 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl z-20 shadow-md flex items-center gap-1">
                    <Crown size={10} /> PREMIUM
                 </div>
              )}

              {/* Preview Area */}
              <div className={`h-40 relative flex items-center justify-center overflow-hidden ${premium ? 'bg-slate-50' : 'bg-gray-50'}`}>
                {/* Background Pattern/Grid */}
                <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(#003B73 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                
                 {item.type === 'background' ? (
                   <div className={`w-3/4 h-24 rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-500 ${item.previewValue}`}></div>
                 ) : item.type === 'badge' ? (
                   <div className={`px-4 py-2 rounded-full text-sm font-bold ${item.previewValue}`}>{item.name}</div>
                 ) : (
                   <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                     <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                      className={`w-20 h-20 rounded-full object-cover border-4 bg-white shadow-lg ${item.previewValue}`}
                      alt="Preview" 
                     />
                   </div>
                 )}

                {/* Price Tag if not owned */}
                {!isOwned && (
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-primary px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border border-gray-100 flex items-center gap-1">
                        {item.cost === 0 ? 'Gratis' : item.cost}
                        {item.cost > 0 && <span className="text-[10px] text-gray-400">pts</span>}
                    </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-lg leading-tight ${premium ? 'text-yellow-700' : 'text-gray-800'}`}>{item.name}</h3>
                    {premium && <Crown size={16} className="text-yellow-600 shrink-0 mt-1" />}
                </div>
                
                <p className="text-xs text-gray-500 mb-6 line-clamp-2 h-8">{item.description}</p>
                
                <div className="mt-auto">
                    {isOwned ? (
                        isEquipped ? (
                            <button disabled className="w-full py-2.5 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-sm cursor-default flex items-center justify-center gap-2">
                                <Check size={16} /> Equipado
                            </button>
                        ) : (
                            <button 
                                onClick={() => onEquip(item)}
                                className="w-full py-2.5 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-colors"
                            >
                                Equipar
                            </button>
                        )
                    ) : (
                      // If item is premium and user is not premium, prompt to get premium instead of allowing purchase
                      premium && !user.premium ? (
                        <button
                        onClick={() => setShowPremiumModal(true)}
                        className="w-full py-2.5 rounded-xl font-bold text-sm bg-yellow-500 text-white flex items-center justify-center gap-2 hover:opacity-90"
                        >
                        <Lock size={14} /> Solo Premium
                        </button>
                      ) : (
                        <button 
                          onClick={() => onPurchase(item)}
                          disabled={!canAfford}
                          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 
                            ${canAfford 
                              ? 'bg-gradient-to-r from-primary to-blue-700 text-white hover:shadow-lg hover:from-blue-700 hover:to-blue-900' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
                        >
                          {!canAfford ? <Lock size={14} /> : <ShoppingBag size={14} />}
                          {canAfford ? 'Comprar' : 'Faltan Puntos'}
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
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Comprar ReportaYa Premium</h3>
            <p className="text-sm text-gray-600 mb-4">Desbloquea todas las opciones premium por {PREMIUM_COST_POINTS} pts.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { onBuyPremium && onBuyPremium(); setShowPremiumModal(false); }}
                disabled={(user.points || 0) < PREMIUM_COST_POINTS}
                className={`flex-1 px-4 py-2 rounded-lg font-bold ${
                  (user.points || 0) >= PREMIUM_COST_POINTS ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >{(user.points || 0) >= PREMIUM_COST_POINTS ? `Comprar por ${PREMIUM_COST_POINTS} pts` : `Necesitas ${PREMIUM_COST_POINTS} pts`}</button>
            </div>
            <button onClick={() => setShowPremiumModal(false)} className="mt-4 text-sm text-gray-500">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPanel;