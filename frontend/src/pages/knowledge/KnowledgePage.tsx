import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { knowledgeApi } from '../../lib/api';
import {
  BookOpen, Search, Clock, ChevronRight, Lightbulb,
  Zap, Shield, HelpCircle, ArrowRight, Loader2
} from 'lucide-react';
import { useInView, revealStyle } from '../../hooks/useInView';
import { SEO } from '@/components/SEO';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  readTime: number;
  views: number;
  createdAt: string;
}

const FEATURED_TOPICS = [
  { icon: Zap, title: 'Electrical Basics', description: 'Learn about wiring, safety, and standards', accent: 'text-amber-600 bg-amber-50' },
  { icon: Shield, title: 'Safety Standards', description: 'ISI marks, BIS certification guide', accent: 'text-green-600 bg-green-50' },
  { icon: HelpCircle, title: 'Buying Guides', description: 'How to choose the right products', accent: 'text-violet-600 bg-violet-50' },
  { icon: Lightbulb, title: 'Tips & Tricks', description: 'Expert advice for homeowners', accent: 'text-amber-600 bg-amber-50' },
];

const STATIC_ARTICLES: Article[] = [
  { id: 's1', title: 'How to Choose the Right Wire Size for Your Home', slug: 'wire-size-guide', summary: 'Understanding wire gauge, current capacity, and how to pick the right FRLS/FR wire for different circuits in a residential project.', category: 'Buying Guides', readTime: 6, views: 2400, createdAt: '2026-01-10' },
  { id: 's2', title: "MCB vs MCCB: What's the Difference?", slug: 'mcb-vs-mccb', summary: 'Miniature Circuit Breakers and Moulded Case Circuit Breakers explained — when to use which, and top brands to trust.', category: 'Electrical Basics', readTime: 4, views: 1800, createdAt: '2026-01-15' },
  { id: 's3', title: 'ISI Mark vs BIS Certification: What to Look For', slug: 'isi-bis-certification', summary: "A buyer's guide to understanding quality marks on electrical products in India — what's mandatory and what it means for you.", category: 'Safety Standards', readTime: 5, views: 3100, createdAt: '2026-01-20' },
  { id: 's4', title: 'Top 10 Electrical Brands in India Compared', slug: 'top-electrical-brands-india', summary: 'Havells, Polycab, Legrand, Schneider, Anchor — a no-nonsense comparison of the best electrical brands across wires, switches, and MCBs.', category: 'Buying Guides', readTime: 8, views: 5200, createdAt: '2026-01-25' },
  { id: 's5', title: "How to Read a Contractor's Material Slip", slug: 'reading-material-slip', summary: "Decode your contractor's electrical material list — understand specs, quantities, and spot overpricing before you pay.", category: 'Tips & Tricks', readTime: 5, views: 2900, createdAt: '2026-02-01' },
  { id: 's6', title: 'Polycab vs Finolex vs RR Kabel: Which Wire to Buy?', slug: 'polycab-finolex-rr-kabel-comparison', summary: "Detailed comparison of India's top 3 wire brands — quality, price range, availability, and warranty terms.", category: 'Buying Guides', readTime: 7, views: 4100, createdAt: '2026-02-05' },
  { id: 's7', title: 'Why Electrical Prices Vary So Much in India', slug: 'electrical-price-variation-india', summary: 'The same Havells switch can cost ₹120 at one shop and ₹280 at another. Here\'s the full breakdown of why that happens.', category: 'Tips & Tricks', readTime: 6, views: 3700, createdAt: '2026-02-10' },
  { id: 's8', title: 'LED Lighting Buying Guide 2026', slug: 'led-lighting-buying-guide', summary: 'Wattage, lumens, color temperature, and brand reliability — everything to know before buying LED panels or bulbs for your home or office.', category: 'Buying Guides', readTime: 7, views: 2600, createdAt: '2026-02-15' },
  { id: 's9', title: 'How Hub4Estate Works: Getting the Best Price', slug: 'how-hub4estate-works', summary: 'Step-by-step guide on submitting an inquiry, understanding dealer quotes, and making the right buying decision.', category: 'Tips & Tricks', readTime: 4, views: 6800, createdAt: '2026-02-20' },
];

