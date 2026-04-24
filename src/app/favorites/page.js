import GalleryClient from '@/components/GalleryClient';

export const metadata = {
  title: 'Our Favorites - Infinity Memories',
  description: 'The most special moments.',
};

export default function FavoritesPage() {
  return (
    <main className="min-h-screen pb-20 relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-rose/20 to-transparent pointer-events-none z-[-1]" />
      <GalleryClient pageType="favorites" />
    </main>
  );
}
