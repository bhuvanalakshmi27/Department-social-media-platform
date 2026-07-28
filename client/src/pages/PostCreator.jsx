import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Image as ImageIcon, 
  Calendar, 
  Send, 
  Save, 
  AlertCircle,
  FileCheck,
  Sparkles
} from 'lucide-react';

const PostCreator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [templateRef, setTemplateRef] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  
  // App State
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if we came from "Use Template" redirect
  useEffect(() => {
    if (location.state && location.state.template) {
      const { template } = location.state;
      setTitle(template.title || '');
      setMediaUrl(template.imageUrl || '');
      setTemplateRef(template._id || '');
      // Prefill some sample description based on category
      if (template.category === 'Event') {
        setContent(`📅 Exciting Event Coming Up!\n\nJoin us for ${template.title}. Learn more details inside. See you there!\n\n#CSDepartment #CampusEvent`);
      } else if (template.category === 'Achievement') {
        setContent(`🏆 Department Achievement!\n\nWe are proud to share that ${template.title}. Congratulations to everyone involved!\n\n#CSDepartment #StudentSuccess`);
      } else {
        setContent(`📢 Department Announcement!\n\n${template.title}. Read all details on the department bulletin board.\n\n#CSDepartment #Announcement`);
      }
    }
  }, [location]);

  // Load available templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/api/templates');
        setTemplates(response.data);
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  const handlePlatformToggle = (platform) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleTemplateSelect = (template) => {
    setTemplateRef(template._id);
    setTitle(template.title);
    setMediaUrl(template.imageUrl || '');
    if (template.category === 'Event') {
      setContent(`📅 Exciting Event Coming Up!\n\nJoin us for ${template.title}. Learn more details inside. See you there!\n\n#CSDepartment #CampusEvent`);
    } else if (template.category === 'Achievement') {
      setContent(`🏆 Department Achievement!\n\nWe are proud to share that ${template.title}. Congratulations to everyone involved!\n\n#CSDepartment #StudentSuccess`);
    } else {
      setContent(`📢 Department Announcement!\n\n${template.title}. Read all details on the department bulletin board.\n\n#CSDepartment #Announcement`);
    }
  };

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content.');
      return;
    }
    if (platforms.length === 0) {
      setError('Please select at least one social media platform.');
      return;
    }
    if (status === 'Pending Approval' && !scheduledFor) {
      setError('A scheduled date and time is required to submit a post for approval.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        content,
        platforms,
        mediaUrl,
        templateRef: templateRef || null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status // 'Draft' or 'Pending Approval'
      };

      await api.post('/api/posts', payload);
      setSuccess(status === 'Draft' ? 'Draft saved successfully!' : 'Post submitted for approval!');
      
      // Clear form on success
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white font-sans tracking-tight">Post Creator</h2>
        <p className="text-sm text-slate-400 mt-1">
          Draft a new announcement, attach templates, configure schedules, and submit for review.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center space-x-2 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center space-x-2 text-sm">
          <FileCheck size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creator Form */}
        <form className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 shadow-glass-md">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Post Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. HackCS 2026 Registration Open"
                className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm"
              />
            </div>

            {/* Content text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex justify-between">
                <span>Body Content</span>
                <span className="text-[10px] text-slate-500 font-normal select-none">
                  {content.length} characters
                </span>
              </label>
              <textarea
                rows="6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your social post description here..."
                className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm resize-y"
              />
            </div>

            {/* Platforms selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Publishing Platforms
              </label>
              <div className="grid grid-cols-3 gap-4">
                {/* Instagram */}
                <button
                  type="button"
                  onClick={() => handlePlatformToggle('Instagram')}
                  className={`py-3 px-4 rounded-xl flex items-center justify-center space-x-2 border transition-all duration-200 cursor-pointer
                    ${platforms.includes('Instagram')
                      ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 shadow-md shadow-pink-500/5'
                      : 'bg-dark-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <Instagram size={18} />
                  <span className="text-xs font-semibold">Instagram</span>
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={() => handlePlatformToggle('LinkedIn')}
                  className={`py-3 px-4 rounded-xl flex items-center justify-center space-x-2 border transition-all duration-200 cursor-pointer
                    ${platforms.includes('LinkedIn')
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-md shadow-blue-500/5'
                      : 'bg-dark-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <Linkedin size={18} />
                  <span className="text-xs font-semibold">LinkedIn</span>
                </button>

                {/* Twitter */}
                <button
                  type="button"
                  onClick={() => handlePlatformToggle('Twitter')}
                  className={`py-3 px-4 rounded-xl flex items-center justify-center space-x-2 border transition-all duration-200 cursor-pointer
                    ${platforms.includes('Twitter')
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-md shadow-sky-500/5'
                      : 'bg-dark-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <Twitter size={18} />
                  <span className="text-xs font-semibold">Twitter</span>
                </button>
              </div>
            </div>

            {/* Media Upload and Scheduling Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <ImageIcon size={14} />
                  <span>Media Image URL</span>
                </label>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Calendar size={14} />
                  <span>Scheduled Publication Date</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4">
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, 'Draft')}
              className="flex-1 py-3.5 rounded-xl border border-slate-800 bg-dark-900/60 text-slate-300 font-semibold text-sm hover:bg-dark-800 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Save size={16} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, 'Pending Approval')}
              className="flex-1 py-3.5 rounded-xl gradient-btn text-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Send size={16} />
              <span>Submit for Approval</span>
            </button>
          </div>
        </form>

        {/* Sidebar Info - Quick Templates */}
        <div className="space-y-6">
          {/* Quick template pick list */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-md space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide font-sans flex items-center space-x-2">
              <Sparkles size={16} className="text-brand-400" />
              <span>Use a Quick Template</span>
            </h3>
            <p className="text-xs text-slate-400">
              Applying a template auto-populates the post layout and attaches the graphic template.
            </p>
            <div className="space-y-3 pt-2">
              {templates.slice(0, 3).map((template) => (
                <button
                  type="button"
                  key={template._id}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full p-3 rounded-xl glass-card flex items-center space-x-3 text-left border border-slate-800 hover:border-brand-500/20 cursor-pointer"
                >
                  {template.imageUrl ? (
                    <img
                      src={template.imageUrl}
                      alt={template.title}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 font-bold">
                      T
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-200 truncate">{template.title}</p>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-semibold tracking-wider uppercase">
                      {template.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Preview Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-md space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Feed Preview</h3>
            
            <div className="bg-dark-900/80 rounded-xl overflow-hidden border border-slate-800/80 shadow-inner">
              {mediaUrl && (
                <img
                  src={mediaUrl}
                  alt="Post preview"
                  className="w-full h-40 object-cover bg-slate-800"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white uppercase select-none">
                    CP
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Department Channel</h4>
                    <p className="text-[9px] text-slate-500">Preview Mode</p>
                  </div>
                </div>
                
                <h5 className="text-xs font-bold text-slate-200 leading-snug">
                  {title || 'Untranslated Post Title'}
                </h5>
                
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {content || 'Post content description text will stream here as you fill the creator fields.'}
                </p>

                <div className="pt-2 border-t border-slate-800/50 flex space-x-2">
                  {platforms.length > 0 ? (
                    platforms.map(p => (
                      <span key={p} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium select-none">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-slate-600 select-none">No platform chosen</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCreator;
