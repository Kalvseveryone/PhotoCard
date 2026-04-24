import './globals.css';
import AudioPlayer from '@/components/AudioPlayer';

export const metadata = {
  title: 'Romantic Album',
  description: 'A dedicated place for all our memories.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-pink selection:text-white relative">
        {children}
        <AudioPlayer />
      </body>
    </html>
  );
}
