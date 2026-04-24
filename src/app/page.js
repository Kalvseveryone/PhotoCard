import GalleryClient from '@/components/GalleryClient';

export const metadata = {
  title: 'Our Infinity Memories',
  description: 'A romantic photo album for us.',
};

export default function Home() {
  return (
    <main className="min-h-screen pb-20 relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-pink/30 to-transparent pointer-events-none z-[-1]" />
      <GalleryClient pageType="home" />
    </main>
  );
}
