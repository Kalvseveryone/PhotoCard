import ChatClient from '@/components/ChatClient';
import { Suspense } from 'react';

export const metadata = {
  title: 'Chat - KalUpdateApp',
  description: 'Realtime chat',
};

export default function ChatPage() {
  return (
    <div className="bg-white h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-500">Memuat Obrolan...</div>}>
        <ChatClient />
      </Suspense>
    </div>
  );
}
