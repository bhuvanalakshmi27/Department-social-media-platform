import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bell, Calendar, RefreshCw, Trash2 } from 'lucide-react';
import api from '../api/axios';

const getConflictGroups = (response) => {
  const groups = response.data?.conflicts;
  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.filter(group => Array.isArray(group.posts) && group.posts.length > 1);
};

const Notifications = () => {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingPostId, setDeletingPostId] = useState(null);

  const fetchConflicts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/posts/conflicts');
      setConflicts(getConflictGroups(response));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conflict alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const refreshConflicts = async () => {
      try {
        const response = await api.get('/api/posts/conflicts', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (!cancelled) {
          setConflicts(getConflictGroups(response));
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load conflict alerts.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    refreshConflicts();
    const refreshInterval = setInterval(refreshConflicts, 5000);
    const refreshOnFocus = () => refreshConflicts();
    const refreshOnVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshConflicts();
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

  const handleDelete = async (postId) => {
    setDeletingPostId(postId);
    setError('');
    try {
      await api.delete(`/api/posts/conflicts/${postId}`);
      await fetchConflicts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the conflicting post.');
    } finally {
      setDeletingPostId(null);
    }
  };

  return (
    <div className="space-y-8 select-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Conflict Alerts</h2>
          <p className="text-sm text-slate-400 mt-1">
            Active department posts competing for the exact same publication time.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchConflicts}
          disabled={loading}
          title="Refresh conflict alerts"
          className="p-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="h-40 rounded-2xl glass-card animate-pulse" />
      ) : conflicts.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center">
          <Bell size={40} className="mx-auto text-emerald-400/50 mb-3" />
          <h3 className="text-lg font-bold text-white">No active conflicts</h3>
          <p className="text-sm text-slate-500 mt-1">Your department schedule has no exact-time conflicts.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {conflicts.map((conflict) => (
            <section key={conflict.posts.map(post => post._id).join('-')} className="glass-panel rounded-2xl border border-amber-500/30 p-6 shadow-glass-md">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="text-base font-bold text-amber-200">Schedule conflict detected</h3>
                  <p className="text-xs text-amber-200/70 mt-1">{conflict.posts.length} posts are scheduled for the exact same time slot.</p>
                  <div className="mt-4 space-y-3">
                    {conflict.posts.map(post => (
                      <div key={post._id} className="border-t border-slate-800/70 pt-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{post.title}</p>
                          <p className="text-xs text-slate-500 mt-1">By {post.authorRef?.name || 'Coordinator'} · {post.status}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                            <Calendar size={13} />
                            {new Date(post.scheduledFor).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(post._id)}
                            disabled={deletingPostId === post._id}
                            title="Delete conflicting post"
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 size={15} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;