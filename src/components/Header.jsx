import Link from 'next/link';
import { Camera } from 'lucide-react';

export default function Header() {
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
          <Link href="/story" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black transition-colors relative uppercase tracking-wider">
            Stories
            <span className="absolute -top-1 -right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
            <span className="absolute -top-1 -right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
