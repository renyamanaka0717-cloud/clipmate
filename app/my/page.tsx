'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ListCard from '@/components/lists/ListCard';
import CreateListModal from '@/components/lists/CreateListModal';
import { subscribeLists } from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/AuthContext';
import { List } from '@/types';

export default function MyPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeLists(user.uid, setLists);
    return unsub;
  }, [user]);

  const myLists = lists.filter((l) => l.ownerId === user?.uid);

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4">
        {/* Profile */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-2xl font-bold text-white shadow-sm">
            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{user?.displayName || 'ユーザー'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="ml-auto w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-pink-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-pink-600">{myLists.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">マイリスト</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{lists.filter(l => l.visibility === 'shared').length}</p>
            <p className="text-xs text-gray-500 mt-0.5">共有リスト</p>
          </div>
        </div>

        {/* My Lists */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">マイリスト</h2>
          <button onClick={() => setShowCreate(true)} className="text-xs text-pink-500 font-medium">+ 新規作成</button>
        </div>

        {myLists.length === 0 ? (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-10 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 text-sm flex flex-col items-center gap-2"
          >
            <span className="text-3xl">📋</span>
            最初のリストを作成しよう
          </button>
        ) : (
          <div className="space-y-3">
            {myLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateListModal onClose={() => setShowCreate(false)} />}
    </AppShell>
  );
}
