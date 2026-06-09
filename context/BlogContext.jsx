"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { hasSupabaseConfig } from "@/lib/supabase";
import { getPublishedBlogs } from "@/lib/blogs.js";

const BlogContext = createContext(null);

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshBlogs = async () => {
    setLoading(true);
    try {
      if (!hasSupabaseConfig()) {
        setPosts([]);
        return;
      }
      const data = await getPublishedBlogs();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to load blogs:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getRelatedBlogPosts = (current, limit = 3) => {
    if (!current) return [];

    const related = posts.filter((p) => p.id !== current.id);

    if (current.category) {
      const sameCategory = related.filter(
        (p) => p.category === current.category,
      );
      if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
    }

    if (current.tags?.length) {
      const shared = related.filter((p) =>
        p.tags?.some((tag) => current.tags.includes(tag)),
      );
      if (shared.length >= limit) return shared.slice(0, limit);
    }

    return related.slice(0, limit);
  };

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];

  useEffect(() => {
    refreshBlogs();
  }, []);

  return (
    <BlogContext.Provider
      value={{
        posts,
        categories,
        loading,
        refreshBlogs,
        getRelatedBlogPosts,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  return useContext(BlogContext);
}
