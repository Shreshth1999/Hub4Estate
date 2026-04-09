import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../lib/store';
import { Send, User, Building2, Clock, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderType: 'user' | 'dealer';
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface RFQChatProps {
  rfqId: string;
  dealerId?: string;
  dealerName?: string;
  onSendMessage?: (message: string) => Promise<void>;
}

// Mock messages for demo - in production, this would come from an API
const generateMockMessages = (rfqId: string): Message[] => {
  return [
    {
      id: '1',
      senderId: 'user-1',
      senderType: 'user',
      senderName: 'Rahul Sharma',
      content: 'Hi, I need a quote for my 3BHK apartment wiring. Can you include Polycab wires?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: '2',
      senderId: 'dealer-1',
      senderType: 'dealer',
      senderName: 'Krishna Electricals',
      content: 'Hello! Yes, we can include Polycab wires. We have good stock of their FRLS range. Would you prefer 1.5mm or 2.5mm for the room wiring?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: '3',
      senderId: 'user-1',
      senderType: 'user',
      senderName: 'Rahul Sharma',
      content: '2.5mm for AC points and 1.5mm for regular points. Also need MCBs - can you suggest a good brand?',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: '4',
      senderId: 'dealer-1',
      senderType: 'dealer',
      senderName: 'Krishna Electricals',
      content: 'For MCBs, I recommend Havells or Schneider - both are reliable. Havells is slightly more budget-friendly while Schneider has better overload protection. I\'ll include both options in my quote.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: '5',
      senderId: 'dealer-1',
      senderType: 'dealer',
      senderName: 'Krishna Electricals',
      content: 'I\'ve submitted my quote. Please check and let me know if you have any questions!',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
  ];
};

export function RFQChat({ rfqId, dealerId, dealerName, onSendMessage }: RFQChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In production, fetch messages from API
    setMessages(generateMockMessages(rfqId));
  }, [rfqId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      // In production, send to API
      if (onSendMessage) {
        await onSendMessage(newMessage);
      }

      // Add message to local state
      const message: Message = {
        id: Date.now().toString(),
        senderId: user?.id || 'current-user',
        senderType: user?.type === 'dealer' ? 'dealer' : 'user',
        senderName: user?.name || 'You',
        content: newMessage,
        createdAt: new Date().toISOString(),
        read: false,
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' }) + ' ' +
        date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const isCurrentUser = (senderId: string) => {
    return senderId === user?.id || senderId === 'current-user';
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
            {user?.type === 'dealer' ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Building2 className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {user?.type === 'dealer' ? 'Chat with Buyer' : dealerName || 'Chat with Dealer'}
            </h3>
            <p className="text-xs text-gray-500">RFQ #{rfqId.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Start the conversation by sending a message</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = isCurrentUser(message.senderId);
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl overflow-hidden ${
                    isMine
                      ? 'bg-gray-900 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  }`}
                >
                  {!isMine && (
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        {message.senderType === 'dealer' ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {message.senderName}
                      </span>
                    </div>
                  )}
                  <div className="px-4 py-2">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`px-4 pb-2 flex items-center gap-2 ${isMine ? 'justify-end' : ''}`}>
                    <span className={`text-xs ${isMine ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(message.createdAt)}
                    </span>
                    {isMine && (
                      message.read ? (
                        <CheckCheck className="w-3 h-3 text-blue-400" />
                      ) : (
                        <Check className="w-3 h-3 text-gray-400" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none text-sm bg-white"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="px-3 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Messages are typically responded to within 24 hours
        </p>
      </div>
    </div>
  );
}

// Conversation list component for showing multiple chats
interface Conversation {
  id: string;
  rfqId: string;
  rfqTitle: string;
  otherPartyName: string;
  otherPartyType: 'user' | 'dealer';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string) => void;
  selectedId?: string;
}

export function ConversationList({ conversations, onSelectConversation, selectedId }: ConversationListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Messages</h3>
      </div>

      {conversations.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="text-xs mt-1">Your RFQ conversations will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedId === conv.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  {conv.otherPartyType === 'dealer' ? (
                    <Building2 className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {conv.otherPartyName}
                    </h4>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {conv.rfqTitle}
                  </p>
                  <p className="text-xs text-gray-600 truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-amber-600 text-white text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
