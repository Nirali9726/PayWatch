import React from 'react';
import { AlertCircle, DollarSign, RefreshCw, CheckCircle2, ArrowUpRight } from 'lucide-react';

const MetricCards = ({ stats, loading }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const cards = [
    {
      title: 'Total Failures',
      value: stats?.totalFailures ?? 0,
      format: (v) => v.toLocaleString(),
      subtext: 'Unresolved payment failures',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      accentColor: 'border-t-rose-500',
      iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    },
    {
      title: 'Revenue at Risk',
      value: stats?.revenueAtRisk ?? 0,
      format: formatCurrency,
      subtext: 'Total dollar volume pending',
      icon: <DollarSign className="w-5 h-5 text-amber-400" />,
      accentColor: 'border-t-amber-500',
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    },
    {
      title: 'Recovery Rate',
      value: stats?.recoveryRate ?? 0,
      format: (v) => `${v}%`,
      subtext: 'Successful retry recovery ratio',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      accentColor: 'border-t-emerald-500',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      title: 'Active Retries',
      value: stats?.activeRetries ?? 0,
      format: (v) => v.toLocaleString(),
      subtext: 'Payments currently processing',
      icon: <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />,
      accentColor: 'border-t-blue-500',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-slate-900 border border-slate-800 animate-pulse p-5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`relative rounded-xl bg-slate-900 border border-slate-800/90 border-t-2 ${card.accentColor} p-5 transition-all duration-200 shadow-lg hover:border-slate-700 group`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mt-1.5 tracking-tight font-sans">
                {card.format(card.value)}
              </h3>
            </div>
            <div className={`p-2.5 rounded-lg border ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">{card.subtext}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;
