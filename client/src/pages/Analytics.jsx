import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Share2, 
  ThumbsUp, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    averageEngagement: 0
  });

  const loadData = async () => {
    try {
      const [statsRes, postsRes] = await Promise.all([
        api.get('/api/posts/analytics'),
        api.get('/api/posts')
      ]);

      const stats = statsRes.data;
      setData(stats);
      setPosts(postsRes.data);

      // Compute general summary aggregates
      let likes = 0, comments = 0, shares = 0;
      stats.forEach(item => {
        likes += item.likes || 0;
        comments += item.comments || 0;
        shares += item.shares || 0;
      });

      setMetrics({
        totalLikes: likes,
        totalComments: comments,
        totalShares: shares,
        averageEngagement: stats.length ? Math.round((likes + comments + shares) / stats.length) : 0
      });
    } catch (err) {
      console.error('Error fetching analytics metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Process Platform Engagement (Bar Chart)
  const getPlatformChartData = () => {
    const platformStats = {
      Instagram: { likes: 0, comments: 0, shares: 0 },
      LinkedIn: { likes: 0, comments: 0, shares: 0 },
      Twitter: { likes: 0, comments: 0, shares: 0 }
    };

    data.forEach(item => {
      const p = item.platform;
      if (platformStats[p]) {
        platformStats[p].likes += item.likes || 0;
        platformStats[p].comments += item.comments || 0;
        platformStats[p].shares += item.shares || 0;
      }
    });

    return Object.keys(platformStats).map(key => ({
      platform: key,
      Likes: platformStats[key].likes,
      Comments: platformStats[key].comments,
      Shares: platformStats[key].shares
    }));
  };

  // 2. Process Status Distribution (Pie Chart)
  const getStatusChartData = () => {
    const statusCounts = {};
    posts.forEach(post => {
      statusCounts[post.status] = (statusCounts[post.status] || 0) + 1;
    });

    return Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));
  };

  // 3. Process Engagement Trend over Time (Line Chart)
  const getTrendChartData = () => {
    const trendData = {};
    data.forEach(item => {
      if (item.postRef && item.postRef.scheduledFor) {
        const dateStr = new Date(item.postRef.scheduledFor).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        
        if (!trendData[dateStr]) {
          trendData[dateStr] = { date: dateStr, Engagement: 0 };
        }
        trendData[dateStr].Engagement += (item.likes || 0) + (item.comments || 0) + (item.shares || 0);
      }
    });

    // Sort chronologically (rough sort based on date strings isn't ideal, let's keep it in input order which matches DB)
    return Object.values(trendData);
  };

  const COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white font-sans tracking-tight">Analytics Overview</h2>
        <p className="text-sm text-slate-400 mt-1">
          Monitor publishing ratios, platforms and engagement dynamics for CS department posts.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 rounded-2xl glass-card animate-pulse"></div>
          ))}
        </div>
      ) : (
        /* Summary Counters Row */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Likes */}
          <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center space-x-4">
            <div className="bg-pink-500/10 text-pink-400 p-3 rounded-xl">
              <ThumbsUp size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Total Likes</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{metrics.totalLikes.toLocaleString()}</h3>
            </div>
          </div>

          {/* Comments */}
          <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center space-x-4">
            <div className="bg-brand-500/10 text-brand-400 p-3 rounded-xl">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Comments</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{metrics.totalComments.toLocaleString()}</h3>
            </div>
          </div>

          {/* Shares */}
          <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center space-x-4">
            <div className="bg-sky-500/10 text-sky-400 p-3 rounded-xl">
              <Share2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Shares</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{metrics.totalShares.toLocaleString()}</h3>
            </div>
          </div>

          {/* Average Engagement */}
          <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center space-x-4">
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Avg Engagement</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{metrics.averageEngagement.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Charts section */}
      {loading ? (
        <div className="h-96 rounded-2xl glass-panel animate-pulse"></div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-slate-800">
          <AlertCircle className="mx-auto text-amber-500/30 mb-3" size={48} />
          <h3 className="text-lg font-bold text-white mb-1">No Statistics Yet</h3>
          <p className="text-sm text-slate-500">Analytics become available once scheduled posts are auto-published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Platform comparison Bar Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-md space-y-4">
            <h3 className="text-base font-bold text-white font-sans tracking-wide">Engagement by Platform</h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getPlatformChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="platform" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="Likes" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Comments" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Shares" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Trend chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-md space-y-4">
            <h3 className="text-base font-bold text-white font-sans tracking-wide">Engagement Trend Over Time</h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getTrendChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Engagement" stroke="#8B5CF6" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Post Status Breakdown Pie Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-md space-y-4 lg:col-span-2 max-w-xl mx-auto w-full">
            <h3 className="text-base font-bold text-white font-sans tracking-wide text-center">Post Workflow Distribution</h3>
            <div className="h-72 w-full text-xs flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getStatusChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {getStatusChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
