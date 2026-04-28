import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { messagingApi } from '../lib/api';
import {
  MessageSquare, ArrowLeft, Send, Loader2, Inbox, Search, User,
} from 'lucide-react';

interface Participant {
  id: string;
  type: string;
}

interface LastMessage {
  id: string;
  content: string;
  senderType: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string | null;
  type: string;
  referenceId: string | null;
  referenceType: string | null;
  participants: Participant[];
  lastMessage: LastMessage | null;
  unreadCount: number;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  type: string;
  content: string;
  metadata: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export function MessagesPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const currentAccountId = user?.id;

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await messagingApi.getConversations();
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Open conversation from URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        setIsMobileView(true);
      }
    }
  }, [searchParams, conversations]);

  // Fetch messages when a conversation is selected
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await messagingApi.getMessages(conversationId);
      setMessages(res.data.messages || []);
      // Mark as read
      await messagingApi.markRead(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);

      // Poll for new messages every 5 seconds (until Socket.io is added)
      pollRef.current = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 5000);

      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [selectedConversation, fetchMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsMobileView(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await messagingApi.sendMessage(selectedConversation.id, {
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage('');
      // Update conversation list with new last message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: {
                  id: res.data.message.id,
                  content: res.data.message.content,
                  senderType: res.data.message.senderType,
                  senderId: res.data.message.senderId,
                  createdAt: res.data.message.createdAt,
                },
              }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.lastMessage?.content.toLowerCase().includes(q)
    );
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-gray-700" />
            <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
            {totalUnread > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loadingConversations ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h2 className="text-base font-semibold text-gray-900 mb-2">No messages yet</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Messages will appear here when you start conversations with dealers or buyers through inquiries and RFQs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
            {/* Conversation List */}
            <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col ${
              isMobileView ? 'hidden lg:flex' : 'flex'
            }`}>
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {conv.title || `Conversation`}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-[11px] text-gray-400 flex-shrink-0">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-xs text-gray-500 truncate">
                            {conv.lastMessage.senderId === currentAccountId ? 'You: ' : ''}
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col ${
              !isMobileView && !selectedConversation ? 'hidden lg:flex' : 'flex'
            }`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 bg-white">
                    <button
                      onClick={() => { setIsMobileView(false); setSelectedConversation(null); }}
                      className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedConversation.title || 'Conversation'}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {selectedConversation.type === 'inquiry' ? 'Inquiry Chat' : 'Direct Message'}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-10">
                        <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.senderId === currentAccountId;
                        const isSystem = msg.senderType === 'system';
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            {isSystem ? (
                              <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full">
                                {msg.content}
                              </div>
                            ) : (
                              <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                                <div className={`px-4 py-2.5 rounded-2xl ${
                                  isOwn
                                    ? 'bg-gray-900 text-white rounded-br-md'
                                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                                }`}>
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <p className={`text-[10px] text-gray-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                                  {formatTime(msg.createdAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="px-4 py-3 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 resize-none max-h-32"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-colors flex-shrink-0"
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Select a conversation</h3>
                    <p className="text-xs text-gray-400">Choose from the list to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
