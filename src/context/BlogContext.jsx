import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BlogContext = createContext(null)

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshBlogs = async () => {
    setLoading(true)
    try {
      let { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'Published')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('published_at', { ascending: false })

      if (error && String(error.message || '').toLowerCase().includes('order_index')) {
        ;({ data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'Published')
          .order('published_at', { ascending: false }))
      }

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Failed to load blog posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const getBlogPostBySlug = async (slug) => {
    if (!slug) return null
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'Published')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    return data
  }

  const getRelatedBlogPosts = (current, limit = 3) => {
    if (!current) return []
    const related = posts.filter(post => post.id !== current.id)

    if (current.category) {
      const sameCategory = related.filter(post => post.category === current.category)
      if (sameCategory.length >= limit) return sameCategory.slice(0, limit)
    }

    if (current.tags?.length) {
      const sharedTags = related.filter(post =>
        post.tags?.some(tag => current.tags.includes(tag))
      )
      if (sharedTags.length >= limit) return sharedTags.slice(0, limit)
    }

    return related.slice(0, limit)
  }

  const categories = posts
    .map(post => post.category)
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)

  useEffect(() => {
    refreshBlogs()
  }, [])

  return (
    <BlogContext.Provider value={{ posts, categories, loading, refreshBlogs, getBlogPostBySlug, getRelatedBlogPosts }}>
      {children}
    </BlogContext.Provider>
  )
}

export function useBlog() {
  return useContext(BlogContext)
}
