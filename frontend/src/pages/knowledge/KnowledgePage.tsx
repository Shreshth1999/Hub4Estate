import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { knowledgeApi } from '../../lib/api';
import {
  BookOpen, Search, Clock, ChevronRight, Lightbulb,
  Zap, Shield, HelpCircle, ArrowRight, TrendingUp, Loader2
} from 'lucide-react';

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
  { icon: Zap, title: 'Electrical Basics', description: 'Learn about wiring, safety, and standards' },
  { icon: Shield, title: 'Safety Standards', description: 'ISI marks, BIS certification guide' },
  { icon: HelpCircle, title: 'Buying Guides', description: 'How to choose the right products' },
  { icon: Lightbulb, title: 'Tips & Tricks', description: 'Expert advice for homeowners' },
];

export function KnowledgePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const params: any = { page: 1, limit: 20 };
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        const response = await knowledgeApi.getArticles(params);
        setArticles(response.data.articles || []);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    const debounce = setTimeout(fetchArticles, searchQuery ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Knowledge Hub
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
              Buy smarter with expert guides
            </h1>
            <p className="text-gray-500 mb-8">
              Expert guides on wires, switches, MCBs, lighting, and more.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Topics */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURED_TOPICS.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(selectedCategory === topic.title ? null : topic.title)}
                  className={`bg-white rounded-xl border p-4 text-left transition-all ${
                    selectedCategory === topic.title
                      ? 'border-gray-900 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-gray-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{topic.title}</h3>
                  <p className="text-xs text-gray-500">{topic.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategory ? `Articles: ${selectedCategory}` : 'All Articles'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Expert guides to help you make the right choice</p>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">No articles found</p>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try a different search term' : 'No articles available in this category yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/knowledge/${article.slug}`}
                className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden"
              >
                <div className="aspect-video bg-gray-50 flex items-center justify-center border-b border-gray-100">
                  <BookOpen className="w-10 h-10 text-gray-300" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      {article.category}
                    </span>
                    <span className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime} min
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-gray-700">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                    {article.summary}
                  </p>
                  <div className="flex items-center text-xs font-medium text-gray-900">
                    <span>Read Article</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-gray-900 rounded-2xl p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Still have questions?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Join our community to ask questions and get advice from experienced homeowners and professionals.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/community"
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Visit Community
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/rfq/create"
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Get Quote Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-5 text-center">
                  <div className="text-3xl font-semibold text-white mb-1">50+</div>
                  <div className="text-xs text-gray-400">Expert Guides</div>
                </div>
                <div className="bg-white/10 rounded-xl p-5 text-center">
                  <div className="text-3xl font-semibold text-white mb-1">5K+</div>
                  <div className="text-xs text-gray-400">Community Members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
