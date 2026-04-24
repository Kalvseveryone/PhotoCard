import './globals.css';
import AudioPlayer from '@/components/AudioPlayer';
import Header from '@/components/Header';

export const metadata = {
  title: 'KalUpdateApp',
  description: 'Minimalist Photo Gallery and Stories',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-white text-black min-h-screen flex flex-col relative selection:bg-black selection:text-white">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        {/* Optional Music Player */}
        {/* <AudioPlayer /> */}
      </body>
    </html>
  );
}
