import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  LayoutDashboard, 
  Calendar, 
  FileEdit, 
  CheckSquare, 
  LayoutGrid, 
  BarChart3, 
  Activity,
  Bell
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const [conflictCount, setConflictCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refreshConflictCount = async () => {
      try {
        const response = await api.get('/api/posts/conflicts', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (!cancelled) {
          const groups = Array.isArray(response.data?.conflicts) ? response.data.conflicts : [];
          setConflictCount(groups.reduce((count, group) => count + (group.posts?.length || 0), 0));
        }
      } catch {
        if (!cancelled) {
          setConflictCount(0);
        }
      }
    };

    refreshConflictCount();
    const refreshInterval = setInterval(refreshConflictCount, 5000);
    const refreshOnFocus = () => refreshConflictCount();
    const refreshOnVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshConflictCount();
      }
    };

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisibility);

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisibility);
    };
  }, []);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/calendar', label: 'Content Calendar', icon: Calendar },
    { to: '/create-post', label: 'Post Creator', icon: FileEdit },
    ...(isAdmin ? [{ to: '/approval-queue', label: 'Approval Queue', icon: CheckSquare }] : []),
    { to: '/templates', label: 'Templates', icon: LayoutGrid },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/notifications', label: 'Conflict Alerts', icon: Bell, badge: conflictCount }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 h-screen fixed left-0 top-0 z-30 flex flex-col justify-between select-none">
      <div>
        {/* Brand/Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-brand-500 to-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-brand-500/20">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-white">CampusPulse</h1>
            <span className="text-[10px] text-brand-400 font-semibold tracking-widest uppercase">CS Department</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-brand-600/30 to-indigo-600/10 text-brand-300 border-l-4 border-brand-500 font-medium' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }
                `}
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">{link.label}</span>
                {link.badge > 0 && (
                  <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-6 border-t border-slate-800 bg-dark-900/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-bold text-brand-300 text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Loading User...'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
