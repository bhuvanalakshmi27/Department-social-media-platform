import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-800 fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-8 select-none">
      {/* Title / Dept */}
      <div className="flex items-center space-x-2">
        <GraduationCap size={20} className="text-brand-400" />
        <span className="text-sm font-semibold tracking-wide text-slate-300">
          {user?.department || 'Academic'} Department Dashboard
        </span>
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-6">
        {/* Role Badge */}
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase
          ${isAdmin 
            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {isAdmin ? (
            <>
              <Shield size={12} />
              <span>Faculty Admin</span>
            </>
          ) : (
            <>
              <User size={12} />
              <span>Coordinator</span>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-6 bg-slate-800"></div>

        {/* Logout Trigger */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors duration-200 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
