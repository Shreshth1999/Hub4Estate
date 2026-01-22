import { useState, useEffect } from 'react';
import { chatApi } from '../../lib/api';
import { CardSkeleton, Alert } from '../../components/ui';
import {
  MessageSquare, User, Clock, Search, ChevronRight,
  Shield, X, Bot
} from 'lucide-react';

interface ChatSession {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  title?: string;
  status: string;
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
  _count?: { messages: number };
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Stats {
  totalSessions: number;
  totalMessages: number;
  activeSessions: number;
  recentSessions: number;
  avgMessagesPerSession: number;
}

export function AdminChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        chatApi.getSessions({ page, limit: 20, search: searchQuery || undefined }),
        chatApi.getChatStats(),
      ]);
      setSessions(sessionsRes.data.sessions);
      setTotalPages(sessionsRes.data.pagination.totalPages);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery]);

  const handleViewSession = async (session: ChatSession) => {
    setSelectedSession(session);
    setIsLoadingMessages(true);
    try {
      const response = await chatApi.getSession(session.id);
      setSessionMessages(response.data.session.messages || []);
    } catch (error) {
      console.error('Failed to fetch session messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">AI Chat Sessions</h1>
              <p className="text-neutral-300 font-medium">View AI assistant conversations</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white border-2 border-neutral-200 p-6">
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Total Sessions
            </p>
            <p className="text-3xl font-black text-neutral-900">{stats?.totalSessions || 0}</p>
          </div>
          <div className="bg-white border-2 border-neutral-200 p-6">
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Total Messages
            </p>
            <p className="text-3xl font-black text-neutral-900">{stats?.totalMessages || 0}</p>
          </div>
          <div className="bg-green-50 border-2 border-green-200 p-6">
            <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Active</p>
            <p className="text-3xl font-black text-green-900">{stats?.activeSessions || 0}</p>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 p-6">
            <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">
              This Week
            </p>
            <p className="text-3xl font-black text-purple-900">{stats?.recentSessions || 0}</p>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 p-6">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">
              Avg. Messages
            </p>
            <p className="text-3xl font-black text-blue-900">{stats?.avgMessagesPerSession || 0}</p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email, name, or topic..."
              className="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-neutral-900 text-white font-bold hover:bg-neutral-800"
          >
            Search
          </button>
        </form>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Alert>No chat sessions found.</Alert>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white border-2 border-neutral-200 p-6 cursor-pointer hover:shadow-brutal transition-all"
                onClick={() => handleViewSession(session)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-5 h-5 text-accent-500" />
                      <span className="font-bold text-neutral-900">
                        {session.title || 'Untitled Chat'}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-bold uppercase ${
                          session.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      {session.userEmail ? (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {session.userEmail}
                        </span>
                      ) : session.userName ? (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {session.userName}
                        </span>
                      ) : (
                        <span className="text-neutral-400">Anonymous user</span>
                      )}
                      <span className="bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                        {session._count?.messages || session.messageCount} messages
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.lastMessageAt
                        ? new Date(session.lastMessageAt).toLocaleDateString()
                        : new Date(session.createdAt).toLocaleDateString()}
                    </p>
                    <ChevronRight className="w-5 h-5 text-neutral-300 mt-2 ml-auto" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border-2 border-neutral-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border-2 border-neutral-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Chat Detail Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white max-w-3xl w-full max-h-[90vh] flex flex-col">
              <div className="border-b-2 border-neutral-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    {selectedSession.title || 'Chat Session'}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {selectedSession.userEmail ||
                      selectedSession.userName ||
                      'Anonymous User'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingMessages ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-neutral-500">Loading messages...</p>
                  </div>
                ) : sessionMessages.length === 0 ? (
                  <p className="text-center text-neutral-500 py-8">No messages in this session</p>
                ) : (
                  sessionMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${
                          message.role === 'user' ? 'bg-neutral-900' : 'bg-accent-500'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] p-4 ${
                          message.role === 'user'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-neutral-400' : 'text-neutral-500'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
