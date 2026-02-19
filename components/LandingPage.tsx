import React from 'react';
import { MapPin, Camera, CheckCircle, ArrowRight, Building2, Users, Map } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col min-h-[85vh] animate-fade-in pb-10">

      {/* Modern Hero Section */}
      <section className="relative w-full py-24 px-4 overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/fondo_inicio.jpg"
            alt="Sevilla Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1';
                target.src = 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=2000&q=80';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-slate-950/95 dark:via-slate-950/80"></div>
        </div>

        <div className="container mx-auto max-w-5xl text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-sm text-primary dark:text-slate-100 text-sm font-semibold animate-fade-in">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            La plataforma ciudadana de Sevilla
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight text-slate-900 dark:text-slate-100 leading-[0.9]">
            Tu barrio, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-secondary">
              en buenas manos.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-xl mb-10 font-medium leading-relaxed drop-shadow-sm">
            Reporta incidencias urbanas al instante y colabora con el Ayuntamiento para hacer de Sevilla un lugar mejor para todos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
            <button
              onClick={onStart}
              className="group bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-900 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Empezar Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onStart}
              className="px-8 py-4 rounded-full font-bold text-lg bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm text-slate-700 dark:text-slate-100 border border-white/50 dark:border-white/10 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              Explorar Mapa
            </button>
          </div>
        </div>
      </section>

      {/* Floating Cards Section */}
      <section className="py-20 px-4 relative z-20 bg-primary shadow-2xl">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Camera size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">1. Captura</h3>
              <p className="text-slate-500 dark:text-slate-300 leading-relaxed">
                Toma una foto del problema. Y adjuntala en la aplicación.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-bl-[100px] -z-10"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mb-6 text-secondary">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">2. Geolocaliza</h3>
              <p className="text-slate-500 dark:text-slate-300 leading-relaxed">
                Confirma la ubicación exacta en el mapa interactivo para que los servicios sepan dónde actuar.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mb-6 text-yellow-600">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">3. Resuelve</h3>
              <p className="text-slate-500 dark:text-slate-300 leading-relaxed">
                Gana puntos cuando tu incidencia sea validada y observa cómo se soluciona en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-16 bg-slate-900 text-white mt-12 rounded-3xl mx-4 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div>
              <div className="text-4xl md:text-5xl font-black text-secondary mb-2">15</div>
              <div className="text-sm md:text-base text-gray-400 uppercase tracking-widest font-bold">Distritos</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">2.5k</div>
              <div className="text-sm md:text-base text-gray-400 uppercase tracking-widest font-bold">Vecinos</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-blue-400 mb-2">850</div>
              <div className="text-sm md:text-base text-gray-400 uppercase tracking-widest font-bold">Resueltas</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">4.8</div>
              <div className="text-sm md:text-base text-gray-400 uppercase tracking-widest font-bold">Valoración</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
