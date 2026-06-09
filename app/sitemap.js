import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap() {
    const baseUrl = 'https://truepower.co.ke'
    const pageSize = 20

    // 👉 Fetch all data in parallel (same as yours, just fixed)
    const [productsRes, blogsRes] = await Promise.all([
        supabase.from('products').select('id'),
        supabase.from('blog_posts').select('slug').eq('status', 'Published'),
    ])

    const products = productsRes.data || []
    const blogs = blogsRes.data || []

    // 👉 Calculate pages
    const productPages = Math.ceil(products.length / pageSize)
    const blogPages = Math.ceil(blogs.length / pageSize)

    // 👉 Static pages (unchanged)
    const staticRoutes = [
        { url: baseUrl, lastModified: new Date(), priority: 1, changeFrequency: 'daily', },
        { url: `${baseUrl}/shop`, lastModified: new Date(), priority: 0.9, changeFrequency: 'daily' },
        { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.9, changeFrequency: 'daily' },
        { url: `${baseUrl}/portfolio`, lastModified: new Date(), priority: 0.9, changeFrequency: 'daily' },
        { url: `${baseUrl}/services`, lastModified: new Date(), priority: 0.9, changeFrequency: 'daily' },
        { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.9, changeFrequency: 'daily' },
    ]

    // 👉 Product detail URLs (unchanged)
    const productRoutes = products.map((item) => ({
        url: `${baseUrl}/product/${item.id}`,
        lastModified: new Date(),
        priority: 0.8,
    }))

    // 👉 Blog detail URLs (unchanged)
    const blogRoutes = blogs.map((item) => ({
        url: `${baseUrl}/blog/${item.slug}`,
        lastModified: new Date(),
        priority: 0.8,
    }))


    return [
        ...staticRoutes,
        ...productRoutes,
        ...blogRoutes,
    ]
}