'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ClipboardList, ChevronRight, Users } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import CreateListModal from '@/components/lists/CreateListModal';
import ListIcon from '@/components/lists/ListIcon';
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
            className="ml-auto w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <Settings size={17} strokeWidth={1.6} />
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
            <ClipboardList size={32} className="text-gray-300" strokeWidth={1.5} />
            最初のリストを作成しよう
          </button>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {myLists.map((list, i) => (
              <div key={list.id}>
                <button
                  onClick={() => router.push(`/lists/${list.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition text-left"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 flex-shrink-0">
                    <ListIcon name={list.emoji} size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{list.title}</p>
                    {list.visibility === 'shared' && (
                      <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                        <Users size={10} strokeWidth={2} />
                        共有中
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" strokeWidth={2.5} />
                </button>
                {i < myLists.length - 1 && <div className="ml-16 h-px bg-gray-100" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateListModal onClose={() => setShowCreate(false)} />}
    </AppShell>
  );
}
