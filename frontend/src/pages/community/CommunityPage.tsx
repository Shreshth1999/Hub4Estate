import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { communityApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import {
  MessageSquare, ThumbsUp, MessageCircle, Plus, Search,
  Clock, User, MapPin, ArrowRight, Users, Store, Shield,
  HelpCircle, FileText, Briefcase, CheckCircle, X, Loader2
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  postType: string;
  city: string | null;
  category: string | null;
  upvotes: number;
  createdAt: string;
  user: {
    name: string;
    type: 'user' | 'dealer' | 'admin';
  };
  _count: { comments: number };
}

const POPULAR_PRODUCTS = [
  { id: '1', name: 'House Wire 1.5mm', brand: 'Polycab' },
  { id: '2', name: 'FRLS Cable 2.5mm', brand: 'Havells' },
  { id: '3', name: 'MCB 16A SP', brand: 'Schneider' },
  { id: '4', name: 'Modular Switch', brand: 'Legrand' },
  { id: '5', name: 'LED Panel 12W', brand: 'Philips' },
  { id: '6', name: 'Ceiling Fan', brand: 'Crompton' },
  { id: '7', name: 'Distribution Box', brand: 'Havells' },
  { id: '8', name: 'ELCB 32A', brand: 'ABB' },
];

const CATEGORIES = ['All', 'Electrical', 'Plumbing', 'Interior', 'Construction', 'General'];

const POST_TYPES = [
  { value: 'QUESTION', label: 'Question', icon: HelpCircle, description: 'Ask the community for help' },
  { value: 'DISCUSSION', label: 'Discussion', icon: MessageSquare, description: 'Start a conversation' },
  { value: 'ARTICLE', label: 'Article', icon: FileText, description: 'Share knowledge or guide' },
  { value: 'CASE_STUDY', label: 'Case Study', icon: Briefcase, description: 'Share a project experience' },
];

const POST_TYPE_CONFIG: Record<string, { bg: string; color: string; icon: any }> = {
  QUESTION:   { bg: 'bg-amber-50',  color: 'text-amber-700',  icon: HelpCircle },
  ARTICLE:    { bg: 'bg-green-50',  color: 'text-green-700',  icon: FileText },
  CASE_STUDY: { bg: 'bg-purple-50', color: 'text-purple-700', icon: Briefcase },
  DISCUSSION: { bg: 'bg-blue-50',   color: 'text-blue-700',   icon: MessageSquare },
};

export function CommunityPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    city: '',
    category: 'General',
    postType: 'QUESTION',
    taggedProducts: [] as string[],
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params: any = { page: 1, limit: 20 };
        if (selectedCategory !== 'All') params.category = selectedCategory;
        const response = await communityApi.getPosts(params);
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [selectedCategory]);

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setIsCreating(true);
    try {
      await communityApi.createPost(newPost);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', city: '', category: 'General', postType: 'QUESTION', taggedProducts: [] });
      const response = await communityApi.getPosts({ page: 1, limit: 20 });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpvote = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      await communityApi.upvotePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
                <Users className="w-3.5 h-3.5" />
                Community
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
                Community Hub.<br />
                <span className="text-orange-500">Learn & Share.</span>
              </h1>
              <p className="text-gray-500 mb-6">
                Connect with homeowners and professionals. Share experiences, ask questions, and get advice.
              </p>
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="text-2xl font-semibold text-gray-900 mb-1">5K+</div>
                <div className="text-xs text-gray-500">Members</div>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="text-2xl font-semibold text-gray-900 mb-1">{posts.length}</div>
                <div className="text-xs text-gray-500">Discussions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Feed */}
          <div className="flex-1">
            {/* Category tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 border-b border-gray-200">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    selectedCategory === cat
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No discussions yet</p>
                <p className="text-sm text-gray-500 mb-4">Be the first to start a conversation!</p>
                {isAuthenticated ? (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Start Discussion
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Sign in to Post
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => {
                  const typeConfig = POST_TYPE_CONFIG[post.postType] || POST_TYPE_CONFIG.DISCUSSION;
                  const TypeIcon = typeConfig.icon;
                  return (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/community/${post.id}`)}
                      className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all p-5 cursor-pointer"
                    >
                      <div className="flex gap-4">
                        {/* Upvote */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={(e) => handleUpvote(e, post.id)}
                            className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                            disabled={!isAuthenticated}
                          >
                            <ThumbsUp className="w-4 h-4 text-gray-500" />
                          </button>
                          <span className="text-sm font-semibold text-gray-900">{post.upvotes}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                              <TypeIcon className="w-3 h-3" />
                              {post.postType === 'CASE_STUDY' ? 'Case Study' : post.postType.charAt(0) + post.postType.slice(1).toLowerCase()}
                            </span>
                            {post.category && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {post.category}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{post.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.content}</p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {post.user.name}
                              {post.user.type === 'dealer' && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                                  <Store className="w-2.5 h-2.5" />
                                  Dealer
                                </span>
                              )}
                            </span>
                            {post.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {post.city}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(post.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {post._count.comments} comments
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 space-y-4">
            {/* Create Post CTA */}
            <div className="bg-gray-900 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1.5">Have a Question?</h3>
              <p className="text-xs text-gray-400 mb-4">
                Share your experience or ask the community for advice.
              </p>
              {isAuthenticated ? (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Discussion
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center w-full px-3 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign in to Post
                </Link>
              )}
            </div>

            {/* Guidelines */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Community Guidelines</h3>
              <ul className="space-y-2.5 text-xs text-gray-600">
                {['Be respectful and helpful', 'Share genuine experiences', 'No promotional content'].map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Products */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Popular Products</h3>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_PRODUCTS.slice(0, 6).map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 rounded-lg transition-colors"
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
              <Link to="/categories" className="block mt-3 text-xs font-medium text-orange-600 hover:text-orange-700">
                Browse All Products →
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Links</h3>
              <div className="space-y-1">
                {[
                  { to: '/knowledge', label: 'Buying Guides' },
                  { to: '/rfq/create', label: 'Get Quote' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span>{label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-base font-semibold text-gray-900">Create a Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Post Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">What type of post?</label>
                <div className="grid grid-cols-2 gap-2">
                  {POST_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = newPost.postType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setNewPost(prev => ({ ...prev, postType: type.value }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`} />
                        <div className="text-xs font-semibold text-gray-900">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder={newPost.postType === 'QUESTION' ? "What's your question?" : "What do you want to share?"}
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Content</label>
                <textarea
                  rows={5}
                  placeholder="Share your thoughts..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">City (Optional)</label>
                  <input
                    type="text"
                    placeholder="Your city"
                    value={newPost.city}
                    onChange={(e) => setNewPost(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none bg-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tag Products */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tag Related Products (Optional)</label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_PRODUCTS.map((product) => {
                    const isSelected = newPost.taggedProducts.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setNewPost(prev => ({
                          ...prev,
                          taggedProducts: isSelected
                            ? prev.taggedProducts.filter(id => id !== product.id)
                            : [...prev.taggedProducts, product.id],
                        }))}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {product.name}{isSelected && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isCreating || !newPost.title.trim() || !newPost.content.trim()}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
