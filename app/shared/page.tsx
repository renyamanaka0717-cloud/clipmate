'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import ListCard from '@/components/lists/ListCard';
import { subscribeLists } from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/AuthContext';
import { List } from '@/types';

export default function SharedPage() {
  const { user } = useAuthContext();
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeLists(user.uid, setLists);
    return unsub;
  }, [user]);

  const sharedLists = lists.filter((l) => l.visibility === 'shared');

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">共有リスト</h1>
        <p className="text-sm text-gray-500 mb-6">みんなで一緒に集める投稿リスト</p>

        {sharedLists.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="text-5xl mb-4">👥</span>
            <p className="text-gray-500 font-medium">共有リストがありません</p>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">
              リストを作成して「共有」にするか、<br />招待リンクから参加してみよう
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sharedLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
