'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Paperclip } from 'lucide-react';
import { useAuthContext } from '@/lib/AuthContext';

export default function RootPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/home' : '/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Paperclip size={32} className="text-pink-400" strokeWidth={1.8} />
        <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
