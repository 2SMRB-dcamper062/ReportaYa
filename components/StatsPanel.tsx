import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Issue, IssueStatus } from '../types';
import { Info, Star, CheckCircle, Clock } from 'lucide-react';
import { useLocale } from '../i18n';

interface StatsPanelProps {
  issues: Issue[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ issues }) => {
  const { t } = useLocale();
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const total = issues.length;
  const resolved = issues.filter(i => i.status === IssueStatus.RESOLVED).length;
  const pending = issues.filter(i => i.status === IssueStatus.PENDING).length;
  const inProgress = issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length;

  const resolutionTime = 48; // Mock data: 48 hours average

  const statusData = [
    { name: t('stats.pending'), value: pending },
    { name: t('stats.in_progress'), value: inProgress },
    { name: t('stats.resolved'), value: resolved },
  ];

  const COLORS = ['#EF4444', '#F59E0B', '#48C9B0'];

  // Group by category
  const categoryCount = issues.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(categoryCount).map(key => ({
    name: key.split(' ')[0], // Shorten name for chart
    value: categoryCount[key]
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Admin Header */}
      <div className="bg-primary text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Info size={24} />
            </div>
            {t('stats.title')}
          </h2>
          <p className="text-blue-200 text-sm mt-1 ml-1">{t('stats.subtitle')}</p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-bold border border-white/20 text-center sm:text-left">
          {t('stats.city')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-t-4 border-primary hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-primary/60 text-xs font-bold uppercase tracking-wider mb-1">{t('stats.total_reports')}</h3>
              <p className="text-4xl font-black text-primary">{total}</p>
            </div>
            <div className="p-3 bg-blue-50 text-primary rounded-xl">
              <Star size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-t-4 border-secondary hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-secondary/80 text-xs font-bold uppercase tracking-wider mb-1">{t('stats.resolved_reports')}</h3>
              <p className="text-4xl font-black text-secondary">{resolved}</p>
            </div>
            <div className="p-3 bg-teal-50 text-secondary rounded-xl">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-t-4 border-slate-500 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('stats.avg_time')}</h3>
              <p className="text-4xl font-black text-slate-700 dark:text-slate-100">{resolutionTime}<span className="text-xl align-top opacity-50">h</span></p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-primary/10 dark:border-slate-800">
          <h3 className="text-lg font-bold mb-6 text-primary flex items-center gap-2 pb-4 border-b border-gray-50 dark:border-slate-800">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            {t('stats.status_chart')}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: isDark ? '1px solid rgba(148,163,184,0.25)' : 'none',
                    backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'white',
                    color: isDark ? '#e2e8f0' : undefined,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-primary/10 dark:border-slate-800">
          <h3 className="text-lg font-bold mb-6 text-primary flex items-center gap-2 pb-4 border-b border-gray-50 dark:border-slate-800">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            {t('stats.category_chart')}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} barSize={40}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(15,23,42,0.35)' : '#f1f5f9' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: isDark ? '1px solid rgba(148,163,184,0.25)' : 'none',
                    backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'white',
                    color: isDark ? '#e2e8f0' : undefined,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#003B73" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;