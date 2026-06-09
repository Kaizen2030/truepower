

import { supabase } from '@/lib/supabase.js'



export async function getPublishedBlogs({
    category = null,
    page = 1,
    pageSize = 20,
    searchParams = "",
    excludeId = null,
} = {}) {

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from("blog_posts")
        .select("*", { count: "exact" })
        .eq("status", "Published");

    if (excludeId) {
        query = query.not("id", "eq", excludeId);
    }

    // Apply filters
    if (category) {
        query = query.eq("category", category);
    }

    if (searchParams) {
        query = query.ilike("title", `%${searchParams}%`);
    }

    // Execute the query with ordering and pagination
    let { data, error, count } = await query
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('published_at', { ascending: false })
        .range(from, to);

    // Fallback if order_index fails
    if (error || !data) {
        // Rebuild query with filters for fallback
        let fallbackQuery = supabase
            .from("blog_posts")
            .select("*", { count: "exact" })
            .eq("status", "Published");

        if (category) fallbackQuery = fallbackQuery.eq("category", category);
        if (searchParams) fallbackQuery = fallbackQuery.ilike("title", `%${searchParams}%`);

        const fallbackResult = await fallbackQuery
            .order("published_at", { ascending: false })
            .range(from, to);

        data = fallbackResult.data;
        error = fallbackResult.error;
        count = fallbackResult.count;
    }

    if (error) throw error;

    return {
        posts: data || [],
        pagination: {
            totalItems: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize),
            currentPage: page,
            pageSize,
        },
    };
}

export async function getRelatedPosts(current, limit = 3) {
    if (!current) return [];
    const blogs = await getPublishedBlogs({
        excludeId: current.id,
        pageSize: Math.max(limit * 4, 12),
    });
    const related = blogs.posts.filter((post) => post.id !== current.id);
    if (current.category) {
        const sameCategory = related.filter(
            (post) => post.category === current.category,
        );
        if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
    }

    if (current.tags?.length) {
        const sharedTags = related.filter((post) =>
            post.tags?.some((tag) => current.tags.includes(tag)),
        );
        if (sharedTags.length >= limit) return sharedTags.slice(0, limit);
    }

    return related.slice(0, limit);
}

export async function getBlogPostBySlug(slug) {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "Published")
        .eq("slug", slug)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function getBlogCategories() {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("category", { distinct: true })
        .eq("status", "Published")
        .not("category", "is", null);

    if (error) throw error;

    return data.map((item) => item.category);
}
