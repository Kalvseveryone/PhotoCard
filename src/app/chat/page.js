import ChatClient from '@/components/ChatClient';

export const metadata = {
  title: 'Chat - KalUpdateApp',
  description: 'Realtime chat',
};

export default function ChatPage() {
  return (
    <div className="bg-gray-50 h-[calc(100vh-64px)] overflow-hidden">
      <ChatClient />
    </div>
  );
}
