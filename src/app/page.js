import GalleryClient from '@/components/GalleryClient';
import StoryViewer from '@/components/StoryViewer';

export const metadata = {
  title: 'Gallery - MemoriesOfMutiaHaekal',
  description: 'Minimalist Photo Gallery',
};

export default function Home() {
  return (
    <div className="pb-20 bg-white">
      <StoryViewer compact={true} />
      <GalleryClient pageType="home" />
    </div>
  );
}
