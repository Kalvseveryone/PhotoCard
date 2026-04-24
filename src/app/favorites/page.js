import GalleryClient from '@/components/GalleryClient';

export const metadata = {
  title: 'Favorites - KalUpdateApp',
  description: 'Your favorite memories.',
};

export default function FavoritesPage() {
  return (
    <div className="pb-20">
      <GalleryClient pageType="favorites" />
    </div>
  );
}
