import React, { useState, useEffect } from 'react';
import { ShieldAlert, BookOpen, KeyRound, Upload, Trash2, CheckCircle2, Edit3, PlusCircle, ArrowLeft } from 'lucide-react';
import { BlogPost, PageType } from '../types';
import { addBlogPost, updateBlogPost, deleteBlogPost } from '../lib/blogService';

interface BlogAdminViewProps {
  blogs: BlogPost[];
  setCurrentPage: (page: PageType) => void;
  onDatabaseUpdate?: () => void;
}

export default function BlogAdminView({ blogs, setCurrentPage, onDatabaseUpdate }: BlogAdminViewProps) {
  // Authentication State
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Mode: 'list' | 'add' | 'edit'
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Blog Fields State
  const [selectedId, setSelectedId] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('CARZev Editorial');
  const [content, setContent] = useState('');
  
  // Dynamic images state (up to 3)
  const [images, setImages] = useState<string[]>(['', '', '']);
  const [imageTypes, setImageTypes] = useState<'url' | 'file'[]>(['url', 'url', 'url']);

  // Update internal blogs list when props update or authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setBlogsList(blogs);
    }
  }, [isAuthenticated, blogs]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect system password. Please request database access.');
    }
  };

  const handleEditClick = (post: BlogPost) => {
    setSelectedId(post.id);
    setTitle(post.title);
    setAuthor(post.author);
    setContent(post.content);
    setImages([
      post.images[0] || '',
      post.images[1] || '',
      post.images[2] || ''
    ]);
    setImageTypes(['url', 'url', 'url']);
    setMode('edit');
  };

  const handleDeleteClick = async (id: string, postTitle: string) => {
    if (confirm(`Are you sure you want to delete the article "${postTitle}"?`)) {
      try {
        await deleteBlogPost(id);
        onDatabaseUpdate?.();
      } catch (err: any) {
        alert(`Failed to delete the article. Error: ${err?.message || err}`);
      }
    }
  };

  // Convert local uploaded file to base64
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 2.5MB to prevent overflows)
    if (file.size > 2.5 * 1024 * 1024) {
      alert("Local image file is too large! Please upload images under 2.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const newImages = [...images];
        newImages[index] = reader.result;
        setImages(newImages);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (index: number, val: string) => {
    const newImages = [...images];
    newImages[index] = val;
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = '';
    setImages(newImages);
  };

  const toggleImageType = (index: number, type: 'url' | 'file') => {
    const newTypes = [...imageTypes];
    newTypes[index] = type;
    setImageTypes(newTypes);
    
    // Clear value on toggle
    const newImages = [...images];
    newImages[index] = '';
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Please fill out the Title and Content fields before publishing.");
      return;
    }

    // Filter active images
    const activeImages = images.filter(img => img.trim() !== '');

    try {
      if (mode === 'edit') {
        const originalPost = blogs.find(b => b.id === selectedId);
        await updateBlogPost({
          id: selectedId,
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
          images: activeImages,
          createdAt: originalPost?.createdAt || new Date().toISOString(),
          readTime: originalPost?.readTime || '1 min read'
        });
        setSuccessMessage('Article updated successfully!');
      } else {
        await addBlogPost({
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
          images: activeImages,
        });
        setSuccessMessage('New article published successfully!');
      }

      onDatabaseUpdate?.();
      setIsSuccess(true);
    } catch (err) {
      alert("Failed to save article to Firestore. Please check your internet connection.");
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setAuthor('CARZev Editorial');
    setContent('');
    setImages(['', '', '']);
    setImageTypes(['url', 'url', 'url']);
    setIsSuccess(false);
    setMode('list');
  };

  // 1. Password login screen
  if (!isAuthenticated) {
    return (
      <div className="bg-[#111317] min-h-screen flex items-center justify-center pt-24 pb-16 text-[#e2e2e8]" id="admin-login-screen">
        <div className="max-w-md w-full mx-4 bg-[#1a1c20] p-8 rounded-2xl border border-[#414750]/30 shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#1b6ca8]/10 border border-[#9acbff]/25 flex items-center justify-center mx-auto text-[#9acbff]">
            <KeyRound className="w-6 h-6" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Publisher Dashboard</h1>
            <p className="text-xs text-[#8b919b] font-medium">Authentication required to submit editorial articles</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b] mb-1.5">Console Password</label>
              <input
                type="password"
                placeholder="Enter system password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-3 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                required
              />
            </div>
            
            {authError && (
              <p className="text-[11px] text-[#ff6e6e] font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#1b6ca8] text-white py-3 font-bold text-xs rounded-xl hover:bg-[#114f7d] transition-all cursor-pointer text-center"
            >
              Verify Credentials
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Success screen
  if (isSuccess) {
    return (
      <div className="bg-[#111317] min-h-screen flex items-center justify-center pt-24 pb-16 text-[#e2e2e8]" id="admin-success-screen">
        <div className="max-w-md w-full mx-4 bg-[#1a1c20] p-8 rounded-2xl border border-[#414750]/30 shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#00C896]/10 border border-[#00C896]/25 flex items-center justify-center mx-auto text-[#00C896]">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{successMessage}</h1>
            <p className="text-xs text-[#8b919b] font-medium leading-relaxed">
              Your article has been successfully compiled, processed, and synced to the cloud database.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={() => setCurrentPage('blog')}
              className="w-full bg-[#00C896] text-[#002116] py-3 font-bold text-xs rounded-xl hover:bg-[#00e3aa] transition-all cursor-pointer text-center"
            >
              View Live Blog Catalog
            </button>
            <button
              onClick={handleResetForm}
              className="w-full bg-[#111317] text-[#c0c7d1] border border-[#414750]/30 py-3 font-bold text-xs rounded-xl hover:text-white hover:border-[#8b919b] transition-all cursor-pointer text-center"
            >
              Back to Articles List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Blog List Dashboard
  if (mode === 'list') {
    return (
      <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="blog-admin-dashboard">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#414750]/20 mb-8">
            <div>
              <span className="text-[10px] text-[#9acbff] font-mono tracking-widest uppercase font-bold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Publisher Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans mt-1">
                Articles Management
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setTitle('');
                  setAuthor('CARZev Editorial');
                  setContent('');
                  setImages(['', '', '']);
                  setImageTypes(['url', 'url', 'url']);
                  setMode('add');
                }}
                className="bg-[#1b6ca8] text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-[#114f7d] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                New Article
              </button>
              <button
                onClick={() => setCurrentPage('car-admin')}
                className="text-xs font-bold text-[#9acbff] hover:text-[#b4d6ff] transition-all cursor-pointer"
              >
                Switch to EV Catalog Admin
              </button>
              <button
                onClick={() => setCurrentPage('blog')}
                className="text-xs font-bold text-[#8b919b] hover:text-white transition-all cursor-pointer"
              >
                Exit Console
              </button>
            </div>
          </div>

          {/* Blogs Table */}
          <div className="bg-[#1a1c20] rounded-2xl border border-[#414750]/30 overflow-hidden">
            {blogsList.length === 0 ? (
              <div className="p-12 text-center text-[#8b919b] text-sm">
                No blog posts available. Click "New Article" to write one!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#414750]/30 bg-[#111317]/50 text-[10px] uppercase font-bold text-[#8b919b] tracking-wider">
                      <th className="py-4 px-6">Image</th>
                      <th className="py-4 px-6">Article Title</th>
                      <th className="py-4 px-6">Author</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#414750]/20 text-xs">
                    {blogsList.map((blog) => (
                      <tr key={blog.id} className="hover:bg-[#202329]/40 transition-colors">
                        <td className="py-4 px-6">
                          <img 
                            src={blog.images[0] || 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800'} 
                            alt={blog.title} 
                            className="w-12 h-8 object-cover rounded-lg border border-[#414750]/20 bg-[#111317]"
                          />
                        </td>
                        <td className="py-4 px-6 font-semibold text-white max-w-xs truncate">
                          {blog.title}
                        </td>
                        <td className="py-4 px-6 text-[#c0c7d1]">{blog.author}</td>
                        <td className="py-4 px-6 text-[#8b919b] font-mono">
                          {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(blog)}
                            className="text-[#9acbff] hover:text-[#b4d6ff] p-1.5 rounded bg-[#9acbff]/5 border border-[#9acbff]/20 hover:scale-105 transition-all inline-flex items-center gap-1"
                            title="Edit Article"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(blog.id, blog.title)}
                            className="text-[#ff6e6e] hover:text-[#ff9c9c] p-1.5 rounded bg-[#ff6e6e]/5 border border-[#ff6e6e]/20 hover:scale-105 transition-all inline-flex items-center gap-1"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // 4. Blog Editor dashboard form
  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="blog-admin-dashboard">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#414750]/20 mb-8">
          <div>
            <span className="text-[10px] text-[#9acbff] font-mono tracking-widest uppercase font-bold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Publisher Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans mt-1">
              {mode === 'edit' ? 'Edit Article' : 'Create New Article'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMode('list')}
              className="text-xs font-bold text-[#8b919b] hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to List
            </button>
          </div>
        </div>

        {/* Main Editor Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Article Info Cards */}
          <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8b919b] pb-2 border-b border-[#414750]/20">
              Article Meta Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Article Title *</label>
                <input
                  type="text"
                  placeholder="e.g. The Secrets of Liquid Cooled EV Battery Modules"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Author Name</label>
                <input
                  type="text"
                  placeholder="e.g. Siddharth Sharma"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Upload Images Cards */}
          <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#414750]/20">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8b919b]">
                Article Media (Max 3 Images)
              </h2>
              <span className="text-[10px] text-[#8b919b] font-mono">
                Active: {images.filter(Boolean).length}/3
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((idx) => {
                const isCover = idx === 0;
                const imageVal = images[idx];
                const imageType = imageTypes[idx];

                return (
                  <div key={idx} className="bg-[#111317] p-4 rounded-xl border border-[#414750]/25 flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">
                        {isCover ? 'Cover Image (Required)' : `Optional Image #${idx + 1}`}
                      </span>
                      {imageVal && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="text-[#ff6e6e] hover:text-[#ff9c9c] transition-all"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5 cursor-pointer" />
                        </button>
                      )}
                    </div>

                    {/* Toggle selector */}
                    <div className="grid grid-cols-2 bg-[#1a1c20] p-1 rounded-lg border border-[#414750]/20">
                      <button
                        type="button"
                        onClick={() => toggleImageType(idx, 'url')}
                        className={`py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                          imageType === 'url' ? 'bg-[#1b6ca8] text-white' : 'text-[#8b919b]'
                        }`}
                      >
                        Web URL
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleImageType(idx, 'file')}
                        className={`py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                          imageType === 'file' ? 'bg-[#1b6ca8] text-white' : 'text-[#8b919b]'
                        }`}
                      >
                        Local File
                      </button>
                    </div>

                    {/* Input field */}
                    {imageType === 'url' ? (
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={imageVal.startsWith('data:') ? '' : imageVal}
                        onChange={(e) => handleUrlChange(idx, e.target.value)}
                        className="w-full bg-[#1a1c20] text-[11px] font-medium text-white border border-[#414750]/30 rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#9acbff] transition-all"
                        required={isCover && imageType === 'url'}
                      />
                    ) : (
                      <div className="relative">
                        <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#1a1c20] hover:bg-[#202329] border border-[#414750]/35 rounded-lg text-[10px] font-bold text-[#c0c7d1] cursor-pointer transition-all">
                          <Upload className="w-3.5 h-3.5 text-[#9acbff]" />
                          {imageVal ? 'Change Image' : 'Select Local File'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(idx, e)}
                            className="hidden"
                            required={isCover && !imageVal}
                          />
                        </label>
                      </div>
                    )}

                    {/* Preview Area */}
                    {imageVal ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-[#414750]/20 bg-[#1a1c20]">
                        <img
                          src={imageVal}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg border border-dashed border-[#414750]/40 flex items-center justify-center text-[10px] text-[#8b919b] font-mono">
                        No Preview Available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content TextArea */}
          <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#414750]/20">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8b919b]">Article Body *</label>
              <span className="text-[10px] text-[#8b919b] font-mono">
                Press double Enter to create paragraph separations
              </span>
            </div>
            <textarea
              placeholder="Start typing your electric vehicle insights here... Write multiple paragraphs separated by empty lines."
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#111317] text-sm leading-relaxed text-[#e2e2e8] border border-[#414750]/40 rounded-xl p-4 focus:outline-none focus:border-[#9acbff] transition-all font-sans"
              required
            ></textarea>
            
            {content.trim() && (
              <div className="text-[10px] text-[#8b919b] font-mono flex items-center justify-between">
                <span>Words: {content.trim().split(/\s+/).length}</span>
                <span>Calculated Read Time: {Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))} min read</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleResetForm}
              className="bg-[#1a1c20] text-[#c0c7d1] border border-[#414750]/40 py-3 px-8 font-bold text-xs rounded-xl hover:text-white hover:border-[#8b919b] transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1b6ca8] text-white py-3 px-8 font-bold text-xs rounded-xl hover:bg-[#114f7d] transition-all cursor-pointer text-center"
            >
              {mode === 'edit' ? 'Update Article' : 'Publish Blog Post'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
