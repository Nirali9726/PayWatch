import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, RefreshCw } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    retry: <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-[#0f172a] text-emerald-200 shadow-emerald-500/10',
    retry: 'border-amber-500/30 bg-[#0f172a] text-amber-200 shadow-amber-500/10',
    error: 'border-rose-500/30 bg-[#0f172a] text-rose-200 shadow-rose-500/10',
    info: 'border-blue-500/30 bg-[#0f172a] text-blue-200 shadow-blue-500/10',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short max-w-md">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${
          borders[toast.type] || borders.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <div className="flex-1 text-sm font-sans">
          <p className="font-bold text-white tracking-wide">{toast.title}</p>
          <p className="mt-0.5 text-xs text-slate-300">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
