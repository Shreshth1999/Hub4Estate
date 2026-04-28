import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, Clock, ChevronLeft, ChevronRight, BookOpen, TrendingUp, Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/data/blog-posts';
import type { BlogPost } from '@/data/blog-posts';

const POSTS_PER_PAGE = 12;

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'government-schemes': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'buying-guides': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'brand-comparisons': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'industry-guides': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'price-guides': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'electrical-safety': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

function getCategoryStyle(categoryId: string) {
  return CATEGORY_COLORS[categoryId] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
}

function getCategoryLabel(categoryId: string): string {
  const cat = BLOG_CATEGORIES.find((c) => c.id === categoryId);
  return cat ? cat.label : categoryId;
}

function BlogCard({ post }: { post: BlogPost }) {
  const style = getCategoryStyle(post.category);

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/30 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-gray-100 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-amber-300" />
        </div>
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}
        >
          {getCategoryLabel(post.category)}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>

        <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition-colors">
          Read More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function Sidebar({
  categoryCounts,
  popularPosts,
}: {
  categoryCounts: Record<string, number>;
  popularPosts: BlogPost[];
}) {
  return (
    <aside className="space-y-8">
      {/* Popular Articles */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Popular Articles</h3>
        </div>
        <div className="space-y-4">
          {popularPosts.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex gap-3 items-start"
            >
              <span className="text-lg font-black text-gray-200 group-hover:text-amber-400 transition-colors leading-none mt-0.5 w-6 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                {post.title}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories with Counts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Categories</h3>
        <div className="space-y-2">
          {BLOG_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const style = getCategoryStyle(cat.id);
            return (
              <Link
                key={cat.id}
                to={`/blog?category=${cat.id}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {cat.label}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center mb-4">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-2">
          Get pricing tips & industry updates
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          Join 1,000+ buyers and dealers who get our weekly newsletter on electrical product pricing, new product launches, and money-saving tips.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-2"
        >
          <input
            type="email"
            placeholder="Your email address"
            className="w-full px-4 py-2.5 border border-amber-200 rounded-lg bg-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Subscribe
          </button>
        </form>
        <p className="text-[11px] text-gray-400 mt-2">No spam. Unsubscribe anytime.</p>
      </div>
    </aside>
  );
}

export function BlogIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of BLOG_POSTS) {
      counts[post.category] = (counts[post.category] || 0) + 1;
    }
    return counts;
  }, []);

  const filteredPosts = useMemo(() => {
    let posts = BLOG_POSTS;

    if (activeCategory !== 'all') {
      posts = posts.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    return posts;
  }, [activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageParam), totalPages);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const popularPosts = useMemo(() => BLOG_POSTS.slice(0, 5), []);

  function setCategory(id: string) {
    const params = new URLSearchParams(searchParams);
    if (id === 'all') {
      params.delete('category');
    } else {
      params.set('category', id);
    }
    params.delete('page');
    setSearchParams(params);
  }

  function setPage(page: number) {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Hub4Estate Blog',
    description:
      'Expert guides on electrical products, government schemes, industry insights, and money-saving tips for buying electrical products in India.',
    url: 'https://hub4estate.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Hub4Estate',
      url: 'https://hub4estate.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hub4estate.com/logos/hub4estate/logo-full.png',
      },
    },
    blogPost: BLOG_POSTS.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://hub4estate.com/blog/${post.slug}`,
      datePublished: post.dateISO,
      dateModified: post.modifiedDateISO,
      author: {
        '@type': 'Organization',
        name: 'Hub4Estate',
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        canonicalUrl="/blog"
        title="Blog - Electrical Products Guides, Government Schemes & Industry News"
        description="Expert guides on electrical products, government schemes like PM Surya Ghar and UJALA, brand comparisons (Havells vs Polycab), buying guides, price trends, and electrical safety tips. Save money on wires, switches, MCBs, LEDs, and fans."
        keywords="electrical products blog, buying guide electrical India, Havells vs Polycab, MCB guide, LED lighting guide, PM Surya Ghar, UJALA scheme, electrical safety tips, wire cable price India, modular switches guide, BLDC fan guide, smart home India, dealer margin electrical, Hub4Estate blog"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full mb-6">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                Hub4Estate Blog
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 leading-tight">
              Hub4Estate Blog
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              Expert guides on electrical products, government schemes, industry insights,
              and money-saving tips
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 flex-1 scrollbar-hide">
              {BLOG_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative flex-shrink-0 w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Grid */}
          <div className="flex-1">
            {paginatedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedPosts.map((post) => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-10 h-10 text-sm font-semibold rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No articles found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Try adjusting your search or category filter
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategory('all');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  View all articles
                </button>
              </div>
            )}
          </div>

          {/* Sidebar (desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Sidebar categoryCounts={categoryCounts} popularPosts={popularPosts} />
          </div>
        </div>
      </section>

      {/* Mobile Sidebar (below grid) */}
      <section className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <Sidebar categoryCounts={categoryCounts} popularPosts={popularPosts} />
      </section>
    </div>
  );
}
