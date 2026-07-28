import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LayoutGrid, Sparkles, Filter, Plus, X, FileImage } from 'lucide-react';

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Template form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Announcement');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/templates');
      setTemplates(response.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !category.trim()) {
      setError('Title and category are required.');
      return;
    }

    try {
      await api.post('/api/templates', { title, category, imageUrl });
      setShowCreateModal(false);
      setTitle('');
      setImageUrl('');
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create template.');
    }
  };

  const handleUseTemplate = (template) => {
    // Navigate to Post Creator and prefill state
    navigate('/create-post', { state: { template } });
  };

  const categories = ['All', 'Announcement', 'Event', 'Achievement'];

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-8 select-none">
      {/* Templates Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white font-sans tracking-tight">Post Templates</h2>
          <p className="text-sm text-slate-400 mt-1">
            Pick a pre-designed announcement template to jumpstart content creation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl gradient-btn cursor-pointer"
        >
          <Plus size={18} />
          <span className="text-sm font-semibold">New Template</span>
        </button>
      </div>

      {/* Category filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-500 mr-1" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer
              ${selectedCategory === cat 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                : 'bg-dark-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
          >
            {cat}s
          </button>
        ))}
      </div>

      {/* Grid gallery */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 rounded-2xl glass-card animate-pulse"></div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-slate-800">
          <LayoutGrid className="mx-auto text-slate-650 mb-3" size={48} />
          <h3 className="text-lg font-bold text-white mb-1">No Templates Found</h3>
          <p className="text-sm text-slate-500">Create a template first or select a different category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template._id} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-glass-md flex flex-col justify-between group">
              {/* Template image mockup */}
              <div className="h-44 w-full bg-dark-950 overflow-hidden relative border-b border-slate-850">
                {template.imageUrl ? (
                  <img
                    src={template.imageUrl}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-900"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900/50 flex flex-col items-center justify-center text-slate-600 space-y-2">
                    <FileImage size={36} />
                    <span className="text-[10px]">No design graphic</span>
                  </div>
                )}
                
                <span className="absolute top-3 left-3 bg-dark-900/85 backdrop-blur-sm text-[9px] font-bold text-brand-400 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-widest">
                  {template.category}
                </span>
              </div>

              {/* Template Text details */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-200 tracking-wide text-sm line-clamp-1">
                    {template.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 select-none">
                    Created by {template.createdBy?.name || 'Department Admin'}
                  </p>
                </div>

                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full py-2.5 rounded-lg border border-brand-500/30 hover:border-brand-500 text-brand-400 hover:text-brand-300 bg-brand-500/5 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Use Template Layout</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 shadow-glass-lg space-y-4 relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-2 text-brand-400 mb-2">
              <Plus size={20} />
              <h3 className="text-lg font-bold text-slate-200 font-sans">Create Custom Template</h3>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTemplateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Template Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Research Fellowship Notice"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-sm bg-dark-900"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Event">Event</option>
                    <option value="Achievement">Achievement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Graphic Cover URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-800 text-slate-400 font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
