import ProfileClient from '@/components/ProfileClient';

export const metadata = {
  title: 'User Profile - KalUpdateApp',
};

export default async function PublicProfilePage({ params }) {
  const { userId } = await params;
  return (
    <div className="bg-white">
      <ProfileClient userId={userId} />
    </div>
  );
}
