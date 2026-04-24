import GalleryClient from '@/components/GalleryClient';

export const metadata = {
  title: 'Gallery - KalUpdateApp',
  description: 'Minimalist Photo Gallery',
};

export default function Home() {
  return (
    <div className="pb-20">
      <GalleryClient pageType="home" />
    </div>
  );
}
