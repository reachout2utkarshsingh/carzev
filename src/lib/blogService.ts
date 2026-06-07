import { BlogPost } from '../types';
import { seedBlogs } from '../data/blogData';

// Local storage key
const LOCAL_STORAGE_KEY = 'carzev_blogs';

// Clean helper to generate simple unique slugs from titles
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

export function getBlogPosts(): BlogPost[] {
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const userBlogs: BlogPost[] = localData ? JSON.parse(localData) : [];
    
    // Combine seed articles and user added ones
    const combined = [...userBlogs, ...seedBlogs];
    
    // Sort chronological: Newest first
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to parse blogs from local storage, returning defaults:", error);
    return [...seedBlogs];
  }
}

export function addBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'readTime'>): BlogPost {
  // 1. Calculate reading time
  const wordCount = post.content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  const readTime = `${minutes} min read`;

  // 2. Build full post
  const newPost: BlogPost = {
    ...post,
    id: generateSlug(post.title),
    createdAt: new Date().toISOString(),
    readTime
  };

  // 3. Persist to localStorage
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingBlogs: BlogPost[] = localData ? JSON.parse(localData) : [];
    
    existingBlogs.unshift(newPost); // Insert at beginning of user list
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingBlogs));
  } catch (error) {
    console.error("Failed to save new blog to local storage:", error);
  }

  return newPost;
}
