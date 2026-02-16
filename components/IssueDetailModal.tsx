import React, { useState } from 'react';
import { Issue, IssueStatus, User, UserRole } from '../types';
import { X, MapPin, Calendar, User as UserIcon, MessageSquare, Send, Shield, CheckCircle, Clock, AlertCircle, ScanEye, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { validateIssueEvidence } from '../services/geminiService';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      case IssueStatus.RESOLVED: return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50';
      case IssueStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50';
      default: return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/50';
    }
  };

  const getIcon = (s: IssueStatus) => {
    switch (s) {
      case IssueStatus.RESOLVED: return <CheckCircle size={16} />;
      case IssueStatus.IN_PROGRESS: return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm animate-appear">
      <div className="bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-zoom-in border border-gray-100 dark:border-white/10">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition"
        >
          <X size={20} />
        </button>

        {/* Header Image */}
        <div className="h-64 bg-gray-200 dark:bg-slate-700 relative shrink-0 group">
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
              className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-primary dark:text-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition transform hover:scale-105"
            >
              <ScanEye size={16} /> {t('detail.validateBtn')}
            </button>
          )}

          <div className="absolute bottom-0 left-0 p-6 text-white w-full">
            <span className="bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3 inline-block border border-white/20">
              {issue.category}
            </span>
            <h2 className="text-3xl font-bold leading-tight shadow-black drop-shadow-md">{issue.title}</h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar animate-fade-in bg-white dark:bg-card">

          {/* Metadata Bar */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 pb-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold uppercase text-xs ${getStatusColor(issue.status)}`}>
              {getIcon(issue.status)} {t(`status.${issue.status.toLowerCase()}`)}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} /> {issue.createdAt}
            </div>
            <div className="flex items-center gap-2">
              <UserIcon size={16} /> {issue.author}
            </div>
            <button
              onClick={() => { onFocusLocation(issue.location); onClose(); }}
              className="flex items-center gap-2 text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline ml-auto font-bold transition"
            >
              <MapPin size={16} /> {t('detail.viewMap')}
            </button>
          </div>

          {/* Validation Result Box */}
          {(isValidating || validationResult) && (
            <div className={`p-4 rounded-xl border-2 ${isValidating ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' : validationResult?.isValid ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} animate-fade-in`}>
              {isValidating ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin text-primary dark:text-blue-400">
                    <Sparkles size={20} />
                  </div>
                  <span className="text-sm font-bold text-primary dark:text-blue-400">{t('detail.analyzing')}</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {validationResult?.isValid ? (
                      <CheckCircle className="text-green-600 dark:text-green-400" size={18} />
                    ) : (
                      <AlertTriangle className="text-red-500 dark:text-red-400" size={18} />
                    )}
                    <span className={`font-black text-sm uppercase tracking-wide ${validationResult?.isValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                      {validationResult?.isValid ? t('detail.validated') : t('detail.inconsistent')}
                    </span>
                    <span className="text-xs bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-600 ml-auto font-bold text-gray-700 dark:text-gray-200">
                      {t('detail.confidence')}: {Math.round((validationResult?.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed ml-7">
                    {validationResult?.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">{t('detail.description')}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
              {issue.description}
            </p>
          </div>

          {/* Admin Response Section - SPLIT VIEW */}
          {isAdmin ? (
            <div className="mt-8 rounded-2xl border-2 border-primary dark:border-blue-500 bg-white dark:bg-slate-800 overflow-hidden shadow-lg animate-fade-in ring-4 ring-primary/5 dark:ring-blue-500/10">
              {/* Admin Header */}
              <div className="bg-primary dark:bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none">{t('detail.adminSection')}</h3>
                    <p className="text-blue-200 text-xs mt-1">{t('detail.adminSubtitle')}</p>
                  </div>
                </div>
              </div>

              {/* Admin Form */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <MessageSquare size={14} className="text-primary dark:text-blue-400" />
                    {t('detail.officialResponse')}
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full p-4 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-800 min-h-[120px] text-gray-700 dark:text-white shadow-sm transition"
                    placeholder={t('detail.responsePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t('detail.updateStatus')}</label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as IssueStatus)}
                        className="w-full p-3 pl-4 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none font-bold text-gray-700 dark:text-white appearance-none shadow-sm cursor-pointer"
                      >
                        {Object.values(IssueStatus).map(s => <option key={s} value={s}>{t(`status.${s.toLowerCase()}`)}</option>)}
                      </select>
                      {/* Custom Arrow */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <AlertCircle size={16} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveAdminAction}
                    className="w-full bg-primary dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-900 dark:hover:bg-blue-700 transition shadow-md hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Send size={18} /> {t('detail.publish')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Citizen View of Response
            <div className={`rounded-2xl border-2 overflow-hidden transition-colors ${issue.adminResponse ? 'border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-800/50'}`}>
              <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">{t('detail.officialResponseTitle')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('detail.councilName')}</p>
                </div>
              </div>

              <div className="p-6">
                {issue.adminResponse ? (
                  <div className="relative">
                    <MessageSquare className="absolute -top-2 -left-2 text-primary/10 dark:text-blue-400/10 w-12 h-12 rotate-12" />
                    <p className="text-gray-700 dark:text-slate-300 relative z-10 italic">"{issue.adminResponse}"</p>
                    {issue.status === IssueStatus.RESOLVED && (
                      <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                        <CheckCircle size={16} /> {t('detail.markedResolved')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500 flex flex-col items-center">
                    <Clock size={32} className="mb-2 opacity-50" />
                    <p>{t('detail.waitingResponse')}</p>
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