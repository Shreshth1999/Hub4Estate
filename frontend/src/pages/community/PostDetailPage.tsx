import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { communityApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import {
  ThumbsUp, MessageCircle, Clock, User, MapPin, ArrowLeft,
  Send, Shield, Store, Share2, Bookmark, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; type: 'user' | 'dealer' | 'admin' };
  replies?: Comment[];
}

interface PostDetail {
  id: string;
  title: string;
  content: string;
  postType: string;
  city: string | null;
  category: string | null;
  upvotes: number;
  createdAt: string;
  user: { id: string; name: string; type: 'user' | 'dealer' | 'admin' };
  comments: Comment[];
  _count: { comments: number };
}

const POST_TYPE_CONFIG: Record<string, { bg: string; color: string; icon: any; label: string }> = {
  QUESTION:   { bg: 'bg-amber-50',  color: 'text-amber-700',  icon: AlertCircle,   label: 'Question' },
  ARTICLE:    { bg: 'bg-green-50',  color: 'text-green-700',  icon: CheckCircle,   label: 'Article' },
  CASE_STUDY: { bg: 'bg-purple-50', color: 'text-purple-700', icon: null,          label: 'Case Study' },
  DISCUSSION: { bg: 'bg-gray-100',  color: 'text-gray-700',   icon: null,          label: 'Discussion' },
};

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const response = await communityApi.getPost(id);
        setPost(response.data);
      } catch (err: any) {
        setError(err.response?.status === 404 ? 'Post not found' : 'Failed to load post. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleUpvote = async () => {
    if (!isAuthenticated || !post) return;
    try {
      await communityApi.upvotePost(post.id);
      setPost(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await communityApi.createComment({ postId: post.id, content: newComment.trim() });
      const response = await communityApi.getPost(post.id);
      setPost(response.data);
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !post || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await communityApi.createComment({ postId: post.id, content: replyContent.trim(), parentId });
      const response = await communityApi.getPost(post.id);
      setPost(response.data);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to create reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getUserBadge = (userType: string) => {
    if (userType === 'dealer') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
        <Store className="w-2.5 h-2.5" />Dealer
      </span>
    );
    if (userType === 'admin') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
        <Shield className="w-2.5 h-2.5" />Admin
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        <User className="w-2.5 h-2.5" />Member
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 mb-4">
            {error || 'Post not found'}
          </div>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-4 py-2 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const typeConfig = POST_TYPE_CONFIG[post.postType] || POST_TYPE_CONFIG.DISCUSSION;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
        {/* Post */}
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              {/* Upvote */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handleUpvote}
                  disabled={!isAuthenticated}
                  className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <ThumbsUp className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-sm font-semibold text-gray-900">{post.upvotes}</span>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                  {post.category && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{post.category}</span>
                  )}
                </div>

                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">{post.title}</h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{post.user.name}</span>
                    {getUserBadge(post.user.type)}
                  </div>
                  {post.city && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{post.city}</span>
                  )}
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">{paragraph}</p>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <Share2 className="w-3.5 h-3.5" />Share
            </button>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <Bookmark className="w-3.5 h-3.5" />Save
            </button>
          </div>
        </article>

        {/* Comments */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {post._count.comments} Comments
            </h2>
          </div>

          {/* New Comment Form */}
          {isAuthenticated ? (
            <div className="p-6 border-b border-gray-100">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitComment}
                      disabled={isSubmitting || !newComment.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border-b border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-3">Sign in to join the discussion</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="divide-y divide-gray-100">
            {post.comments.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900">No comments yet</p>
                <p className="text-xs text-gray-500 mt-1">Be the first to share your thoughts!</p>
              </div>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="p-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-gray-900">{comment.user.name}</span>
                        {getUserBadge(comment.user.type)}
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Reply
                      </button>

                      {replyingTo === comment.id && isAuthenticated && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-100">
                          <textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none resize-none"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={isSubmitting || !replyContent.trim()}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-gray-900">{reply.user.name}</span>
                                  {getUserBadge(reply.user.type)}
                                  <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-xs text-gray-700">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
