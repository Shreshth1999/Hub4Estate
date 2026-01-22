import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { communityApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { LoadingSpinner, Alert } from '../../components/ui';
import {
  ThumbsUp, MessageCircle, Clock, User, MapPin, ArrowLeft,
  Send, Shield, Store, MoreHorizontal, Share2, Bookmark,
  CheckCircle, AlertCircle
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    type: 'user' | 'dealer' | 'admin';
  };
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
  user: {
    id: string;
    name: string;
    type: 'user' | 'dealer' | 'admin';
  };
  comments: Comment[];
  _count: {
    comments: number;
  };
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

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
        console.error('Failed to fetch post:', err);
        if (err.response?.status === 404) {
          setError('Post not found');
        } else {
          setError('Failed to load post. Please try again.');
        }
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
      await communityApi.createComment({
        postId: post.id,
        content: newComment.trim(),
      });

      // Refresh post to get new comments
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
      await communityApi.createComment({
        postId: post.id,
        content: replyContent.trim(),
        parentId,
      });

      // Refresh post to get new comments
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
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-bold rounded">
            <User className="w-3 h-3" />
            Member
          </span>
        );
    }
  };

  const getPostTypeBadge = (postType: string) => {
    switch (postType) {
      case 'QUESTION':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase">
            <AlertCircle className="w-3 h-3" />
            Question
          </span>
        );
      case 'ARTICLE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase">
            <CheckCircle className="w-3 h-3" />
            Article
          </span>
        );
      case 'CASE_STUDY':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase">
            Case Study
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold uppercase">
            Discussion
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-3xl">
          <Alert variant="error">{error || 'Post not found'}</Alert>
          <Link to="/community" className="btn-secondary mt-4 inline-flex">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-neutral-200">
        <div className="container-custom py-4">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          {/* Post Card */}
          <article className="bg-white border-2 border-neutral-200 mb-8">
            {/* Post Header */}
            <div className="p-6 border-b-2 border-neutral-100">
              <div className="flex items-start gap-4">
                {/* Upvote */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleUpvote}
                    disabled={!isAuthenticated}
                    className="w-12 h-12 bg-neutral-100 hover:bg-neutral-900 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-black text-neutral-900 mt-2">{post.upvotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {getPostTypeBadge(post.postType)}
                    {post.category && (
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold uppercase">
                        {post.category}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-black text-neutral-900 mb-4">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-neutral-900">{post.user.name}</span>
                      {getUserBadge(post.user.type)}
                    </div>
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
                  </div>
                </div>
              </div>
            </div>

            {/* Post Body */}
            <div className="p-6">
              <div className="prose prose-neutral max-w-none">
                {post.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="text-neutral-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Post Actions */}
            <div className="px-6 py-4 border-t-2 border-neutral-100 flex items-center gap-4">
              <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-medium">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-medium">
                <Bookmark className="w-4 h-4" />
                Save
              </button>
            </div>
          </article>

          {/* Comments Section */}
          <div className="bg-white border-2 border-neutral-200">
            <div className="p-6 border-b-2 border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {post._count.comments} Comments
              </h2>
            </div>

            {/* New Comment Form */}
            {isAuthenticated ? (
              <div className="p-6 border-b-2 border-neutral-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="input-primary w-full resize-none"
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleSubmitComment}
                        disabled={isSubmitting || !newComment.trim()}
                        className="btn-primary"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border-b-2 border-neutral-100 bg-neutral-50 text-center">
                <p className="text-neutral-600 mb-3">Sign in to join the discussion</p>
                <Link to="/login" className="btn-primary inline-flex">
                  Sign In
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="divide-y-2 divide-neutral-100">
              {post.comments.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <p className="font-medium">No comments yet</p>
                  <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="p-6">
                    {/* Main Comment */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-neutral-900">{comment.user.name}</span>
                          {getUserBadge(comment.user.type)}
                          <span className="text-sm text-neutral-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-neutral-700 mb-3">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                          >
                            Reply
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && isAuthenticated && (
                          <div className="mt-4 pl-4 border-l-2 border-neutral-200">
                            <textarea
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              rows={2}
                              className="input-primary w-full resize-none text-sm"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="btn-ghost text-sm py-2 px-3"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={isSubmitting || !replyContent.trim()}
                                className="btn-primary text-sm py-2 px-3"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-4 pl-4 border-l-2 border-neutral-200">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-neutral-500" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-neutral-900 text-sm">{reply.user.name}</span>
                                    {getUserBadge(reply.user.type)}
                                    <span className="text-xs text-neutral-500">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-neutral-700 text-sm">{reply.content}</p>
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
    </div>
  );
}
