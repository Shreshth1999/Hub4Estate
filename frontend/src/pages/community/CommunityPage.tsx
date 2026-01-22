import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { communityApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { EmptyState, ListSkeleton, Modal } from '../../components/ui';
import {
  MessageSquare, ThumbsUp, MessageCircle, Plus, Search,
  Clock, User, MapPin, ArrowRight, Users, Store, Shield,
  HelpCircle, FileText, Briefcase, CheckCircle
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
  _count: {
    comments: number;
  };
  // Product/Dealer connections
  relatedProducts?: Array<{ id: string; name: string; brand: string }>;
  taggedDealer?: { id: string; businessName: string };
}

// Popular products for tagging in posts
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

// Featured dealers for community
const FEATURED_DEALERS = [
  { id: '1', name: 'Krishna Electricals', city: 'Mumbai', rating: 4.8 },
  { id: '2', name: 'Sharma Electric Store', city: 'Delhi', rating: 4.7 },
  { id: '3', name: 'Modern Electricals', city: 'Pune', rating: 4.9 },
];

const CATEGORIES = [
  'All',
  'Electrical',
  'Plumbing',
  'Interior',
  'Construction',
  'General',
];

const POST_TYPES = [
  { value: 'QUESTION', label: 'Question', icon: HelpCircle, description: 'Ask the community for help' },
  { value: 'DISCUSSION', label: 'Discussion', icon: MessageSquare, description: 'Start a conversation' },
  { value: 'ARTICLE', label: 'Article', icon: FileText, description: 'Share knowledge or guide' },
  { value: 'CASE_STUDY', label: 'Case Study', icon: Briefcase, description: 'Share a project experience' },
];

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
    taggedProducts: [] as string[]
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params: any = { page: 1, limit: 20 };
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

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
    e.stopPropagation(); // Prevent navigation when clicking upvote
    if (!isAuthenticated) return;

    try {
      await communityApi.upvotePost(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
      ));
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/community/${postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getUserBadge = (userType: string) => {
    switch (userType) {
      case 'dealer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
            <Store className="w-3 h-3" />
            Dealer
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        );
      default:
        return null;
    }
  };

  const getPostTypeBadge = (postType: string) => {
    switch (postType) {
      case 'QUESTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold">
            <HelpCircle className="w-3 h-3" />
            Question
          </span>
        );
      case 'ARTICLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold">
            <FileText className="w-3 h-3" />
            Article
          </span>
        );
      case 'CASE_STUDY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold">
            <Briefcase className="w-3 h-3" />
            Case Study
          </span>
        );
      default:
        return null;
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
                <Users className="w-4 h-4" />
                Community
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Community Hub.<br />
                <span className="text-accent-400">Learn & Share.</span>
              </h1>
              <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
                Connect with homeowners and professionals. Share experiences, ask questions, and get advice on electrical products.
              </p>

              {/* Search */}
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-search w-full pl-12 bg-white text-neutral-900"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">5K+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">{posts.length}</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Discussions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Feed */}
            <div className="flex-1">
              {/* Category Filters */}
              <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Posts */}
              {isLoading ? (
                <ListSkeleton count={5} />
              ) : filteredPosts.length === 0 ? (
                <div className="bg-neutral-50 border-2 border-neutral-200 p-12">
                  <EmptyState
                    icon={MessageSquare}
                    title="No discussions yet"
                    description="Be the first to start a conversation!"
                    action={
                      isAuthenticated ? (
                        <button onClick={() => setShowCreateModal(true)} className="btn-urgent">
                          <Plus className="w-5 h-5 mr-2" />
                          Start a Discussion
                        </button>
                      ) : (
                        <Link to="/login" className="btn-primary">
                          Sign in to Post
                        </Link>
                      )
                    }
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post, index) => (
                    <div
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all p-6 cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex gap-4">
                        {/* Upvote */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => handleUpvote(e, post.id)}
                            className="w-12 h-12 bg-neutral-100 hover:bg-neutral-900 hover:text-white flex items-center justify-center transition-colors"
                            disabled={!isAuthenticated}
                          >
                            <ThumbsUp className="w-5 h-5" />
                          </button>
                          <span className="text-lg font-black text-neutral-900 mt-2">{post.upvotes}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Post Type & Category Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {getPostTypeBadge(post.postType)}
                            {post.category && (
                              <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-bold uppercase">
                                {post.category}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-neutral-900 mb-2 hover:text-accent-600">
                            {post.title}
                          </h3>
                          <p className="text-neutral-600 text-sm line-clamp-2 mb-4">
                            {post.content}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 font-medium">
                            <span className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {post.user.name}
                              {getUserBadge(post.user.type)}
                            </span>
                            {post.city && (
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {post.city}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(post.createdAt)}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post._count.comments} comments
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 space-y-6">
              {/* Create Post CTA */}
              <div className="bg-neutral-900 border-2 border-neutral-900 shadow-brutal p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Have a Question?</h3>
                <p className="text-sm text-neutral-300 mb-4">
                  Share your experience or ask the community for advice.
                </p>
                {isAuthenticated ? (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-accent w-full justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Discussion
                  </button>
                ) : (
                  <Link to="/login" className="btn-secondary w-full justify-center bg-white">
                    Sign in to Post
                  </Link>
                )}
              </div>

              {/* Community Guidelines */}
              <div className="bg-white border-2 border-neutral-200 p-6">
                <h3 className="font-bold text-neutral-900 mb-4 uppercase tracking-wider text-sm">Community Guidelines</h3>
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <span>Be respectful and helpful</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <span>Share genuine experiences</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <span>No promotional content</span>
                  </li>
                </ul>
              </div>

              {/* Featured Dealers */}
              <div className="bg-white border-2 border-neutral-200 p-6">
                <h3 className="font-bold text-neutral-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Top Dealers
                </h3>
                <div className="space-y-3">
                  {FEATURED_DEALERS.map((dealer) => (
                    <Link
                      key={dealer.id}
                      to={`/dealers/${dealer.id}`}
                      className="block p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="font-bold text-neutral-900 text-sm">{dealer.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {dealer.city}
                        </span>
                        <span className="text-xs font-bold text-amber-600">★ {dealer.rating}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/categories" className="block mt-4 text-sm font-bold text-accent-600 hover:text-accent-700">
                  View All Dealers →
                </Link>
              </div>

              {/* Popular Products */}
              <div className="bg-white border-2 border-neutral-200 p-6">
                <h3 className="font-bold text-neutral-900 mb-4 uppercase tracking-wider text-sm">Popular Products</h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_PRODUCTS.slice(0, 6).map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 transition-colors"
                    >
                      {product.name}
                    </Link>
                  ))}
                </div>
                <Link to="/categories" className="block mt-4 text-sm font-bold text-accent-600 hover:text-accent-700">
                  Browse All Products →
                </Link>
              </div>

              {/* Quick Links */}
              <div className="bg-neutral-50 border-2 border-neutral-200 p-6">
                <h3 className="font-bold text-neutral-900 mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
                <div className="space-y-2">
                  <Link to="/knowledge" className="flex items-center justify-between py-2 text-neutral-700 hover:text-accent-600 font-medium">
                    <span>Buying Guides</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/rfq/create" className="flex items-center justify-between py-2 text-neutral-700 hover:text-accent-600 font-medium">
                    <span>Get Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create a Post"
        size="lg"
      >
        <div className="space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="label">What type of post?</label>
            <div className="grid grid-cols-2 gap-3">
              {POST_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = newPost.postType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setNewPost(prev => ({ ...prev, postType: type.value }))}
                    className={`p-4 border-2 text-left transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-neutral-900' : 'text-neutral-400'}`} />
                    <div className="font-bold text-neutral-900">{type.label}</div>
                    <div className="text-xs text-neutral-500">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Title</label>
            <input
              type="text"
              placeholder={
                newPost.postType === 'QUESTION'
                  ? "What's your question?"
                  : newPost.postType === 'ARTICLE'
                  ? "Article title..."
                  : "What do you want to share?"
              }
              value={newPost.title}
              onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              className="input-primary"
            />
          </div>

          <div>
            <label className="label">Content</label>
            <textarea
              rows={6}
              placeholder={
                newPost.postType === 'QUESTION'
                  ? "Describe your question in detail..."
                  : newPost.postType === 'ARTICLE'
                  ? "Write your article content..."
                  : newPost.postType === 'CASE_STUDY'
                  ? "Share details about your project..."
                  : "Share your thoughts..."
              }
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              className="input-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City (Optional)</label>
              <input
                type="text"
                placeholder="Your city"
                value={newPost.city}
                onChange={(e) => setNewPost(prev => ({ ...prev, city: e.target.value }))}
                className="input-primary"
              />
            </div>

            <div>
              <label className="label">Category</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                className="input-primary"
              >
                {CATEGORIES.filter(c => c !== 'All').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag Products */}
          <div>
            <label className="label">Tag Related Products (Optional)</label>
            <p className="text-xs text-neutral-500 mb-2">Help others find relevant products</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PRODUCTS.map((product) => {
                const isSelected = newPost.taggedProducts.includes(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setNewPost(prev => ({
                        ...prev,
                        taggedProducts: isSelected
                          ? prev.taggedProducts.filter(id => id !== product.id)
                          : [...prev.taggedProducts, product.id]
                      }));
                    }}
                    className={`px-3 py-1.5 text-xs font-medium border-2 transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                    }`}
                  >
                    {product.name}
                    {isSelected && ' ✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t-2 border-neutral-200">
            <button
              className="btn-secondary flex-1 justify-center"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-urgent flex-1 justify-center"
              onClick={handleCreatePost}
              disabled={isCreating || !newPost.title.trim() || !newPost.content.trim()}
            >
              {isCreating ? 'Posting...' : 'Publish Post'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
