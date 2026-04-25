'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, User, Check, CheckCheck, ArrowLeft, MessageSquare } from 'lucide-react';

// Polling interval in ms
const POLLING_INTERVAL = 3000;

function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeConversationId = searchParams.get('conversationId');

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Initialize Auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token) {
      window.location.href = '/login';
    } else {
      try { setCurrentUser(JSON.parse(user)); } catch (e) {}
    }
  }, []);

  // Fetch Conversations (with Polling)
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle Mark as Read
  const markAsRead = async (cid) => {
    try {
      await fetch(`/api/chat/read/${cid}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error('Gagal update read status');
    }
  };

  // Fetch Messages (with Polling)
  const fetchMessages = async (cid, showLoading = false) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages/${cid}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!currentUser || !activeConversationId) return;
    
    // Saat buka percakapan baru:
    setMessages([]);
    fetchMessages(activeConversationId, true);
    markAsRead(activeConversationId);

    const interval = setInterval(() => {
      fetchMessages(activeConversationId);
      markAsRead(activeConversationId);
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [currentUser, activeConversationId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const tempText = inputText;
    setInputText('');
    setSending(true);

    try {
      const res = await fetch(`/api/chat/messages/${activeConversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: tempText })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        fetchConversations(); // Update list immediately
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const activeChatData = conversations.find(c => c._id === activeConversationId);

  return (
    <div className="max-w-6xl mx-auto h-full flex bg-white shadow-sm border-x border-gray-100">
      
      {/* SIDEBAR - DAFTAR CHAT */}
      <div className={`w-full md:w-[350px] border-r border-gray-100 flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Pesan</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Memuat obrolan...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-gray-400 h-full">
              <MessageSquare size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">Belum ada obrolan</p>
              <p className="text-xs mt-1 text-center">Kunjungi profil seseorang untuk mulai chat.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = conv._id === activeConversationId;
              const otherUser = conv.otherUser;
              const lastMsg = conv.lastMessage;

              return (
                <div 
                  key={conv._id} 
                  onClick={() => router.push(`/chat?conversationId=${conv._id}`)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-50 ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {otherUser?.profileImage ? (
                      <img src={otherUser.profileImage} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-sm text-gray-900 truncate pr-2">
                        {otherUser?.name || otherUser?.username || 'User'}
                      </h3>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {lastMsg ? formatTime(lastMsg.createdAt) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {lastMsg ? (lastMsg.senderId === currentUser?._id ? `Anda: ${lastMsg.text}` : lastMsg.text) : 'Mulai obrolan'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PANEL KANAN - ISI CHAT */}
      <div className={`flex-1 flex flex-col bg-gray-50 relative ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        {!activeConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200">
              <MessageSquare size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-600">Pesan Anda</h3>
            <p className="text-sm mt-1">Pilih chat untuk melihat pesan</p>
          </div>
        ) : (
          <>
            {/* Header Chat Aktif */}
            <div className="h-[64px] bg-white border-b border-gray-100 flex items-center px-4 shrink-0 gap-3">
              <button className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full" onClick={() => router.push('/chat')}>
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer" onClick={() => router.push(`/profile/${activeChatData?.otherUser?._id}`)}>
                {activeChatData?.otherUser?.profileImage ? (
                  <img src={activeChatData.otherUser.profileImage} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-gray-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-gray-900 cursor-pointer hover:underline" onClick={() => router.push(`/profile/${activeChatData?.otherUser?._id}`)}>
                  {activeChatData?.otherUser?.name || activeChatData?.otherUser?.username || 'User'}
                </span>
                {/* Online indicator could be added here later */}
              </div>
            </div>

            {/* Area Pesan */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center p-4"><div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-black rounded-full"></div></div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === currentUser?._id;
                  
                  return (
                    <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div 
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMine 
                            ? 'bg-black text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[9px] text-gray-400 font-medium">
                          {formatTime(msg.createdAt)}
                        </span>
                        {isMine && (
                          <span className="ml-1">
                            {msg.status === 'read' ? (
                              <CheckCheck size={12} className="text-blue-500" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck size={12} className="text-gray-400" />
                            ) : (
                              <Check size={12} className="text-gray-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Pesan */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-safe">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                  maxLength={500}
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || sending}
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md"
                >
                  <Send size={16} className="ml-[-2px] mt-[1px]" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