const CATEGORY_ACCENT: Record<string, string> = {
  'Buying Guides': 'bg-violet-50 text-violet-700',
  'Electrical Basics': 'bg-amber-50 text-amber-800',
  'Safety Standards': 'bg-green-50 text-green-700',
  'Tips & Tricks': 'bg-amber-50 text-amber-700',
};

export function KnowledgePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { ref: heroRef, inView: heroIn } = useInView(0.05);
  const { ref: topicsRef, inView: topicsIn } = useInView(0.05);
  const { ref: articlesRef, inView: articlesIn } = useInView(0.05);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const params: any = { page: 1, limit: 20 };
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        const response = await knowledgeApi.getArticles(params);
        const fetched = response.data.articles || [];
        setArticles(fetched.length > 0 ? fetched : STATIC_ARTICLES);
      } catch {
        setArticles(STATIC_ARTICLES);
      } finally {
        setIsLoading(false);
      }
    };
    const debounce = setTimeout(fetchArticles, searchQuery ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Knowledge Hub - Electrical Product Guides & Buying Tips"
        description="Expert guides on electrical products. Learn about wire sizing, MCBs vs MCCBs, BIS certification, brand comparisons, and money-saving tips for electrical procurement."
        keywords="electrical product guide, wire sizing guide, MCB buying guide, electrical knowledge, Hub4Estate guides"
        canonicalUrl="/knowledge"
      />

      {/* Hero — dark */}
      <div className="bg-[#09090B] blueprint-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-amber-600/8 rounded-full blur-3xl animate-glow-pulse" />
        </div>
        <div ref={heroRef as any} className="max-w-4xl mx-auto px-6 py-20 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 text-[11px] font-semibold rounded-full mb-6" style={revealStyle(heroIn, 0)}>
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight" style={revealStyle(heroIn, 0.06)}>
            Buy smarter with<br />
            <span className="text-amber-500">expert guides</span>
          </h1>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto" style={revealStyle(heroIn, 0.1)}>
            Expert guides on wires, switches, MCBs, lighting, and more — written so you know exactly what to buy and what to pay.
          </p>
          <div className="relative max-w-xl mx-auto" style={revealStyle(heroIn, 0.14)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:border-white/20 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Featured Topics */}
      <div ref={topicsRef as any} className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURED_TOPICS.map((topic, index) => {
              const Icon = topic.icon;
              const isSelected = selectedCategory === topic.title;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(isSelected ? null : topic.title)}
                  className={`bg-white rounded-2xl border p-5 text-left transition-all hover:shadow-md ${
                    isSelected ? 'border-gray-900 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={revealStyle(topicsIn, index * 0.05)}
                >
                  <div className={`w-10 h-10 ${topic.accent} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5">{topic.title}</h3>
                  <p className="text-xs text-gray-500">{topic.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Articles */}
      <div ref={articlesRef as any} className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6" style={revealStyle(articlesIn, 0)}>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {selectedCategory ? selectedCategory : 'All Articles'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Expert guides to help you make the right choice</p>
          </div>
          {selectedCategory && (
            <button onClick={() => setSelectedCategory(null)} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Clear filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-900 mb-1">No articles found</p>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try a different search term' : 'No articles available in this category yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article, i) => (
              <Link
                key={article.id}
                to={article.id.startsWith('s') ? '/knowledge' : `/knowledge/${article.slug}`}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all overflow-hidden"
                style={revealStyle(articlesIn, 0.06 + (i % 3) * 0.04)}
              >
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-100">
                  <BookOpen className="w-10 h-10 text-gray-200" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${CATEGORY_ACCENT[article.category] || 'bg-gray-100 text-gray-600'}`}>
                      {article.category}
                    </span>
                    <span className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />{article.readTime} min
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{article.summary}</p>
                  <div className="flex items-center text-xs font-bold text-gray-900">
                    <span>Read Article</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA — dark */}
      <div className="bg-[#09090B] px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-5">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Still have questions?</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Join our community to ask questions and get advice from experienced homeowners and professionals.
                Or just post a requirement and let dealers do the work.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/community" className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Visit Community <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/rfq/create" className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-colors">
                  Get Quote Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Expert Buying Guides', desc: 'Written for real buyers, not technical manuals.' },
                { title: 'Community Q&A', desc: 'Ask experienced homeowners and professionals.' },
                { title: 'Brand Comparisons', desc: 'Polycab vs Finolex vs Havells — unbiased.' },
                { title: 'Price Transparency', desc: 'Know what fair market price looks like before you buy.' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
