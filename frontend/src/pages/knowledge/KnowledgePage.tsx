import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { knowledgeApi } from '../../lib/api';
import { EmptyState, CardSkeleton } from '../../components/ui';
import {
  BookOpen, Search, Clock, ChevronRight, Lightbulb,
  Zap, Shield, HelpCircle, ArrowRight, TrendingUp
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
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }

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
      {/* Info Banner */}
      <div className="bg-accent-500 text-white py-3">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Expert guides for electrical products</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Make informed decisions • Buy with confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
              <BookOpen className="w-4 h-4" />
              Knowledge Hub
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              Knowledge Hub.
              <br />
              <span className="text-accent-400">Buy Smarter.</span>
            </h1>
            <p className="text-xl text-neutral-300 mb-8 font-medium">
              Expert guides on wires, switches, MCBs, lighting, and more.
              <span className="text-white font-bold"> Learn what matters before you buy.</span>
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-search w-full pl-12 bg-white text-neutral-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Topics */}
      <section className="py-12 bg-neutral-50 border-b-2 border-neutral-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURED_TOPICS.map((topic, index) => {
              const Icon = topic.icon;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(selectedCategory === topic.title ? null : topic.title)}
                  className={`bg-white border-2 p-6 text-left hover:shadow-brutal transition-all ${
                    selectedCategory === topic.title
                      ? 'border-neutral-900 shadow-brutal'
                      : 'border-neutral-200 hover:border-neutral-900'
                  }`}
                >
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-1">{topic.title}</h3>
                  <p className="text-sm text-neutral-500 font-medium">{topic.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-neutral-900">
                {selectedCategory ? `Articles: ${selectedCategory}` : 'All Articles'}
              </h2>
              <p className="text-neutral-500 font-medium mt-1">Expert guides to help you make the right choice</p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-neutral-900 font-bold uppercase tracking-wider hover:text-accent-600"
              >
                Clear filter
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-neutral-50 border-2 border-neutral-200 p-12">
              <EmptyState
                icon={BookOpen}
                title="No articles found"
                description={searchQuery
                  ? 'Try a different search term'
                  : 'No articles available in this category yet'
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/knowledge/${article.slug}`}
                  className="group bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-neutral-100 flex items-center justify-center border-b-2 border-neutral-200">
                    <BookOpen className="w-12 h-12 text-neutral-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="px-3 py-1 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span className="flex items-center text-xs text-neutral-500 font-bold">
                        <Clock className="w-3 h-3 mr-1" />
                        {article.readTime} min
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-accent-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-sm text-neutral-500 line-clamp-2 mb-4 font-medium">
                      {article.summary}
                    </p>

                    <div className="flex items-center text-neutral-900 font-bold text-sm uppercase tracking-wider group-hover:text-accent-600">
                      <span>Read Article</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-neutral-900 border-4 border-neutral-900 shadow-brutal-lg p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
                  <HelpCircle className="w-4 h-4" />
                  Need Help?
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                  Still Have Questions?
                </h2>
                <p className="text-neutral-300 mb-8 font-medium">
                  Join our community to ask questions and get advice from experienced homeowners and professionals.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/community" className="btn-accent">
                    Visit Community
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link to="/rfq/create" className="btn-urgent">
                    Get Quote Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
                  <div className="text-4xl font-black text-accent-400 mb-2">50+</div>
                  <div className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Expert Guides</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
                  <div className="text-4xl font-black text-accent-400 mb-2">5K+</div>
                  <div className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Community Members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
