'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ListCard from '@/components/lists/ListCard';
import ItemCard from '@/components/items/ItemCard';
import AddItemModal from '@/components/items/AddItemModal';
import CreateListModal from '@/components/lists/CreateListModal';
import { subscribeLists, getRecentItems } from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/AuthContext';
import { List, Item } from '@/types';

export default function HomePage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeLists(user.uid, (l) => setLists(l));
    return unsub;
  }, [user]);

  const loadRecent = useCallback(async () => {
    if (!user) return;
    const items = await getRecentItems(user.uid, 20);
    setRecentItems(items);
  }, [user]);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  function handleItemAdded() {
    loadRecent();
  }

  const myLists = lists.filter((l) => l.ownerId === user?.uid);
  const sharedLists = lists.filter((l) => l.ownerId !== user?.uid || l.visibility === 'shared');

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📎 ClipMate
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">お気に入りを、一緒に。</p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <button
          onClick={() => router.push('/search')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 text-gray-400 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          「前に見たあの投稿...」を探す
        </button>

        {/* My Lists */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">マイリスト</h2>
            <button
              onClick={() => setShowCreateList(true)}
              className="text-xs text-pink-500 font-medium"
            >
              + 新規作成
            </button>
          </div>
          {myLists.length === 0 ? (
            <button
              onClick={() => setShowCreateList(true)}
              className="w-full py-8 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 text-sm flex flex-col items-center gap-2"
            >
              <span className="text-3xl">📋</span>
              リストを作成してみよう
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {myLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          )}
        </section>

        {/* Shared Lists */}
        {sharedLists.filter(l => l.ownerId !== user?.uid).length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3">共有されているリスト</h2>
            <div className="grid grid-cols-2 gap-3">
              {sharedLists.filter(l => l.ownerId !== user?.uid).map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Items */}
        {recentItems.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-700 mb-3">最近追加した投稿</h2>
            <div className="grid grid-cols-1 gap-3">
              {recentItems.slice(0, 6).map((item) => (
                <ItemCard key={item.id} item={item} isNew={newItemIds.has(item.id)} showList />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddItem(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl z-30 active:scale-90 transition"
      >
        +
      </button>

      {showAddItem && (
        <AddItemModal
          lists={lists}
          onClose={() => setShowAddItem(false)}
          onAdded={handleItemAdded}
        />
      )}
      {showCreateList && (
        <CreateListModal onClose={() => setShowCreateList(false)} />
      )}
    </AppShell>
  );
}
