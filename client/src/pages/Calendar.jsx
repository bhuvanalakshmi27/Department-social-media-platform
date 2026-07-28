import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Globe, 
  Eye, 
  X,
  FileCheck,
  AlertOctagon,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Start at July 2026 (local time context)
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const year = currentDate.getFullYear();
      const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
      // Query posts scheduled in this month (format: YYYY-MM)
      const response = await api.get(`/api/posts?month=${year}-${monthStr}`);
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching calendar posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentDate]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Published': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'Scheduled': return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';
      case 'Approved': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      case 'Pending Approval': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'Rejected': return 'bg-red-500/15 text-red-400 border border-red-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/api/posts/${id}`);
      setSelectedPost(null);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
  const yearName = currentDate.getFullYear();

  // Helper to retrieve posts scheduled on a specific day
  const getPostsForDay = (day) => {
    if (!day) return [];
    return posts.filter(post => {
      if (!post.scheduledFor) return false;
      const schedDate = new Date(post.scheduledFor);
      return schedDate.getDate() === day && 
             schedDate.getMonth() === currentDate.getMonth() && 
             schedDate.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="space-y-8 select-none">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white font-sans tracking-tight">Content Calendar</h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse social media posts visually by their scheduled publication times.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4 bg-dark-900 border border-slate-800 rounded-xl p-1.5 shadow-md">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold text-white tracking-wide w-32 text-center">
            {monthName} {yearName}
          </span>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday titles */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-glass-md space-y-4">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-850 pb-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Grid cells */}
        {loading ? (
          <div className="grid grid-cols-7 gap-3 min-h-[300px] animate-pulse bg-slate-800/10 rounded-xl"></div>
        ) : (
          <div className="grid grid-cols-7 gap-3 min-h-[380px] text-sm">
            {calendarCells.map((day, idx) => {
              const dayPosts = getPostsForDay(day);
              return (
                <div 
                  key={idx}
                  className={`min-h-[90px] rounded-xl border p-2 flex flex-col justify-between transition-all duration-250 select-none
                    ${day 
                      ? 'bg-dark-900/40 border-slate-800/80 hover:border-brand-500/20' 
                      : 'bg-transparent border-transparent'
                    }`}
                >
                  {/* Day Number */}
                  {day && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-500 text-xs">{day}</span>
                      {dayPosts.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping"></span>
                      )}
                    </div>
                  )}

                  {/* Day Posts List */}
                  <div className="flex-1 flex flex-col justify-end space-y-1.5 overflow-hidden">
                    {dayPosts.slice(0, 2).map(post => (
                      <button
                        key={post._id}
                        onClick={() => setSelectedPost(post)}
                        className={`w-full text-left truncate text-[10px] px-2 py-1 rounded font-medium transition-all select-none cursor-pointer hover:-translate-y-[1px]
                          ${getStatusStyle(post.status)}`}
                      >
                        {post.title}
                      </button>
                    ))}
                    {dayPosts.length > 2 && (
                      <span className="text-[9px] text-brand-400 font-semibold pl-2">
                        +{dayPosts.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Details Dialog Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-lg relative overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Heading */}
            <div className="border-b border-slate-850 pb-4 pr-8">
              <div className="flex flex-wrap gap-2 items-center text-xs text-slate-400 mb-2">
                {selectedPost.platforms.map(p => (
                  <span key={p} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold select-none">
                    {p}
                  </span>
                ))}
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock size={12} className="mr-1" />
                  <span>
                    {selectedPost.scheduledFor ? new Date(selectedPost.scheduledFor).toLocaleString() : 'Unscheduled'}
                  </span>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-sans tracking-wide leading-snug">
                {selectedPost.title}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
              {selectedPost.mediaUrl && (
                <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900 select-none">
                  <img
                    src={selectedPost.mediaUrl}
                    alt={selectedPost.title}
                    className="w-full max-h-52 object-cover"
                  />
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Message Content</h4>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {/* Status Indicator */}
              <div className="grid grid-cols-2 gap-4 bg-dark-900/60 p-4 rounded-xl border border-slate-850">
                <div>
                  <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Post Status</h4>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${getStatusStyle(selectedPost.status)}`}>
                    {selectedPost.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Author</h4>
                  <p className="text-xs text-slate-300 mt-1 font-semibold">{selectedPost.authorRef?.name || 'Coordinator'}</p>
                </div>
              </div>

              {/* Rejection comment if status rejected */}
              {selectedPost.status === 'Rejected' && selectedPost.rejectionComment && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start space-x-2 text-red-400">
                  <AlertOctagon size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold font-sans">Faculty Feedback:</h5>
                    <p className="text-xs mt-0.5 leading-relaxed">{selectedPost.rejectionComment}</p>
                  </div>
                </div>
              )}

              {/* Publishing Logs detailed audit trail */}
              {selectedPost.status === 'Published' && selectedPost.publishLogs && selectedPost.publishLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Mock Publisher API Response Logs</h4>
                  <div className="space-y-2 select-none">
                    {selectedPost.publishLogs.map((log, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-850/80 font-mono text-[10px] text-emerald-400 leading-relaxed">
                        <div className="flex justify-between border-b border-slate-900 pb-1 mb-1 font-semibold">
                          <span>Platform: {log.platform}</span>
                          <span className="text-emerald-500">{log.status}</span>
                        </div>
                        <p>Timestamp: {new Date(log.timestamp).toLocaleString()}</p>
                        <p>Payload: {JSON.stringify(log.mockResponse, null, 2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-850 pt-4 flex justify-between">
              {(selectedPost.authorRef?._id === user?.id || user?.role === 'Admin') && (
                <button
                  onClick={() => handleDeletePost(selectedPost._id)}
                  className="px-4 py-2 bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/20 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Delete Post</span>
                </button>
              )}
              
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer ml-auto"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
