import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  FileText, 
  Clock, 
  CalendarDays, 
  CheckCircle2, 
  PlusCircle, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    draft: 0,
    pending: 0,
    scheduled: 0,
    published: 0
  });

  const fetchPosts = async () => {
    try {
      const response = await api.get('/api/posts');
      const data = response.data;
      setPosts(data);
      
      // Calculate counts
      const counts = { draft: 0, pending: 0, scheduled: 0, published: 0 };
      data.forEach(post => {
        if (post.status === 'Draft') counts.draft++;
        else if (post.status === 'Pending Approval') counts.pending++;
        else if (post.status === 'Scheduled' || post.status === 'Approved') counts.scheduled++;
        else if (post.status === 'Published') counts.published++;
      });
      setStats(counts);
    } catch (error) {
      console.error('Error fetching dashboard posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Scheduled': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Approved': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Pending Approval': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-8 rounded-2xl glass-panel relative overflow-hidden select-none border border-slate-800 shadow-glass-md">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-brand-600/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Welcome back, <span className="gradient-text">{user?.name}</span>!
          </h2>
          <p className="text-sm text-slate-400">
            Here is what's happening with the {user?.department || 'Academic'} department social schedules today.
          </p>
        </div>
        
        {/* Create Post Button */}
        <button
          onClick={() => navigate('/create-post')}
          className="mt-6 md:mt-0 flex items-center justify-center space-x-2 px-5 py-3 rounded-xl gradient-btn cursor-pointer"
        >
          <PlusCircle size={18} />
          <span className="text-sm font-semibold">New Social Post</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 rounded-2xl glass-card animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 select-none">
          {/* Drafts */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden group">
            <div className="absolute right-4 top-4 text-slate-700/30 group-hover:text-slate-600/30 transition-colors">
              <FileText size={48} />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Drafts</p>
            <h3 className="text-4xl font-extrabold text-white mt-2 font-sans">{stats.draft}</h3>
            <p className="text-xs text-slate-400 mt-2">Posts ready to edit</p>
          </div>

          {/* Pending */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden group">
            <div className="absolute right-4 top-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
              <Clock size={48} />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Pending Review</p>
            <h3 className="text-4xl font-extrabold text-white mt-2 font-sans">{stats.pending}</h3>
            <p className="text-xs text-slate-400 mt-2">Awaiting faculty approval</p>
          </div>

          {/* Scheduled */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden group">
            <div className="absolute right-4 top-4 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
              <CalendarDays size={48} />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Scheduled</p>
            <h3 className="text-4xl font-extrabold text-white mt-2 font-sans">{stats.scheduled}</h3>
            <p className="text-xs text-slate-400 mt-2">Queued for autoposting</p>
          </div>

          {/* Published */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden group">
            <div className="absolute right-4 top-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
              <CheckCircle2 size={48} />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Published</p>
            <h3 className="text-4xl font-extrabold text-white mt-2 font-sans">{stats.published}</h3>
            <p className="text-xs text-slate-400 mt-2">Successfully sent to feeds</p>
          </div>
        </div>
      )}

      {/* Main Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent posts logs list */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white tracking-wide font-sans">Recent Content Activity</h3>
              <button 
                onClick={() => navigate('/calendar')}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1 transition-colors duration-150 cursor-pointer"
              >
                <span>Open Calendar</span>
                <ExternalLink size={12} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-16 rounded-xl glass-card animate-pulse"></div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={36} className="mx-auto text-slate-600 mb-2" />
                <p className="text-sm text-slate-500">No posts found. Start by creating one!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="pb-3">Title</th>
                      <th className="pb-3">Author</th>
                      <th className="pb-3">Platforms</th>
                      <th className="pb-3">Scheduled For</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                    {posts.slice(0, 5).map((post) => (
                      <tr key={post._id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 font-semibold text-slate-200 truncate max-w-[180px]">{post.title}</td>
                        <td className="py-4 text-xs text-slate-400">{post.authorRef?.name || 'Faculty'}</td>
                        <td className="py-4">
                          <div className="flex space-x-1.5">
                            {post.platforms.map(p => (
                              <span key={p} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-md font-medium text-slate-300">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 text-xs text-slate-400">
                          {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Not Scheduled'}
                        </td>
                        <td className="py-4 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick approval notifications queue box */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-md flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide font-sans mb-6">Approval Feed</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(n => (
                  <div key={n} className="h-20 rounded-xl glass-card animate-pulse"></div>
                ))}
              </div>
            ) : posts.filter(p => p.status === 'Pending Approval').length === 0 ? (
              <div className="text-center py-12 bg-dark-900/30 rounded-xl border border-dashed border-slate-800/50">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500/40 mb-2" />
                <p className="text-xs font-medium text-slate-400">All caught up!</p>
                <p className="text-[10px] text-slate-500">No posts waiting in review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.filter(p => p.status === 'Pending Approval').slice(0, 3).map((post) => (
                  <div key={post._id} className="p-4 rounded-xl glass-card flex flex-col space-y-2 border border-slate-800">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-slate-200 truncate max-w-[150px]">{post.title}</h4>
                      <span className="text-[9px] text-brand-400 font-semibold tracking-wider uppercase">Pending</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{post.content}</p>
                    <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500">
                      <span>By {post.authorRef?.name}</span>
                      <button 
                        onClick={() => navigate('/approval-queue')}
                        className="text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
