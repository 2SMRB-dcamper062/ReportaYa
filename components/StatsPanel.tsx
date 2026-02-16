import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Issue, IssueStatus } from '../types';
import { Building2, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface StatsPanelProps {
  issues: Issue[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ issues }) => {
  const { t } = useTranslation();
  const total = issues.length;
  const resolved = issues.filter(i => i.status === IssueStatus.RESOLVED).length;
  const pending = issues.filter(i => i.status === IssueStatus.PENDING).length;
  const inProgress = issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length;

  const resolutionTime = 48; // Mock data: 48 hours average

  const statusData = [
    { name: t('status.pending', 'Pendiente'), value: pending },
    { name: t('status.in_progress', 'En Proceso'), value: inProgress },
    { name: t('status.resolved', 'Resuelto'), value: resolved },
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
      <div className="bg-primary dark:bg-blue-900 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Building2 size={24} />
            </div>
            {t('stats.municipal_dashboard', 'Panel de Control Municipal')}
          </h2>
          <p className="text-blue-200 text-sm mt-1 ml-1">{t('stats.dashboard_desc', 'Gestión de incidencias y métricas de la ciudad')}</p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-bold border border-white/20 text-center sm:text-left">
          Sevilla, España
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-t-4 border-primary dark:border-blue-500 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-primary/60 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">{t('stats.total_reports', 'Total Reportes')}</h3>
              <p className="text-4xl font-black text-primary dark:text-white">{total}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-t-4 border-secondary dark:border-teal-500 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-secondary/80 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">{t('stats.resolved', 'Resueltas')}</h3>
              <p className="text-4xl font-black text-secondary dark:text-teal-400">{resolved}</p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-secondary dark:text-teal-300 rounded-xl">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-t-4 border-slate-500 dark:border-slate-400 hover:shadow-md transition">
          <div className="flex justify-between items-start whitespace-nowrap">
            <div>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('stats.avg_time', 'Tiempo Medio')}</h3>
              <p className="text-4xl font-black text-slate-700 dark:text-white">{resolutionTime}<span className="text-xl align-top opacity-50">h</span></p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-primary/10 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 text-primary dark:text-white flex items-center gap-2 pb-4 border-b border-gray-50 dark:border-gray-700">
            <span className="w-1.5 h-6 bg-primary dark:bg-blue-500 rounded-full"></span>
            {t('stats.status_chart', 'Estado de Incidencias')}
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-primary/10 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 text-primary dark:text-white flex items-center gap-2 pb-4 border-b border-gray-50 dark:border-gray-700">
            <span className="w-1.5 h-6 bg-primary dark:bg-blue-500 rounded-full"></span>
            {t('stats.category_chart', 'Por Categoría')}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} barSize={40}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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