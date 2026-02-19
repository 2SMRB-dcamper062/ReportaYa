import React, { useState } from 'react';
import { Issue, IssueStatus, User, UserRole } from '../types';
import { X, MapPin, Clock, User as UserIcon, Info, Send, Shield, CheckCircle, AlertTriangle, Search, Star } from 'lucide-react';
import { validateIssueEvidence } from '../services/geminiService';

import { useLocale } from '../i18n';

// Constants for i18n mapping (matching App.tsx)
const CATEGORY_KEYS: Record<string, string> = {
  'Infraestructura': 'cat.infra',
  'Alumbrado': 'cat.lighting',
  'Limpieza': 'cat.cleaning',
  'Ruido': 'cat.noise',
  'Parques y Jardines': 'cat.parks',
  'Otro': 'cat.other'
};

const STATUS_KEYS: Record<string, string> = {
  [IssueStatus.PENDING]: 'status.pending',
  [IssueStatus.IN_PROGRESS]: 'status.in_progress',
  [IssueStatus.RESOLVED]: 'status.resolved'
};

interface IssueDetailModalProps {
  issue: Issue;
  currentUser: User | null;
  onClose: () => void;
  onFocusLocation: (location: { lat: number; lng: number }) => void;
  onUpdateIssue: (updatedIssue: Issue) => void;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  currentUser,
  onClose,
  onFocusLocation,
  onUpdateIssue
}) => {
  const { t } = useLocale();
  const [response, setResponse] = useState(issue.adminResponse || '');
  const [status, setStatus] = useState(issue.status);

  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; confidence: number; reason: string } | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleSaveAdminAction = () => {
    const updated = {
      ...issue,
      adminResponse: response,
      status: status
    };
    onUpdateIssue(updated);
    onClose();
  };

  const handleValidateImage = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await validateIssueEvidence(issue.imageUrl || '', issue.category);
      setValidationResult(result);
    } catch (error) {
      console.error("Validation failed", error);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusColor = (s: IssueStatus) => {
    switch (s) {
      case IssueStatus.RESOLVED: return 'bg-teal-100 text-teal-800 border-teal-200';
      case IssueStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  const getIcon = (s: IssueStatus) => {
    switch (s) {
      case IssueStatus.RESOLVED: return <CheckCircle size={16} />;
      case IssueStatus.IN_PROGRESS: return <Clock size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm animate-appear">
      <div className="bg-white dark:bg-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-zoom-in border border-transparent dark:border-slate-800">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition"
        >
          <X size={20} />
        </button>

        {/* Header Image */}
        <div className="h-64 bg-gray-200 dark:bg-slate-800 relative shrink-0 group">
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Admin Validation Overlay Button (Over Image) */}
          {isAdmin && !validationResult && !isValidating && (
            <button
              onClick={handleValidateImage}
              className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 text-primary dark:text-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition transform hover:scale-105 border border-white/30 dark:border-white/10"
            >
              <Search size={16} /> Validar Imagen con IA
            </button>
          )}

          <div className="absolute bottom-0 left-0 p-6 text-white w-full">
            <span className="bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3 inline-block border border-white/20">
              {t(CATEGORY_KEYS[issue.category] || 'cat.other')}
            </span>
            <h2 className="text-3xl font-bold leading-tight shadow-black drop-shadow-md">
              {issue.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar animate-fade-in">

          {/* Metadata Bar */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold uppercase text-xs ${getStatusColor(issue.status)}`}>
              {getIcon(issue.status)} {t(STATUS_KEYS[issue.status])}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} /> {issue.createdAt}
            </div>
            <div className="flex items-center gap-2">
              <UserIcon size={16} /> {issue.author}
            </div>
            <button
              onClick={() => { onFocusLocation(issue.location); onClose(); }}
              className="flex items-center gap-2 text-primary hover:text-blue-700 dark:hover:text-blue-300 hover:underline ml-auto font-bold transition"
            >
              <MapPin size={16} /> Ver en mapa
            </button>
          </div>

          {/* Validation Result Box */}
          {(isValidating || validationResult) && (
            <div className={`p-4 rounded-xl border-2 ${isValidating
              ? 'bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/40'
              : validationResult?.isValid
                ? 'bg-green-50 border-green-200 dark:bg-emerald-950/25 dark:border-emerald-900/40'
                : 'bg-red-50 border-red-200 dark:bg-red-950/25 dark:border-red-900/40'
              } animate-fade-in`}>
              {isValidating ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin text-primary">
                    <Star size={20} />
                  </div>
                  <span className="text-sm font-bold text-primary dark:text-blue-200">Analizando evidencia visual...</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {validationResult?.isValid ? (
                      <CheckCircle className="text-green-600" size={18} />
                    ) : (
                      <AlertTriangle className="text-red-500" size={18} />
                    )}
                    <span className={`font-black text-sm uppercase tracking-wide ${validationResult?.isValid ? 'text-green-800' : 'text-red-800'}`}>
                      {validationResult?.isValid ? 'Evidencia Validada' : 'Posible Inconsistencia'}
                    </span>
                    <span className="text-xs bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700 ml-auto font-bold">
                      Confianza: {Math.round((validationResult?.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed ml-7">
                    {validationResult?.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg mb-2">{t('report.description')}</h3>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-base">
              {issue.description}
            </p>
          </div>

          {/* Admin Response Section - SPLIT VIEW */}
          {isAdmin ? (
            <div className="mt-8 rounded-2xl border-2 border-primary bg-white dark:bg-slate-900 overflow-hidden shadow-lg animate-fade-in ring-4 ring-primary/5 dark:ring-primary/20">
              {/* Admin Header */}
              <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none">Gestión de Incidencia</h3>
                    <p className="text-blue-200 text-xs mt-1">Área exclusiva para administradores</p>
                  </div>
                </div>
              </div>

              {/* Admin Form */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-950/20 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Info size={14} className="text-primary" />
                    Respuesta Oficial
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full p-4 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-950/40 min-h-[120px] text-gray-700 dark:text-slate-100 shadow-sm transition"
                    placeholder="Escriba aquí la respuesta oficial del ayuntamiento..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wide mb-2">Actualizar Estado</label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as IssueStatus)}
                        className="w-full p-3 pl-4 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950/40 focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700 dark:text-slate-100 appearance-none shadow-sm cursor-pointer"
                      >
                        {Object.values(IssueStatus).map(s => <option key={s} value={s}>{t(STATUS_KEYS[s])}</option>)}
                      </select>
                      {/* Custom Arrow */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-slate-400">
                        <AlertTriangle size={16} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveAdminAction}
                    className="w-full bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition shadow-md hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Send size={18} /> Publicar Cambios
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Citizen View of Response
            <div className={`rounded-2xl border-2 overflow-hidden transition-colors ${issue.adminResponse
              ? 'border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/25'
              : 'border-gray-100 bg-gray-50 dark:border-slate-800 dark:bg-slate-950/20'
              }`}>
              <div className="px-6 py-4 border-b border-black/5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-slate-100">Respuesta Oficial</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-300">Ayuntamiento de Sevilla</p>
                </div>
              </div>

              <div className="p-6">
                {issue.adminResponse ? (
                  <div className="relative">
                    <Info className="absolute -top-2 -left-2 text-primary/10 w-12 h-12 rotate-12" />
                    <p className="text-gray-700 dark:text-slate-100 relative z-10 italic">"{issue.adminResponse}"</p>
                    {issue.status === IssueStatus.RESOLVED && (
                      <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-sm">
                        <CheckCircle size={16} /> Incidencia marcada como resuelta
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 dark:text-slate-400 flex flex-col items-center">
                    <Clock size={32} className="mb-2 opacity-50" />
                    <p>Esperando respuesta oficial...</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;