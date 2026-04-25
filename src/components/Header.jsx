'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, LogOut, User } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token && pathname !== '/login' && pathname !== '/register') {
      window.location.href = '/login';
    } else if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch(e) {}
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 backdrop-blur-md bg-opacity-90 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-y-3">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-black text-white p-1.5 sm:p-2 rounded-lg group-hover:bg-gray-800 transition-colors">
            <Camera size={18} />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-black">KalUpdateApp</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
          <Link href="/" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black transition-colors uppercase tracking-wider">Gallery</Link>
          <Link href="/favorites" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black transition-colors uppercase tracking-wider">Favorites</Link>
          {user && (
            <Link href="/chat" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black transition-colors uppercase tracking-wider">Chat</Link>
          )}
          
          {user ? (
            <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
              <Link href="/profile" className="text-xs font-bold flex items-center gap-1 text-black hover:underline hover:text-blue-600 transition-colors">
                <User size={14}/> {user.username}
              </Link>
              <button onClick={handleLogout} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-1" title="Logout"><LogOut size={14}/></button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
              <Link href="/login" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black transition-colors uppercase tracking-wider">Login</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
