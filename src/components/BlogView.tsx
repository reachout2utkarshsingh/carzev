import React, { useState, useMemo } from 'react';
import { Calendar, User, Clock, ArrowLeft, Search, BookOpen } from 'lucide-react';
import { BlogPost, PageType } from '../types';

interface BlogViewProps {
  blogs: BlogPost[];
  setCurrentPage: (page: PageType) => void;
}

export default function BlogView({ blogs, setCurrentPage }: BlogViewProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle post selection
  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;
    return blogs.find((b) => b.id === selectedPostId) || null;
  }, [selectedPostId, blogs]);

  // Filter list based on search
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchText = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(matchText) ||
        b.content.toLowerCase().includes(matchText) ||
        b.author.toLowerCase().includes(matchText)
      );
    });
  }, [blogs, searchQuery]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recent Post';
    }
  };

  // 1. Detailed Article Reader View
  // 1. Detailed Article Reader View
  if (selectedPost) {
    const coverImage = selectedPost.images && selectedPost.images.length > 0 ? selectedPost.images[0] : null;
    const inlineImages = selectedPost.images ? selectedPost.images.slice(1) : [];

    const parseMarkdown = (text: string): React.ReactNode[] => {
      const lines = text.split('\n');
      const elements: React.ReactNode[] = [];
      let currentList: React.ReactNode[] = [];
      let inList = false;

      const flushList = (key: number) => {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${key}`} className="list-disc pl-6 space-y-2 my-4 text-[#c0c7d1]">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
      };

      const inlineParse = (lineText: string) => {
        const parts = lineText.split('**');
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <strong key={index} className="text-white font-bold">{part}</strong>;
          }
          return part;
        });
      };

      lines.forEach((line, index) => {
        const trimmed = line.trim();

        // Horizontal Rule
        if (trimmed === '---') {
          flushList(index);
          elements.push(<hr key={index} className="border-[#414750]/30 my-8" />);
          return;
        }

        // Headings
        if (trimmed.startsWith('# ')) {
          flushList(index);
          elements.push(
            <h1 key={index} className="text-3xl font-black text-white mt-8 mb-4 tracking-tight font-sans">
              {inlineParse(trimmed.substring(2))}
            </h1>
          );
          return;
        }
        if (trimmed.startsWith('## ')) {
          flushList(index);
          elements.push(
            <h2 key={index} className="text-2xl font-extrabold text-white mt-8 mb-4 tracking-tight font-sans">
              {inlineParse(trimmed.substring(3))}
            </h2>
          );
          return;
        }
        if (trimmed.startsWith('### ')) {
          flushList(index);
          elements.push(
            <h3 key={index} className="text-xl font-bold text-white mt-6 mb-3 tracking-tight font-sans">
              {inlineParse(trimmed.substring(4))}
            </h3>
          );
          return;
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          flushList(index);
          elements.push(
            <blockquote key={index} className="border-l-4 border-[#1b6ca8] pl-4 italic text-[#8b919b] bg-[#1a1c20]/45 p-4 rounded-r-xl my-6">
              {inlineParse(trimmed.substring(2))}
            </blockquote>
          );
          return;
        }

        // Bullet lists
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          inList = true;
          currentList.push(
            <li key={`li-${index}`} className="leading-relaxed">
              {inlineParse(trimmed.substring(2))}
            </li>
          );
          return;
        }

        // Empty lines
        if (trimmed === '') {
          flushList(index);
          return;
        }

        // Default paragraph
        flushList(index);
        elements.push(
          <p key={index} className="leading-relaxed text-[#c0c7d1] mb-4">
            {inlineParse(trimmed)}
          </p>
        );
      });

      flushList(lines.length);
      return elements;
    };

    const parsedContent = parseMarkdown(selectedPost.content);
    // Insert inline images in the middle of the article
    const middleIndex = Math.floor(parsedContent.length / 2);
    const elementsWithImages = [...parsedContent];
    if (inlineImages.length > 0) {
      elementsWithImages.splice(
        middleIndex,
        0,
        <div key="inline-images-gallery" className={`grid ${inlineImages.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-6 my-10`}>
          {inlineImages.map((imgUrl, imgIdx) => (
            <div key={imgIdx} className="relative aspect-[3/2] rounded-xl overflow-hidden border border-[#414750]/30 bg-[#1a1c20] shadow-lg">
              <img
                src={imgUrl}
                alt={`Article illust ${imgIdx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="blog-detail-view">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Action */}
          <button
            onClick={() => setSelectedPostId(null)}
            className="flex items-center gap-2 text-xs font-extrabold text-[#9acbff] hover:text-white transition-all uppercase tracking-wider mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </button>

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight font-sans">
              {selectedPost.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8b919b] font-mono border-y border-[#414750]/20 py-4 mt-6">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#9acbff]" />
                <span className="text-white font-bold">{selectedPost.author}</span>
              </div>
              <div className="hidden sm:block text-[#414750]">|</div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#00C896]" />
                <span>{formatDate(selectedPost.createdAt)}</span>
              </div>
              <div className="hidden sm:block text-[#414750]">|</div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#00C896]" />
                <span>{selectedPost.readTime}</span>
              </div>
            </div>
          </header>

          {/* Cover Banner */}
          {coverImage && (
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-10 border border-[#414750]/30 shadow-2xl bg-[#1a1c20]">
              <img
                src={coverImage}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Article Content Layout */}
          <div className="prose prose-invert max-w-none text-base sm:text-lg leading-relaxed text-[#c0c7d1] space-y-6">
            {elementsWithImages}
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-[#414750]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-mono text-[#8b919b]">Category: Zero Emission Mobility</p>
            </div>
            <button
              onClick={() => setSelectedPostId(null)}
              className="w-full sm:w-auto bg-[#1b6ca8] text-white py-2.5 px-6 font-bold text-xs rounded-xl hover:bg-[#114f7d] transition-all cursor-pointer text-center"
            >
              Back to Catalog
            </button>
          </footer>

        </div>
      </div>
    );
  }

  // 2. Blog Catalog Grid Listing View
  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="blog-catalog-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b6ca8]/10 border border-[#9acbff]/30 text-[#9acbff] text-xs font-bold font-mono">
            <BookOpen className="w-4 h-4" />
            CARZev Insights
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Demystifying Electric Mobility
          </h1>
          <p className="text-sm sm:text-base text-[#8b919b] font-medium leading-relaxed">
            Stay up to date with deep dives into battery engineering, charging infrastructures, roadtrip guides, and reviews of upcoming EV models in India.
          </p>
        </div>

        {/* Filters and Search toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#414750]/20 mb-10">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              Latest Articles
              <span className="text-xs bg-[#1b6ca8]/20 text-[#9acbff] px-2 py-0.5 rounded font-mono">
                {filteredBlogs.length}
              </span>
            </h2>
          </div>

          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#8b919b]" />
            </div>
            <input
              type="text"
              placeholder="Search posts or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1c20] text-xs font-semibold text-white border border-[#414750]/60 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#9acbff] transition-all"
            />
          </div>
        </div>

        {/* Empty Catalog Fallback */}
        {filteredBlogs.length === 0 ? (
          <div className="bg-[#1a1c20] rounded-2xl border border-[#414750]/20 p-16 text-center max-w-md mx-auto">
            <p className="text-base font-bold text-[#c0c7d1] mb-2">No articles match your search.</p>
            <p className="text-xs text-[#8b919b] mb-6">Try searching for other topics like "charging", "battery", or "Mahindra".</p>
            <button
              onClick={() => setSearchQuery('')}
              className="bg-[#1b6ca8] text-white py-2 px-6 rounded-xl text-xs font-bold hover:bg-[#114f7d] transition-all cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          /* Responsive Grid layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => {
              const coverImg = blog.images[0] || 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800';
              return (
                <div
                  key={blog.id}
                  onClick={() => setSelectedPostId(blog.id)}
                  className="bg-[#1a1c20] rounded-2xl border border-[#414750]/30 overflow-hidden hover:border-[#9acbff]/50 hover:shadow-2xl transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  {/* Article Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-[#111317]">
                    <img
                      src={coverImg}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Article Body */}
                  <div className="p-6 flex flex-col flex-grow space-y-3">
                    <span className="text-[10px] text-[#9acbff] font-mono tracking-widest uppercase font-bold leading-none">
                      Insights
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#9acbff] transition-colors leading-snug line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-[#8b919b] line-clamp-3 leading-relaxed">
                      {blog.content.replace(/\s+/g, ' ').substring(0, 140)}...
                    </p>

                    {/* Metadata */}
                    <div className="mt-auto pt-4 border-t border-[#414750]/20 flex items-center justify-between text-[11px] text-[#8b919b] font-mono">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#00C896]" />
                        <span className="truncate max-w-[120px]">{blog.author.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{blog.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
