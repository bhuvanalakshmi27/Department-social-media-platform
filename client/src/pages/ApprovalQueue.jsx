import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react';

const ApprovalQueue = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectingPostId, setRejectingPostId] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');

  const fetchPendingPosts = async () => {
    try {
      const response = await api.get('/api/posts?status=Pending Approval');
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching pending posts:', err);
      setError('Failed to fetch approval queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const handleApprove = async (id) => {
    setError('');
    setSuccess('');
    try {
      // Transitioning to 'Approved' will promote it to 'Scheduled' automatically in our backend since it has a scheduledFor date
      const response = await api.patch(`/api/posts/${id}/status`, {
        status: 'Approved'
      });
      setSuccess(`Post "${response.data.title}" successfully approved and scheduled!`);
      fetchPendingPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve post.');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!rejectionComment.trim()) {
      setError('Please provide a rejection comment.');
      return;
    }

    try {
      await api.patch(`/api/posts/${rejectingPostId}/status`, {
        status: 'Rejected',
        rejectionComment
      });
      setSuccess('Post rejected. Notification returned to creator.');
      setRejectingPostId(null);
      setRejectionComment('');
      fetchPendingPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject post.');
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white font-sans tracking-tight">Approval Queue</h2>
        <p className="text-sm text-slate-400 mt-1">
          Review posts prepared by student coordinators. Approve to queue them for mock publication, or reject with feedback.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center space-x-2 text-sm animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center space-x-2 text-sm animate-fade-in">
          <CheckCircle size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main content list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(n => (
            <div key={n} className="h-48 rounded-2xl glass-card animate-pulse"></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-slate-800">
          <CheckCircle className="mx-auto text-emerald-500/30 mb-3" size={48} />
          <h3 className="text-lg font-bold text-white mb-1">Queue is Empty</h3>
          <p className="text-sm text-slate-500">There are no pending posts requiring verification.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-md flex flex-col md:flex-row gap-6 relative overflow-hidden">
              
              {/* Media image if present */}
              {post.mediaUrl && (
                <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-dark-900 select-none">
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Text content details */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.platforms.map(p => (
                      <span key={p} className="text-[10px] bg-brand-600/15 border border-brand-500/20 text-brand-300 px-2 py-0.5 rounded-md font-semibold">
                        {p}
                      </span>
                    ))}
                    <span className="text-slate-600 text-xs select-none">•</span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <User size={12} className="mr-1" />
                      <span>{post.authorRef?.name || 'Coordinator'}</span>
                    </span>
                    <span className="text-slate-600 text-xs select-none">•</span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Calendar size={12} className="mr-1" />
                      <span>
                        {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Unscheduled'}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 font-sans tracking-wide leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Operations panel */}
                <div className="flex items-center space-x-3 pt-6 border-t border-slate-850/50 mt-4">
                  <button
                    onClick={() => handleApprove(post._id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle size={14} />
                    <span>Approve Post</span>
                  </button>

                  <button
                    onClick={() => setRejectingPostId(post._id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle size={14} />
                    <span>Reject Post</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal dialog */}
      {rejectingPostId && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-lg space-y-4">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <XCircle size={20} />
              <h3 className="text-lg font-bold text-slate-200 font-sans">Reject Submission</h3>
            </div>
            
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide a reason or comments regarding this rejection. This feedback will be sent to the coordinator so they can correct and resubmit.
              </p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Rejection Reason
                </label>
                <textarea
                  rows="4"
                  required
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  placeholder="e.g. Please change the event time to 4:30 PM..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setRejectingPostId(null); setRejectionComment(''); }}
                  className="flex-1 py-2.5 rounded-lg border border-slate-800 text-slate-400 font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
