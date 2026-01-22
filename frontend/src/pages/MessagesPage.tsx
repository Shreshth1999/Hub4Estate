import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { RFQChat, ConversationList } from '../components/RFQChat';
import { MessageSquare, ArrowLeft } from 'lucide-react';

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

// Mock conversations for demo
const getMockConversations = (userType: string): Conversation[] => {
  if (userType === 'dealer') {
    return [
      {
        id: '1',
        rfqId: 'rfq-001',
        rfqTitle: 'Wiring for 3BHK Apartment',
        otherPartyName: 'Rahul Sharma',
        otherPartyType: 'user',
        lastMessage: 'Thanks for the quote! Can you include installation?',
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        unreadCount: 1,
      },
      {
        id: '2',
        rfqId: 'rfq-002',
        rfqTitle: 'MCB Distribution Setup',
        otherPartyName: 'Priya Patel',
        otherPartyType: 'user',
        lastMessage: 'I\'ve accepted your quote. When can you deliver?',
        lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
      },
      {
        id: '3',
        rfqId: 'rfq-003',
        rfqTitle: 'Complete Home Electrical',
        otherPartyName: 'Amit Verma',
        otherPartyType: 'user',
        lastMessage: 'Can you provide warranty documentation?',
        lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        unreadCount: 2,
      },
    ];
  }

  // User conversations
  return [
    {
      id: '1',
      rfqId: 'rfq-001',
      rfqTitle: 'Wiring for 3BHK Apartment',
      otherPartyName: 'Krishna Electricals',
      otherPartyType: 'dealer',
      lastMessage: 'I\'ve submitted my quote. Please check and let me know!',
      lastMessageTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      unreadCount: 1,
    },
    {
      id: '2',
      rfqId: 'rfq-001',
      rfqTitle: 'Wiring for 3BHK Apartment',
      otherPartyName: 'Sharma Electric Store',
      otherPartyType: 'dealer',
      lastMessage: 'We can offer 10% discount on bulk orders.',
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0,
    },
    {
      id: '3',
      rfqId: 'rfq-002',
      rfqTitle: 'Switches for Office',
      otherPartyName: 'Modern Electricals',
      otherPartyType: 'dealer',
      lastMessage: 'The Anchor Roma series would be perfect for your needs.',
      lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0,
    },
  ];
};

export function MessagesPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    // Load conversations
    const mockConversations = getMockConversations(user?.type || 'user');
    setConversations(mockConversations);

    // Check for conversation ID in URL
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      const conv = mockConversations.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        setIsMobileView(true);
      }
    }
  }, [user?.type, searchParams]);

  const handleSelectConversation = (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setSelectedConversation(conv);
      setIsMobileView(true);

      // Mark as read
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  };

  const handleBackToList = () => {
    setIsMobileView(false);
    setSelectedConversation(null);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white">
        <div className="container-custom py-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            <h1 className="text-2xl font-black">Messages</h1>
            {totalUnread > 0 && (
              <span className="bg-accent-500 text-white text-sm font-bold px-2 py-0.5">
                {totalUnread} new
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {conversations.length === 0 ? (
          <div className="bg-white border-2 border-neutral-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">No messages yet</h2>
            <p className="text-neutral-500 max-w-md mx-auto">
              {user?.type === 'dealer'
                ? 'When you submit quotes on RFQs, you can message buyers here.'
                : 'When dealers respond to your RFQs, you can chat with them here.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List - Hidden on mobile when chat is open */}
            <div className={`${isMobileView ? 'hidden lg:block' : 'block'}`}>
              <ConversationList
                conversations={conversations}
                onSelectConversation={handleSelectConversation}
                selectedId={selectedConversation?.id}
              />
            </div>

            {/* Chat Area */}
            <div className={`lg:col-span-2 ${!isMobileView && !selectedConversation ? 'hidden lg:block' : 'block'}`}>
              {selectedConversation ? (
                <div>
                  {/* Mobile back button */}
                  <button
                    onClick={handleBackToList}
                    className="lg:hidden flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to messages
                  </button>

                  <RFQChat
                    rfqId={selectedConversation.rfqId}
                    dealerId={selectedConversation.otherPartyType === 'dealer' ? selectedConversation.id : undefined}
                    dealerName={selectedConversation.otherPartyType === 'dealer' ? selectedConversation.otherPartyName : undefined}
                  />
                </div>
              ) : (
                <div className="bg-white border-2 border-neutral-200 p-12 text-center hidden lg:block">
                  <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="font-bold text-neutral-900 mb-2">Select a conversation</h3>
                  <p className="text-neutral-500">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
