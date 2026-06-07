import { BlogPost } from '../types';
import { seedBlogs } from '../data/blogData';
import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

const COLLECTION_NAME = "blog_posts";

// Clean helper to generate simple unique slugs from titles
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    if (querySnapshot.empty) {
      console.log("Firestore blog_posts collection is empty. Seeding default articles...");
      for (const blog of seedBlogs) {
        await setDoc(doc(db, COLLECTION_NAME, blog.id), blog);
      }
      return [...seedBlogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const list: BlogPost[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as BlogPost);
    });

    // Sort chronological: Newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to parse blogs from Firestore, returning defaults:", error);
    return [...seedBlogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function addBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'readTime'>): Promise<BlogPost> {
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

  // 3. Persist to Firestore
  try {
    await setDoc(doc(db, COLLECTION_NAME, newPost.id), newPost);
  } catch (error) {
    console.error("Failed to save new blog to Firestore:", error);
    throw error;
  }

  return newPost;
}

export async function updateBlogPost(post: BlogPost): Promise<BlogPost> {
  // 1. Calculate reading time
  const wordCount = post.content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  const readTime = `${minutes} min read`;

  const updatedPost: BlogPost = {
    ...post,
    readTime
  };

  // 2. Persist update to Firestore
  try {
    await setDoc(doc(db, COLLECTION_NAME, updatedPost.id), updatedPost);
  } catch (error) {
    console.error("Failed to update blog post in Firestore:", error);
    throw error;
  }

  return updatedPost;
}

export async function deleteBlogPost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Failed to delete blog post from Firestore:", error);
    throw error;
  }
}
