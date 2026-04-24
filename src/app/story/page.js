import StoryViewer from '@/components/StoryViewer';

export const metadata = {
  title: 'Our Stories - 24 Hours',
  description: 'Momentary flashes of our beautiful journey.',
};

export default function StoryPage() {
  return (
    <main className="min-h-screen bg-[#fff0f5]">
      <StoryViewer />
    </main>
  );
}
