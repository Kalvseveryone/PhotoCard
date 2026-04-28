import StoryViewer from '@/components/StoryViewer';

export const metadata = {
  title: 'Live Stories - MemoriesOfMutiaHaekal',
  description: 'View 24h stories.',
};

export default function StoryPage() {
  return (
    <div className="bg-white min-h-[calc(100vh-64px)]">
      <StoryViewer />
    </div>
  );
}
