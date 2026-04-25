import ProfileClient from '@/components/ProfileClient';

export const metadata = {
  title: 'My Profile - KalUpdateApp',
};

export default function PrivateProfilePage() {
  return (
    <div className="bg-white">
      <ProfileClient userId="me" />
    </div>
  );
}
