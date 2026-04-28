import GalleryClient from '@/components/GalleryClient';

export const metadata = {
  title: 'Liked Photos - MemoriesOfMutiaHaekal',
  description: 'Your liked memories.',
};

export default function FavoritesPage() {
  return (
    <div className="pb-20">
      <GalleryClient pageType="favorites" />
    </div>
  );
}
