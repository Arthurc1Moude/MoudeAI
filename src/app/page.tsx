'use client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// 确保文本在服务端和客户端完全一致
const LoadingText = () => {
  const [text] = useState('Loading your experience...'); // 使用状态确保一致性
  return <p className="text-muted-foreground">{text}</p>;
};

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.replace('/chat');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <LoadingText />
    </div>
  );
}
