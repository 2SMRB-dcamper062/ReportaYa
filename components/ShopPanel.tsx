import React, { useState, useEffect } from 'react';
import { User, ShopItem } from '../types';
import { ALL_SHOP_ITEMS, PREMIUM_COST_POINTS } from '../constants';
import { ShoppingBag, Lock, Check, Layout, Square, Sparkles, Crown, Wallet, Trophy, Gift, HelpCircle } from 'lucide-react';

interface ShopPanelProps {
  user: User;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
  onBuyPremium?: () => void;
}

const ShopPanel: React.FC<ShopPanelProps> = ({ user, onPurchase, onEquip, onBuyPremium, onStartPremiumCheckout }) => {
  const [activeTab, setActiveTab] = useState<'frame' | 'background' | 'badge'>('frame');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [modalAnimateIn, setModalAnimateIn] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsModalAnimateIn, setPointsModalAnimateIn] = useState(false);

  const filteredItems = ALL_SHOP_ITEMS.filter(item => item.type === activeTab);

  // Helper to determine if an item is "Premium" based on cost
  const isPremium = (cost: number) => cost >= 400;

  // Trigger animation state when modal opens
  useEffect(() => {
    if (showPremiumModal) {
      // small delay to ensure transition classes apply
      const t = setTimeout(() => setModalAnimateIn(true), 10);
      return () => clearTimeout(t);
    }
    // when showPremiumModal becomes false we keep modalAnimateIn false
    setModalAnimateIn(false);
  }, [showPremiumModal]);

  useEffect(() => {
    if (showPointsModal) {
      const t = setTimeout(() => setPointsModalAnimateIn(true), 10);
      return () => clearTimeout(t);
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPointsModal(true)}
                aria-label="Ayuda puntos"
                title="Cómo funcionan los puntos"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <HelpCircle size={18} />
              </button>
            </div>
            {/* Botón de comprar premium movido a la esquina superior derecha */}
          </div>
        </div>
      </div>

      {/* Premium banner (mejorado) */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-gradient-to-r from-indigo-900 to-primary rounded-3xl p-4 shadow-2xl text-white flex flex-col sm:flex-row items-center gap-4 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center ring-1 ring-white/10 shadow-md">
              <Crown size={22} className="text-yellow-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg">ReportaYa Premium</div>
              <div className="text-sm text-white/80">Fondos exclusivos, etiquetas únicas y soporte prioritario.</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-2">
              <Sparkles className="text-yellow-300" />
              <span className="text-sm text-white/90">Contenido exclusivo</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-2">
              <Trophy className="text-yellow-300" />
              <span className="text-sm text-white/90">Etiquetas premium</span>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            {(() => {
              const isPremiumUser = Boolean(user?.premium);
              return (
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className={`px-5 py-2 rounded-full font-bold shadow-lg hover:scale-105 transform transition ${isPremiumUser ? 'bg-white/10 text-yellow-300' : 'bg-yellow-400 text-indigo-900'}`}
                >
                  {isPremiumUser ? 'Ver mis ventajas' : 'Quiero Premium'}
                </button>
              );
            })()}
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
              <Trophy size={18} /> Etiquetas
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
      {(showPremiumModal || modalAnimateIn) && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${modalAnimateIn ? 'bg-black/50' : 'bg-black/0'}` }>
          <div className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-300 ${modalAnimateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-primary text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-yellow-400 flex items-center justify-center text-indigo-900 shadow-lg">
                      <Crown size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold">ReportaYa Premium</h3>
                      <p className="text-sm text-yellow-200">Mejora tu experiencia y desbloquea contenido exclusivo</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 mb-4">Consigue acceso inmediato a todos los fondos, etiquetas y marcos exclusivos. Además, disfruta de prioridad en soporte y una experiencia sin anuncios.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-yellow-300"><Sparkles size={18} /></div>
                      <div>
                        <div className="font-semibold">Fondos y marcos exclusivos</div>
                        <div className="text-xs text-white/80">Accede a imágenes y estilos premium.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-yellow-300"><Trophy size={18} /></div>
                      <div>
                        <div className="font-semibold">Etiquetas exclusivas</div>
                        <div className="text-xs text-white/80">Etiquetas y distintivos únicos para tu perfil.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-yellow-300"><Gift size={18} /></div>
                      <div>
                        <div className="font-semibold">Bonificaciones periódicas</div>
                        <div className="text-xs text-white/80">Puntos y regalos especiales para usuarios premium.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-yellow-300"><Check size={18} /></div>
                      <div>
                        <div className="font-semibold">Soporte prioritario</div>
                        <div className="text-xs text-white/80">Atención preferente a incidencias y consultas.</div>
                      </div>
                    </div>
                  </div>
                </div>
                  <div className="w-48 flex-shrink-0 flex flex-col justify-center items-center self-center">
                    {user?.premium ? (
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5 text-center mx-auto shadow-lg">
                        <div className="flex items-center justify-center mb-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-inner mr-3">
                            <Check size={18} />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-emerald-800">¡Gracias por adquirir Premium!</div>
                            <div className="text-xs text-emerald-700">Tu cuenta ha sido actualizada.</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">Disfruta de fondos y etiquetas exclusivas, bonificaciones y soporte prioritario.</div>
                      </div>
                    ) : (
                          <div className="bg-white/10 rounded-xl p-4 text-center mx-auto">
                            <div className="text-sm text-white/80">Precio</div>
                            <div className="text-3xl font-extrabold text-yellow-300 my-2">{PREMIUM_COST_POINTS} pts</div>
                            <button
                              onClick={() => {
                                if ((user.points || 0) >= PREMIUM_COST_POINTS) {
                                  onBuyPremium && onBuyPremium();
                                  // animate close
                                  setModalAnimateIn(false);
                                  setTimeout(() => setShowPremiumModal(false), 280);
                                }
                              }}
                              disabled={(user.points || 0) < PREMIUM_COST_POINTS}
                              className={`w-full py-2 rounded-lg font-bold mb-2 ${ (user.points || 0) >= PREMIUM_COST_POINTS ? 'bg-yellow-400 text-indigo-900' : 'bg-white/20 text-white/40 cursor-not-allowed' }`}
                            >{`Comprar por ${PREMIUM_COST_POINTS} pts`}</button>
                          </div>
                        )}
                      </div>
              </div>
            </div>
            <div className="p-4 bg-white text-right">
              <button onClick={() => { setModalAnimateIn(false); setTimeout(() => setShowPremiumModal(false), 280); }} className="text-sm text-indigo-900 font-semibold">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {/* Points & XP Help Modal (floating-cards style) */}
      {(showPointsModal || pointsModalAnimateIn) && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${pointsModalAnimateIn ? 'bg-black/50' : 'bg-black/0'}` }>
          <div className={`w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-300 ${pointsModalAnimateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-primary text-white">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-extrabold">¿Cómo funcionan los Puntos y la XP?</h3>
                <p className="text-white/80 max-w-2xl mx-auto mt-2">Resumen rápido de cómo ganar puntos, subir de nivel y canjearlos en la tienda.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-primary">
                      <ShoppingBag size={18} />
                    </div>
                    <h4 className="font-bold text-slate-800">Puntos</h4>
                  </div>
                  <p className="text-sm text-slate-600">Los puntos se obtienen al enviar reportes y se usan para canjear fondos, marcos e insignias en la tienda.</p>
                  <ul className="mt-3 text-slate-600 list-disc list-inside space-y-1 text-sm">
                    <li>Enviar un reporte: <strong>+10 puntos</strong>.</li>
                    <li>Reportes validados pueden dar puntos adicionales.</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center text-secondary">
                      <Trophy size={18} />
                    </div>
                    <h4 className="font-bold text-slate-800">XP y Niveles</h4>
                  </div>
                  <p className="text-sm text-slate-600">La experiencia "XP" refleja tu actividad. Subiendo niveles desbloqueas etiquetas cada 20 niveles.</p>
                  <ul className="mt-3 text-slate-600 list-disc list-inside space-y-1 text-sm">
                    <li>Cada reporte te da <strong>+20 XP</strong>.</li>
                    <li>Cada nivel requiere <strong>100 XP</strong>.</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center text-yellow-600">
                      <Gift size={18} />
                    </div>
                    <h4 className="font-bold text-slate-800">Tienda</h4>
                  </div>
                  <p className="text-sm text-slate-600">Canjea tus puntos por personalizaciones. Algunos artículos requieren Premium.</p>
                  <ul className="mt-3 text-slate-600 list-disc list-inside space-y-1 text-sm">
                    <li>Canjea puntos por marcos, fondos e insignias.</li>
                    <li>Los artículos Premium sólo están disponibles para usuarios Premium.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white text-right">
              <button onClick={() => { setPointsModalAnimateIn(false); setTimeout(() => setShowPointsModal(false), 280); }} className="text-sm text-indigo-900 font-semibold">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPanel;