import React from 'react';
import { ShieldCheck, LogOut, Database, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/90 px-4 lg:px-8 py-3.5 shadow-xl shadow-black/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-md">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-sans">
                PayWatch
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wider uppercase">
                Enterprise v2.6
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Payment Failure Intelligence Dashboard</p>
          </div>
        </div>

        {/* Status Indicators & User Info */}
        <div className="flex items-center gap-4">
          {/* Database Connection Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3.5 h-3.5" />
            <span>MongoDB Atlas Connected</span>
          </div>

          {/* User Profile Info */}
          {user && (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="flex items-center gap-2.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <div className="w-6 h-6 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                  {user.name ? user.name.charAt(0) : 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{user.role || 'Administrator'}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 transition-all duration-150"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
