import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Clock,
  ChevronRight,
  Share2,
  Link as LinkIcon,
  Check,
  ArrowRight,
  BookOpen,
  User,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BLOG_POSTS } from '@/data/blog-posts';
import type { BlogPost } from '@/data/blog-posts';

const CATEGORY_LABELS: Record<string, string> = {
  'government-schemes': 'Government Schemes',
  'buying-guides': 'Buying Guides',
  'brand-comparisons': 'Brand Comparisons',
  'industry-guides': 'Industry Guides',
  'price-guides': 'Price Guides',
  'electrical-safety': 'Electrical Safety',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'government-schemes': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'buying-guides': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'brand-comparisons': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'industry-guides': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'price-guides': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'electrical-safety': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

interface TocItem {
  id: string;
  text: string;
  level: 'h2' | 'h3';
}

function extractToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<(h2|h3)\s+id="([^"]+)"[^>]*>(.*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    items.push({
      level: match[1].toLowerCase() as 'h2' | 'h3',
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ''),
    });
  }
  return items;
}

function getRelatedPosts(currentPost: BlogPost): BlogPost[] {
  const sameCategoryPosts = BLOG_POSTS.filter(
    (p) => p.category === currentPost.category && p.slug !== currentPost.slug
  );

  if (sameCategoryPosts.length >= 3) {
    return sameCategoryPosts.slice(0, 3);
  }

  const otherPosts = BLOG_POSTS.filter(
    (p) => p.slug !== currentPost.slug && p.category !== currentPost.category
  );

  return [...sameCategoryPosts, ...otherPosts].slice(0, 3);
}

function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Share</span>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
        title="Share on WhatsApp"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        title="Share on LinkedIn"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        title="Share on X (Twitter)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
          copied
            ? 'bg-green-50 text-green-600'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
        title={copied ? 'Link copied!' : 'Copy link'}
      >
        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
      </button>
    </div>
  );
}

function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string }) {
  if (items.length === 0) return null;

  return (
    <nav className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
        Table of Contents
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm transition-colors py-1 ${
                item.level === 'h3' ? 'pl-4' : ''
              } ${
                activeId === item.id
                  ? 'text-amber-700 font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Article Not Found" noindex />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-24 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-gray-900 mb-3">Article Not Found</h1>
        <p className="text-gray-500 mb-8">
          The blog post you are looking for does not exist or may have been moved.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeHeadingId, setActiveHeadingId] = useState('');

  const post = useMemo(
    () => BLOG_POSTS.find((p) => p.slug === slug) || null,
    [slug]
  );

  const tocItems = useMemo(() => (post ? extractToc(post.content) : []), [post]);
  const relatedPosts = useMemo(() => (post ? getRelatedPosts(post) : []), [post]);

  // Track active heading for ToC highlight
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
    );

    for (const item of tocItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [tocItems]);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <NotFoundState />;
  }

  const fullUrl = `https://hub4estate.com/blog/${post.slug}`;
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
  const catStyle = CATEGORY_COLORS[post.category] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  };

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: post.image,
      datePublished: post.dateISO,
      dateModified: post.modifiedDateISO,
      author: {
        '@type': 'Organization',
        name: 'Hub4Estate',
        url: 'https://hub4estate.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Hub4Estate',
        url: 'https://hub4estate.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://hub4estate.com/logos/hub4estate/logo-full.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl,
      },
      keywords: post.keywords.join(', '),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://hub4estate.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://hub4estate.com/blog',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: categoryLabel,
          item: `https://hub4estate.com/blog?category=${post.category}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: post.title,
          item: fullUrl,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        canonicalUrl={`/blog/${post.slug}`}
        title={post.title}
        description={post.excerpt}
        keywords={post.keywords.join(', ')}
        ogType="article"
        ogImage={post.image}
        jsonLd={jsonLd}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 overflow-x-auto">
            <Link to="/" className="hover:text-gray-700 transition-colors flex-shrink-0">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link to="/blog" className="hover:text-gray-700 transition-colors flex-shrink-0">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link
              to={`/blog?category=${post.category}`}
              className="hover:text-gray-700 transition-colors flex-shrink-0"
            >
              {categoryLabel}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-gray-600 font-medium truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="mb-5">
            <span
              className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            >
              {categoryLabel}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-black text-gray-900 tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm leading-tight">{post.author}</p>
                <p className="text-xs text-gray-400">{post.authorRole}</p>
              </div>
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{post.date}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <ShareButtons title={post.title} url={fullUrl} />
        </div>
      </header>

      {/* Article Body + ToC Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Article */}
          <article className="flex-1 max-w-4xl">
            <div
              className="
                prose prose-gray max-w-none
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
                prose-li:text-gray-600 prose-li:leading-relaxed
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-a:text-amber-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-ul:my-4 prose-ol:my-4
                prose-li:my-1
              "
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            {/* Share Again (bottom of article) */}
            <div className="border-t border-gray-200 pt-8 mt-12">
              <ShareButtons title={post.title} url={fullUrl} />
            </div>
          </article>

          {/* ToC Sidebar (desktop) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <TableOfContents items={tocItems} activeId={activeHeadingId} />
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black text-white mb-2">
              Need electrical products at the best price?
            </h2>
            <p className="text-amber-100 text-sm leading-relaxed">
              Get quotes from verified dealers on Hub4Estate. Compare prices side by side
              and save up to 40% on wires, switches, MCBs, LEDs, fans, and more.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors flex-shrink-0"
          >
            Get Quotes Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => {
                const rpStyle = CATEGORY_COLORS[rp.category] || {
                  bg: 'bg-gray-50',
                  text: 'text-gray-700',
                  border: 'border-gray-200',
                };
                return (
                  <Link
                    key={rp.slug}
                    to={`/blog/${rp.slug}`}
                    className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/30 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-gray-100 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-amber-300" />
                      </div>
                      <span
                        className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${rpStyle.bg} ${rpStyle.text} ${rpStyle.border}`}
                      >
                        {CATEGORY_LABELS[rp.category] || rp.category}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                        <span>{rp.date}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rp.readTime}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">
                        {rp.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
                        {rp.excerpt}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition-colors mt-3">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
        </div>
      </section>
    </div>
  );
}
