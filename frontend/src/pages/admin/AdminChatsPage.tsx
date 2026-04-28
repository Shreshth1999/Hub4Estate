import { useState, useEffect } from 'react';
import { chatApi } from '../../lib/api';
import {
  MessageSquare, User, Clock, Search, ChevronRight,
  X, Bot, Loader2, Sparkles, TrendingUp, Zap,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-lg font-semibold text-gray-900">AI Chat Sessions</h1>
        <p className="text-sm text-gray-500 mt-0.5">View AI assistant conversations</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Sessions',  value: stats?.totalSessions || 0 },
            { label: 'Total Messages',  value: stats?.totalMessages || 0 },
            { label: 'Active',          value: stats?.activeSessions || 0 },
            { label: 'This Week',       value: stats?.recentSessions || 0 },
            { label: 'Avg. Messages',   value: stats?.avgMessagesPerSession || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Engagement Intelligence */}
        {stats && stats.totalSessions > 0 && (() => {
          const avg = stats.avgMessagesPerSession;
          const activeRatio = stats.totalSessions > 0
            ? Math.round((stats.activeSessions / stats.totalSessions) * 100)
            : 0;
          const recentRatio = stats.totalSessions > 0
            ? Math.round((stats.recentSessions / stats.totalSessions) * 100)
            : 0;
          const engagementLabel = avg >= 10 ? 'High engagement' : avg >= 5 ? 'Good engagement' : 'Low engagement';
          const engagementColor = avg >= 10 ? 'text-green-700' : avg >= 5 ? 'text-amber-700' : 'text-red-600';
          return (
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-violet-700">Volt Engagement Intelligence</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/70 rounded-lg px-3 py-2.5">
                  <p className="text-[11px] text-gray-400 mb-0.5">Session quality</p>
                  <p className={`text-sm font-semibold ${engagementColor}`}>{engagementLabel}</p>
                  <p className="text-xs text-gray-500">{avg} msgs/session average</p>
                </div>
                <div className="bg-white/70 rounded-lg px-3 py-2.5">
                  <p className="text-[11px] text-gray-400 mb-0.5">Active rate</p>
                  <p className={`text-sm font-semibold ${activeRatio > 20 ? 'text-green-600' : 'text-gray-700'}`}>
                    {activeRatio}%
                  </p>
                  <p className="text-xs text-gray-500">of sessions currently active</p>
                </div>
                <div className="bg-white/70 rounded-lg px-3 py-2.5">
                  <p className="text-[11px] text-gray-400 mb-0.5">Weekly traction</p>
                  <p className={`text-sm font-semibold ${recentRatio > 30 ? 'text-green-600' : 'text-amber-600'}`}>
                    {recentRatio}% new this week
                  </p>
                  <p className="text-xs text-gray-500">{stats.recentSessions} sessions in 7 days</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email, name, or topic..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No chat sessions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                onClick={() => handleViewSession(session)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {session.title || 'Untitled Chat'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                        session.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {session.userEmail || session.userName || 'Anonymous user'}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {session._count?.messages || session.messageCount} messages
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(session.lastMessageAt || session.createdAt).toLocaleDateString()}
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Chat Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedSession.title || 'Chat Session'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedSession.userEmail || selectedSession.userName || 'Anonymous User'}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <p className="text-sm text-gray-400">Loading messages...</p>
                </div>
              ) : sessionMessages.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">No messages in this session</p>
              ) : (
                sessionMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      message.role === 'user' ? 'bg-gray-900' : 'bg-gray-200'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1.5 ${message.role === 'user' ? 'text-gray-400' : 'text-gray-400'}`}>
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
  );
}
