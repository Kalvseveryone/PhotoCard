'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const newNotifications = data.notifications;
        
        // Check for new notifications to show toast
        if (notifications.length > 0) {
          const latestOld = notifications[0]._id;
          const trulyNew = newNotifications.filter(n => n._id > latestOld && !n.isRead);
          if (trulyNew.length > 0) {
            setToast(trulyNew[0]);
            setTimeout(() => setToast(null), 5000);
          }
        }

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [token, notifications.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationLink = (n) => {
    if (n.type === 'like_photo') return `/#photo-${n.referenceId}`;
    if (n.type === 'like_story') return `/story`;
    return '/';
  };

  const getNotificationText = (n) => {
    const username = n.senderId?.username || 'Seseorang';
    if (n.type === 'like_photo') return `${username} menyukai foto Anda`;
    if (n.type === 'like_story') return `${username} menyukai story Anda`;
    return `${username} berinteraksi dengan Anda`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed md:absolute top-16 md:top-auto md:right-0 right-4 left-4 md:left-auto mt-2 md:w-80 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-sm text-black uppercase tracking-wider">Notifikasi</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black"><X size={16}/></button>
          </div>
          
          <div className="max-h-96 overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs uppercase tracking-widest">Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link 
                  key={n._id} 
                  href={getNotificationLink(n)}
                  onClick={() => {
                    markAsRead(n._id);
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-3 p-4 border-b border-gray-50 transition-colors ${n.isRead ? 'bg-white opacity-70' : 'bg-blue-50/30 hover:bg-blue-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                    {n.senderId?.profilePicture ? (
                      <img src={n.senderId.profilePicture} className="w-full h-full object-cover" />
                    ) : (
                      <Heart size={16} className="text-red-400 fill-current" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">
                      <span className="font-bold">{n.senderId?.username || 'Seseorang'}</span> {n.type === 'like_photo' ? 'menyukai foto Anda' : 'menyukai story Anda'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shadow-sm"></div>}
                </Link>
              ))
            )}
          </div>
          
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <button className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-widest">Lihat Semua</button>
          </div>
        </div>
      )}

      {/* Toast Popup */}
      {toast && (
        <div className="fixed top-24 md:top-20 right-4 left-4 md:left-auto z-[100] animate-slide-in">
          <div className="bg-black text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Heart size={14} className="text-red-400 fill-current" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold leading-none">{toast.senderId?.username || 'Seseorang'}</p>
              <p className="text-[10px] text-white/70 mt-1">{getNotificationText(toast)}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-white/40 hover:text-white ml-2">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
